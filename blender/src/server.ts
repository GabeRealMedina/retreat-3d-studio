import { readFile, stat } from "node:fs/promises";
import { McpServer, type CallToolResult } from "@modelcontextprotocol/server";
import { z } from "zod";
import { BL_TOOLS } from "./tools.js";
import { BlenderTransport, type JobResult } from "./transport.js";
import { getSkill, SKILL_NAMES } from "./skills.js";

const packageInfo = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")) as { version: string };
const errorResult = (error: unknown): CallToolResult => ({ isError: true, content: [{ type: "text", text: String(error) }] });

export async function formatResult(job: JobResult): Promise<CallToolResult> {
  const data = job.result;
  const object = data && typeof data === "object" && !Array.isArray(data) ? data as Record<string, unknown> : undefined;
  const image = object?.pngBase64;
  const { pngBase64: _removed, ...metadata } = object ?? {};
  const structuredContent = { ...job, result: object ? metadata : data ?? null };
  const content: CallToolResult["content"] = [{ type: "text", text: JSON.stringify(structuredContent) }];
  if (job.ok && typeof image === "string") {
    content.push({ type: "image", data: image, mimeType: "image/png" });
  }
  if (job.ok && typeof object?.output_path === "string") {
    const path = object.output_path;
    try {
      const file = await stat(path);
      if (file.size <= 4 * 1024 * 1024 && path.toLowerCase().endsWith(".png")) {
        content.push({ type: "image", data: (await readFile(path)).toString("base64"), mimeType: "image/png" });
      }
    } catch { content.push({ type: "text", text: "Preview unavailable; inspect the returned output path." }); }
  }
  return { content, structuredContent, ...(job.ok === false ? { isError: true } : {}) };
}

export function createServer(transport = new BlenderTransport(), identity = { name: "higgsfield-use-blender", title: "Higgsfield use Blender", version: packageInfo.version }): McpServer {
  const server = new McpServer(identity, {
    instructions: "Control a dedicated background Blender process; it cannot access an open desktop window. Save .blend files before disconnecting; unsaved state is lost on reconnect. Read bl_get_skill(blender-scene), then bl_health and bl_get_scene_summary before edits. Prefer typed tools; use bl_execute for other bpy operations. Commands can partially mutate before errors. On timeout, query bl_job_status; never blindly retry. Render and view results. Cloud generation is provided by a separate Higgsfield MCP, not this server.",
  });
  for (const tool of BL_TOOLS) {
    server.registerTool(tool.name, {
      title: tool.title, description: tool.description, inputSchema: tool.schema,
      annotations: { readOnlyHint: tool.readOnly, destructiveHint: !tool.readOnly, idempotentHint: tool.readOnly, openWorldHint: tool.name === "bl_execute" },
    }, async args => {
      try {
        const mutates = !tool.readOnly && !["bl_save_project", "bl_open_project"].includes(tool.name);
        return await formatResult(await transport.execute(tool.code(args), tool.name === "bl_render" ? 300 : 120, mutates));
      } catch (error) { return errorResult(error); }
    });
  }
  server.registerTool("bl_job_status", {
    title: "Check Blender Job", description: "Check a previously accepted job after timeout without repeating its mutations. Use the same MCP session. Results expire after 128 accepted jobs or reconnecting.",
    inputSchema: z.object({ job_id: z.string().regex(/^[a-f0-9]{32}$/) }).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async ({ job_id }) => {
    try { return await formatResult(await transport.status(job_id)); }
    catch (error) { return errorResult(error); }
  });
  server.registerTool("bl_get_skill", {
    title: "Read Blender Skill", description: "Load offline Blender craft guidance. Start with blender-scene, then read the relevant topic. Does not require Blender to be running.",
    inputSchema: z.object({ name: z.enum(SKILL_NAMES).default("blender-scene") }).strict(),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async ({ name }) => ({ content: [{ type: "text", text: await getSkill(name) }] }));
  return server;
}
