import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { access, readdir, stat } from "node:fs/promises";
import { constants } from "node:fs";
import { delimiter, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { z } from "zod";

const PREFIX = "HF_BLENDER_JSON:";
const MAX_LINE = 6 * 1024 * 1024;
const jobSchema = z.object({
  job_id: z.string().regex(/^[a-f0-9]{32}$/), state: z.literal("completed"),
  ok: z.boolean(), result: z.unknown().optional(), error: z.string().optional(),
  stdout: z.string().optional(), stderr: z.string().optional(),
});
export interface JobResult {
  job_id: string; state: "running" | "completed";
  ok?: boolean; result?: unknown; error?: string; stdout?: string; stderr?: string;
}

export async function resolveExecutable(explicit = process.env.BLENDER_EXECUTABLE): Promise<string> {
  const usable = async (path: string) => {
    try { if (!(await stat(path)).isFile()) return false; await access(path, process.platform === "win32" ? constants.F_OK : constants.X_OK); return true; }
    catch { return false; }
  };
  if (explicit) {
    if (!isAbsolute(explicit) || !await usable(explicit)) throw new Error("BLENDER_EXECUTABLE must be an existing absolute Blender executable path (not an .app directory).");
    return explicit;
  }
  const candidates: string[] = [];
  if (process.platform === "darwin") candidates.push("/Applications/Blender.app/Contents/MacOS/Blender");
  if (process.platform === "win32") {
    const root = join(process.env.ProgramFiles || "C:\\Program Files", "Blender Foundation");
    for (const name of (await readdir(root).catch(() => [])).sort().reverse()) candidates.push(join(root, name, "blender.exe"));
  }
  for (const dir of (process.env.PATH || "").split(delimiter).filter(isAbsolute)) candidates.push(join(dir, process.platform === "win32" ? "blender.exe" : "blender"));
  for (const path of candidates) if (await usable(path)) return path;
  throw new Error("Blender executable not found. Install Blender 4.2+ and set BLENDER_EXECUTABLE to its absolute executable path; no add-on is required.");
}

export class BlenderTransport {
  private child?: ChildProcessWithoutNullStreams;
  private startup?: Promise<void>;
  private fault?: Error;
  private closed = false;
  private killTimer?: ReturnType<typeof setTimeout>;
  private active?: { id: string; finish: (job: JobResult) => void };
  private jobs = new Map<string, JobResult>();

  constructor(private options: { executable?: string; startupTimeoutMs?: number } = {}) {}

  private fail(error: Error): void {
    this.fault = error;
    if (this.active) {
      const job: JobResult = { job_id: this.active.id, state: "completed", ok: false,
        error: `${error.message} Completion is uncertain; no automatic retry. Unsaved session state may be lost. Inspect any output files before retrying.` };
      this.jobs.set(job.job_id, job);
      this.active.finish(job);
      this.active = undefined;
    }
    const child = this.child;
    if (child && child.exitCode === null && child.signalCode === null) {
      child.kill();
      if (!this.killTimer) this.killTimer = setTimeout(() => child.kill("SIGKILL"), 2000);
    }
  }

  private async start(): Promise<void> {
    if (this.closed) throw new Error("Blender session is closed.");
    if (this.fault) throw new Error(`${this.fault.message} Restart the MCP connection to create a new empty Blender session; unsaved state is lost.`);
    if (!this.startup) this.startup = this.launch().catch(error => { this.fail(error); throw error; });
    await this.startup;
    if (this.closed || this.fault) throw new Error("Blender session stopped during startup; restart the MCP connection.");
  }

  private async launch(): Promise<void> {
    const executable = await resolveExecutable(this.options.executable);
    if (this.closed) throw new Error("Blender session is closed.");
    const script = fileURLToPath(new URL("../scripts/background_runner.py", import.meta.url));
    const child = this.child = spawn(executable, ["--background", "--factory-startup", "--disable-autoexec", "--python-exit-code", "1", "--python", script], { stdio: "pipe", windowsHide: true });
    let buffer = "", diagnostics = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", chunk => { diagnostics = (diagnostics + chunk).slice(-65536); });
    await new Promise<void>((resolve, reject) => {
      let ready = false;
      const timer = setTimeout(() => { const error = new Error("Blender startup timed out. Check BLENDER_EXECUTABLE and run fnf-blender doctor."); this.fail(error); reject(error); }, this.options.startupTimeoutMs ?? 60000);
      const fail = (error: Error) => { clearTimeout(timer); this.fail(error); reject(error); };
      child.on("error", fail);
      child.stdin.on("error", fail);
      child.on("exit", (code, signal) => {
        clearTimeout(this.killTimer);
        fail(new Error(`Blender process exited (${code ?? signal}). ${diagnostics.slice(-2000)}`));
      });
      child.stdout.on("data", (chunk: string) => {
        buffer += chunk;
        let end: number;
        while ((end = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, end); buffer = buffer.slice(end + 1);
          if (line.length > MAX_LINE) { fail(new Error("Blender response exceeded the size limit.")); return; }
          if (!line.startsWith(PREFIX)) { diagnostics = (diagnostics + line + "\n").slice(-65536); continue; }
          try {
            const data = JSON.parse(line.slice(PREFIX.length));
            if (!ready) {
              const hello = z.object({ ready: z.literal(true), background: z.literal(true), version: z.tuple([z.number(), z.number(), z.number()]) }).parse(data);
              if (hello.version[0] < 4 || (hello.version[0] === 4 && hello.version[1] < 2)) throw new Error("Blender 4.2 or newer is required.");
              ready = true; clearTimeout(timer); resolve();
            } else {
              const job = jobSchema.parse(data);
              if (!this.active || job.job_id !== this.active.id) throw new Error("Unexpected Blender job response.");
              this.jobs.set(job.job_id, job);
              this.active.finish(job); this.active = undefined;
            }
          } catch (error) { fail(new Error(`Invalid Blender response: ${String(error)}`)); return; }
        }
        if (buffer.length > MAX_LINE) fail(new Error("Blender output exceeded the size limit."));
      });
    });
  }

  async status(jobId: string): Promise<JobResult> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error("Unknown job_id for this MCP session; history is limited to 128 jobs and disappears on reconnect.");
    return job;
  }

  async execute(code: string, timeoutSeconds = 120, mutates = true): Promise<JobResult> {
    if (!code || code.length > 1_000_000) throw new Error("Python source must contain 1–1000000 characters.");
    await this.start();
    if (this.active) throw new Error(`Blender is busy; job_id=${this.active.id}. Use bl_job_status before sending another command.`);
    while (this.jobs.size >= 128) this.jobs.delete(this.jobs.keys().next().value!);
    const id = randomBytes(16).toString("hex");
    const job: JobResult = { job_id: id, state: "running" };
    this.jobs.set(id, job);
    return new Promise<JobResult>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Blender is still running; job_id=${id}. Use bl_job_status on this MCP session before retrying. No automatic retry or cancellation was sent.`)), timeoutSeconds * 1000);
      this.active = { id, finish: result => { clearTimeout(timer); resolve(result); } };
      this.child!.stdin.write(JSON.stringify({ job_id: id, code, mutates }) + "\n", error => { if (error) this.fail(error); });
    });
  }

  async close(): Promise<void> {
    this.closed = true;
    const child = this.child;
    if (!child || child.exitCode !== null || child.signalCode !== null) return;
    await new Promise<void>(resolve => {
      const timer = setTimeout(() => child.kill("SIGKILL"), 2000);
      child.once("exit", () => { clearTimeout(timer); resolve(); });
      child.kill();
    });
  }
}
