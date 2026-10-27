import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const readJson = (...parts) => JSON.parse(readFileSync(join(ROOT, ...parts), "utf8"));

function countSkills(dir) {
  let n = 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) n += countSkills(p);
    else if (e.name === "SKILL.md") n += 1;
  }
  return n;
}

describe("Claude Code plugin manifests", () => {
  const plugin = readJson(".claude-plugin", "plugin.json");
  const marketplace = readJson(".claude-plugin", "marketplace.json");

  it("root plugin lists every skill category and no Copilot-format agents", () => {
    const categories = readdirSync(join(ROOT, "skills"), { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => `./skills/${e.name}`);
    assert.deepEqual([...plugin.skills].sort(), categories.sort());
    assert.deepEqual(plugin.agents, []);
  });

  it("descriptions quote the real skill count", () => {
    const total = countSkills(join(ROOT, "skills"));
    assert.ok(plugin.description.includes(`${total} skills`));
    const full = marketplace.plugins.find((p) => p.name === plugin.name);
    assert.ok(full.description.includes(`${total} agent skills`));
  });

  it("marketplace sources exist and carry a manifest", () => {
    assert.equal(marketplace.plugins.length, 2);
    for (const p of marketplace.plugins) {
      const dir = join(ROOT, p.source);
      assert.ok(existsSync(dir), `${p.source} missing`);
      assert.ok(
        existsSync(join(dir, ".claude-plugin", "plugin.json")),
        `${p.name} needs .claude-plugin/plugin.json so updates keep a stable version`
      );
    }
  });

  it("versions agree across package, Copilot, Claude, and bundle manifests", () => {
    const versions = {
      package: readJson("package.json").version,
      copilot: readJson("plugin.json").version,
      claude: plugin.version,
      bundleCopilot: readJson("plugins", "copilot-native-workflows", "plugin.json").version,
      bundleClaude: readJson("plugins", "copilot-native-workflows", ".claude-plugin", "plugin.json").version,
    };
    assert.equal(new Set(Object.values(versions)).size, 1, JSON.stringify(versions));
  });

  it("bundle manifest matches the Copilot manifest without a skills path", () => {
    const bundleDir = join(ROOT, "plugins", "copilot-native-workflows");
    const copilot = JSON.parse(readFileSync(join(bundleDir, "plugin.json"), "utf8"));
    const claude = JSON.parse(readFileSync(join(bundleDir, ".claude-plugin", "plugin.json"), "utf8"));
    const { skills, ...expected } = copilot;
    assert.deepEqual(claude, expected);
  });
});
