import { afterEach, describe, expect, it } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { SkillStore } from "../src/skills.js";
import { getSkillTool } from "../src/tools/get-skill.js";
import { nullTransport } from "./helpers/null-transport.js";
import { ALL_TOOLS } from "../src/tools/index.js";
import { McpTestClient } from "./harness.js";

const temporary: string[] = [];
afterEach(() => {
  for (const dir of temporary.splice(0)) rmSync(dir, { recursive: true, force: true });
});
function copyCorpus() {
  const root = mkdtempSync(join(tmpdir(), "fnf-skills-test-"));
  temporary.push(root);
  cpSync(resolve("skills"), root, { recursive: true });
  return root;
}

function copySkillTools() {
  const root = mkdtempSync(join(tmpdir(), "fnf-skill-tools-test-"));
  temporary.push(root);
  cpSync(resolve("skills"), join(root, "skills"), { recursive: true });
  mkdirSync(join(root, "scripts"));
  for (const script of ["generate-skills-manifest.mjs", "install-skill.py"])
    cpSync(resolve("scripts", script), join(root, "scripts", script));
  return root;
}

describe("single skill source tooling", () => {
  it("generates without Git, detects drift and preserves entry metadata", () => {
    const root = copySkillTools();
    const script = join(root, "scripts/generate-skills-manifest.mjs");
    const manifestPath = join(root, "skills/manifest.json");
    const entryPath = join(root, "skills/ae-clean-rig/SKILL.md");
    const metadataPath = join(root, "skills/use-after-effects/agents/openai.yaml");
    const metadata = readFileSync(metadataPath, "utf8");
    const originalManifest = readFileSync(manifestPath, "utf8");
    execFileSync(process.execPath, [script], { cwd: tmpdir() });
    expect(readFileSync(manifestPath, "utf8")).toBe(originalManifest);

    const edited = readFileSync(entryPath, "utf8").replace(
      "description: Primary entry point",
      "description: Updated entry point",
    );
    writeFileSync(entryPath, edited);
    const check = spawnSync(process.execPath, [script, "--check"], { encoding: "utf8" });
    expect(check.status).not.toBe(0);
    expect(check.stderr).toContain("Skill manifest is stale");
    expect(readFileSync(manifestPath, "utf8")).toBe(originalManifest);

    execFileSync(process.execPath, [script]);
    execFileSync(process.execPath, [script, "--check"]);
    const store = new SkillStore(join(root, "skills"));
    expect(store.read("ae-clean-rig").content).toBe(edited);
    expect(
      store.manifest.skills.find((skill) => skill.name === "ae-clean-rig")?.description,
    ).toContain("Updated entry point");
    expect(readFileSync(metadataPath, "utf8")).toBe(metadata);
  });

  it("detects added and removed skill entries", () => {
    const root = copySkillTools();
    const script = join(root, "scripts/generate-skills-manifest.mjs");
    const added = join(root, "skills/ae-test");
    mkdirSync(added);
    writeFileSync(join(added, "SKILL.md"), "---\nname: ae-test\ndescription: Test skill\n---\n");
    expect(spawnSync(process.execPath, [script, "--check"]).status).not.toBe(0);
    execFileSync(process.execPath, [script]);
    expect(new SkillStore(join(root, "skills")).read("ae-test").content).toContain("Test skill");
    rmSync(added, { recursive: true });
    expect(spawnSync(process.execPath, [script, "--check"]).status).not.toBe(0);
    execFileSync(process.execPath, [script]);
    expect(() => new SkillStore(join(root, "skills")).read("ae-test")).toThrow("Unknown skill");
  });

  it.skipIf(process.platform === "win32")("rejects symlinked skill directories", () => {
    const root = copySkillTools();
    const script = join(root, "scripts/generate-skills-manifest.mjs");
    symlinkSync(join(root, "skills/ae-clean-rig"), join(root, "skills/ae-test"));
    const result = spawnSync(process.execPath, [script], { encoding: "utf8" });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Symlink forbidden");
  });

  it.skipIf(process.platform === "win32")("installs, migrates and protects existing skills", () => {
    const root = copySkillTools();
    const targetDirectory = join(root, "installed");
    const target = join(targetDirectory, "use-after-effects");
    const installerArguments = [
      join(root, "scripts/install-skill.py"),
      "--skills-dir",
      targetDirectory,
    ];
    execFileSync("python3", installerArguments);
    expect(readFileSync(join(target, "SKILL.md"), "utf8")).toContain("name: use-after-effects");
    expect(execFileSync("python3", installerArguments, { encoding: "utf8" })).toContain(
      "Already installed",
    );
    unlinkSync(target);
    symlinkSync(join(root, "creative-skills/skills/use-after-effects"), target);
    execFileSync("python3", installerArguments);
    expect(readFileSync(join(target, "agents/openai.yaml"), "utf8")).toContain("interface:");
    unlinkSync(target);
    mkdirSync(target);
    writeFileSync(join(target, "SKILL.md"), "user skill");
    expect(spawnSync("python3", installerArguments).status).not.toBe(0);
    expect(readFileSync(join(target, "SKILL.md"), "utf8")).toBe("user skill");
  });
});

