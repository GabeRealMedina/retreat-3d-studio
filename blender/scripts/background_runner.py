"""Execute sequential commands on Blender's main thread through process pipes."""
import contextlib
import io
import json
import re
import sys
import traceback

PREFIX = "HF_BLENDER_JSON:"
MAX_RESULT = 4 * 1024 * 1024
MAX_REQUEST = 8 * 1024 * 1024
SESSION = {"dirty": False}


class BoundedText(io.TextIOBase):
    def __init__(self):
        self.value = ""

    def write(self, text):
        self.value += text[:max(0, 65536 - len(self.value))]
        return len(text)

    def flush(self):
        pass


def execute(request):
    job_id = request["job_id"]
    if not isinstance(job_id, str) or not re.fullmatch(r"[a-f0-9]{32}", job_id):
        raise ValueError("Invalid job_id")
    code = request["code"]
    if not isinstance(code, str) or not 0 < len(code) <= 1_000_000:
        raise ValueError("Invalid Python source length")
    mutates = request.get("mutates", True)
    if not isinstance(mutates, bool):
        raise ValueError("Invalid mutation flag")
    stdout, stderr = BoundedText(), BoundedText()
    response = {"job_id": job_id, "state": "completed"}
    try:
        namespace = {"__name__": "__blender_mcp__", "_mcp_session": SESSION}
        # Background RNA writes may leave bpy.data.is_dirty false, even after partial failure.
        if mutates:
            SESSION["dirty"] = True
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            exec(compile(code, "<blender-mcp>", "exec"), namespace)
        result = namespace.get("result")
        encoded = json.dumps(result, allow_nan=False, ensure_ascii=True)
        if len(encoded) > MAX_RESULT:
            raise ValueError("Result exceeds 4 MiB; return a local file path instead")
        response.update(ok=True, result=result)
    except BaseException:
        response.update(ok=False, error=traceback.format_exc()[-65536:])
    response.update(stdout=stdout.value, stderr=stderr.value)
    return response


def main():
    import bpy
    output, source = sys.stdout, sys.stdin

    def send(value):
        output.write("\n" + PREFIX + json.dumps(value, allow_nan=False, ensure_ascii=True) + "\n")
        output.flush()

    send({"ready": True, "background": bpy.app.background, "version": list(bpy.app.version)})
    while True:
        line = source.readline(MAX_REQUEST + 1)
        if not line:
            break
        if len(line) > MAX_REQUEST or not line.endswith("\n"):
            raise ValueError("Invalid request frame")
        send(execute(json.loads(line)))


if __name__ == "__main__":
    main()
