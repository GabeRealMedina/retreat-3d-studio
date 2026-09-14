import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
const root = resolve(import.meta.dirname, "..");
const temp = mkdtempSync(join(tmpdir(), "fnf-ae-package-"));
const client = new Client({ name: "fnf-package-verification", version: "1.0.0" });
const npmCli = process.env.npm_execpath;
assert(npmCli, "Run through npm run test:package so the current npm CLI is available.");
const npm = (args) =>
  execFileSync(process.execPath, [npmCli, ...args], {
    cwd: root,
    encoding: "utf8",
  });
try {
  const packed = JSON.parse(
    npm(["pack", "--ignore-scripts", "--json", "--pack-destination", temp]),
  )[0];
  assert(packed.files.some((x) => x.path === "skills/manifest.json"));
  assert(packed.files.some((x) => x.path === "jsx/dispatcher.jsx"));
  assert(packed.files.some((x) => x.path === "LICENSE"));
  assert(packed.files.some((x) => x.path === "UPSTREAM.md"));
  assert(
    !packed.files.some((x) =>
      /^(archive|blender|creative-skills|runtime|tests|node_modules)\//.test(x.path),
    ),
  );
  const prefix = join(temp, "installed");
  npm([
    "install",
    "--global",
    "--prefix",
    prefix,
    "--ignore-scripts",
    "--no-audit",
    "--no-fund",
    join(temp, packed.filename),
  ]);
  const pkg = realpathSync(join(npm(["root", "--global", "--prefix", prefix]).trim(), packed.name));
  const manifest = JSON.parse(readFileSync(join(pkg, "package.json"), "utf8"));
  assert.notEqual(manifest.private, true);
  assert.equal(manifest.publishConfig.access, "public");
  const cli = join(pkg, "dist/cli.js");
  const config = JSON.parse(
    execFileSync(process.execPath, [cli, "config"], { cwd: temp, encoding: "utf8" }),
  );
  const server = config.mcpServers["higgsfield-use-after-effects"];
  assert.equal(server.command, process.execPath);
  assert.deepEqual(server.args, [join(pkg, "dist/index.js")]);
  await client.connect(new StdioClientTransport({ ...server, cwd: temp, stderr: "pipe" }));
  assert.equal(client.getServerVersion().name, "higgsfield-use-after-effects");
  assert.equal(client.getServerVersion().title, "Higgsfield use After Effects");
  const tools = await client.listTools();
  assert.equal(tools.tools.length, 12);
  const skill = await client.callTool({
    name: "ae_get_skill",
    arguments: { name: "ae-clean-rig", reference: "references/07-sliders.md" },
  });
  assert(!skill.isError);
  assert(skill.structuredContent.content.includes("Slide"));
  for (const reference of [
    "references/17-visual-foundation.md",
    "references/boards/overview.md",
    "references/collage/overview.md",
    "references/characters/overview.md",
  ]) {
    const document = await client.callTool({
      name: "ae_get_skill",
      arguments: { name: "ae-clean-rig", reference },
    });
    assert(!document.isError);
    assert.equal(document.structuredContent.document, reference);
    assert(document.structuredContent.content.length > 0);
  }
  const catalog = await client.callTool({ name: "ae_catalog", arguments: {} });
  assert(!catalog.isError);
  await client.close();
  const cached = join(temp, "_npx", "temporary-package");
  mkdirSync(join(temp, "_npx"));
  renameSync(pkg, cached);
  assert.throws(
    () =>
      execFileSync(process.execPath, [join(cached, "dist/cli.js"), "install-codex"], {
        cwd: temp,
        encoding: "utf8",
        stdio: "pipe",
      }),
    (error) => error.status === 1 && /npx cache path/.test(error.stderr),
  );
  console.log(
    JSON.stringify(
      {
        ok: true,
        packedFiles: packed.files.length,
        tools: tools.tools.length,
        sha256: skill.structuredContent.sha256,
        dependencies:
          "Fresh npm installation from tarball; scripts disabled; no source checkout links.",
        npxRegistrationGuard: true,
      },
      null,
      2,
    ),
  );
} finally {
  await client.close();
  rmSync(temp, { recursive: true, force: true });
}