describe("bundled AE skills", () => {
  it("loads every bundled entry/reference and validates documented tool names", () => {
    const store = new SkillStore();
    const tools = new Set(ALL_TOOLS.map((tool) => tool.name));
    expect(store.index().skills).toHaveLength(11);
    for (const skill of store.manifest.skills) {
      for (const document of Object.keys(skill.documents)) {
        const result = store.read(skill.name, document);
        expect(result.content.length).toBeGreaterThan(100);
        for (const match of result.content.matchAll(/\bae_[a-z_]+\b/g))
          expect(tools.has(match[0]), match[0]).toBe(true);
      }
    }
  });

  it("returns only the selected entry or reference", () => {
    const store = new SkillStore();
    const entry = store.read("ae-clean-rig");
    expect(entry.references).toHaveLength(34);
    expect(entry.content).not.toContain("# Practical editability and exposed controls");
    expect(store.read("ae-clean-rig", "references/06-editable-rigs.md").content).toContain(
      "# Practical editability and exposed controls",
    );
  });

  it.each([
    "../../package.json",
    "/etc/passwd",
    "__proto__",
    "references/../../../package.json",
    "references%2F07-sliders.md",
  ])("rejects unlisted references: %s", (reference) => {
    expect(() => new SkillStore().read("ae-clean-rig", reference)).toThrow("Unknown reference");
  });

  it("rejects unknown skills, including prototype property names", () => {
    for (const name of ["missing", "__proto__", "../../etc"])
      expect(() => new SkillStore().read(name)).toThrow("Unknown skill");
  });

  it("detects edited bundle documents", () => {
    const root = copyCorpus();
    writeFileSync(join(root, "ae-clean-rig/SKILL.md"), "tampered");
    expect(() => new SkillStore(root).read("ae-clean-rig")).toThrow("integrity mismatch");
  });

  it.skipIf(process.platform === "win32")(
    "rejects a listed document symlink outside the corpus",
    () => {
      const root = copyCorpus();
      const file = join(root, "ae-clean-rig/SKILL.md");
      unlinkSync(file);
      symlinkSync(resolve("package.json"), file);
      expect(() => new SkillStore(root).read("ae-clean-rig")).toThrow("escapes");
    },
  );

  it("rejects duplicate manifest names", () => {
    const root = copyCorpus();
    const path = join(root, "manifest.json");
    const data = JSON.parse(readFileSync(path, "utf8"));
    data.skills.push(data.skills[0]);
    writeFileSync(path, JSON.stringify(data));
    expect(() => new SkillStore(root)).toThrow("Duplicate");
  });

  it("does not dispatch AE for index, documents or invalid arguments", async () => {
    const transport = nullTransport();
    expect((await getSkillTool.handler({}, transport)).isError).toBe(false);
    expect((await getSkillTool.handler({ name: "ae-clean-rig" }, transport)).isError).toBe(false);
    expect((await getSkillTool.handler({ reference: "SKILL.md" }, transport)).isError).toBe(true);
    expect((await getSkillTool.handler({ name: "missing" }, transport)).isError).toBe(true);
    expect(transport.calls).toHaveLength(0);
  });

  it("serves skills through real stdio in read-only mode without AE", async () => {
    const client = new McpTestClient();
    await client.connect({ AE_MCP_READONLY: "1" });
    try {
      const index = await client.call<{ skills: unknown[] }>("ae_get_skill");
      expect(index.skills).toHaveLength(11);
      const entry = await client.call<{ content: string; references: string[] }>("ae_get_skill", {
        name: "ae-clean-rig",
      });
      expect(entry.content).toContain("After Effects: clean construction, faithful motion");
      expect(entry.references).toContain("references/07-sliders.md");
      expect(await client.callExpectError("ae_get_skill", { name: "missing" })).toContain(
        "INVALID_ARGS",
      );
    } finally {
      await client.close();
    }
  });
});
