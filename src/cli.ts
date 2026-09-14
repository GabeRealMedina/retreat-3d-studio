#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, sep } from "node:path";
import { PACKAGE_ROOT, DISPATCHER_JSX, resolveAfterFxPath } from "./config.js";
import { SkillStore } from "./skills.js";

const serverName = "higgsfield-use-after-effects";
const entry = resolve(PACKAGE_ROOT, "dist/index.js");
const config = { command: process.execPath, args: [entry] };
const command = process.argv[2] ?? "help";

try {
  if (command === "config") {
    console.log(JSON.stringify({ mcpServers: { [serverName]: config } }, null, 2));
  } else if (command === "doctor") {
    const checks: Array<{ name: string; ok: boolean; detail: string }> = [];
    checks.push({
      name: "node",
      ok: Number(process.versions.node.split(".")[0]) >= 24,
      detail: process.versions.node,
    });
    checks.push({
      name: "platform",
      ok: ["darwin", "win32"].includes(process.platform),
      detail: process.platform,
    });
    checks.push({ name: "server", ok: existsSync(entry), detail: entry });
    checks.push({ name: "dispatcher", ok: existsSync(DISPATCHER_JSX), detail: DISPATCHER_JSX });
    try {
      checks.push({ name: "after-effects", ok: true, detail: resolveAfterFxPath() });
    } catch (error) {
      checks.push({ name: "after-effects", ok: false, detail: String(error) });
    }
    try {
      const store = new SkillStore();
      for (const skill of store.manifest.skills)
        for (const doc of Object.keys(skill.documents)) store.read(skill.name, doc);
      checks.push({
        name: "skills",
        ok: true,
        detail: `${store.manifest.skills.length} skills verified`,
      });
    } catch (error) {
      checks.push({ name: "skills", ok: false, detail: String(error) });
    }
    const ok = checks.every((c) => c.ok);
    console.log(
      JSON.stringify(
        {
          ok,
          checks,
          liveConnectionTested: false,
          nextStep: "Call ae_project_info through MCP to verify AE scripting and OS permissions.",
        },
        null,
        2,
      ),
    );
    process.exitCode = ok ? 0 : 1;
  } else if (command === "install-codex") {
    if (PACKAGE_ROOT.split(sep).includes("_npx"))
      throw new Error(
        "Install a persistent copy first: npm install --global fnf-after-effects-mcp, then run fnf-after-effects install-codex. An npx cache path must not be saved in Codex configuration.",
      );
    if (!existsSync(entry))
      throw new Error(
        "Server files are missing. Reinstall the npm package, or build a source checkout with npm run build.",
      );
    const listed = spawnSync("codex", ["mcp", "list", "--json"], { encoding: "utf8" });
    if (listed.error || listed.status !== 0)
      throw new Error(
        "Cannot read Codex MCP configuration. Ensure the codex CLI is available and its config is valid.",
      );
    const servers: Array<{
      name: string;
      enabled?: boolean;
      transport?: { type?: string; command?: string; args?: string[] };
    }> = JSON.parse(listed.stdout);
    if (!Array.isArray(servers))
      throw new Error("Unexpected Codex MCP list format; no configuration changed.");
    const existing = servers.find((s) => s.name === serverName);
    if (!existing && servers.some((s) => s.name === "fnf-after-effects"))
      throw new Error(
        "Legacy fnf-after-effects registration found. Review it with codex mcp get fnf-after-effects, then remove it with codex mcp remove fnf-after-effects before rerunning install-codex. No configuration changed.",
      );
    if (existing) {
      if (
        existing.enabled !== false &&
        existing.transport?.type === "stdio" &&
        existing.transport.command === config.command &&
        JSON.stringify(existing.transport.args) === JSON.stringify(config.args)
      ) {
        console.log(
          `${serverName} is already registered. Refresh the client connection if needed.`,
        );
      } else
        throw new Error(
          `${serverName} already exists with a different configuration. Review it with codex mcp get ${serverName}; no changes made.`,
        );
    } else {
      const added = spawnSync(
        "codex",
        ["mcp", "add", serverName, "--", config.command, ...config.args],
        { encoding: "utf8" },
      );
      if (added.error || added.status !== 0)
        throw new Error(added.stderr || "Codex registration failed.");
      console.log(added.stdout.trim());
    }
  } else if (command === "help" || command === "--help" || command === "-h") {
    console.log(
      "Usage: fnf-after-effects <doctor|config|install-codex>\nThe MCP server entry is fnf-after-effects-mcp (stdio).",
    );
  } else {
    throw new Error(`Unknown command '${command}'. Use --help.`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
