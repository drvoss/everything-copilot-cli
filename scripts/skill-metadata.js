export const VALID_SKILL_CATEGORIES = [
  "development",
  "testing",
  "security",
  "documentation",
  "copilot-exclusive",
  "workflow",
  "product",
  "content",
];

export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      fields[key] = value;
    }
  }
  return fields;
}

export function getSkillCategory(content) {
  const fm = parseFrontmatter(content);
  if (!fm) return null;
  if (fm.category) return fm.category;
  const metaMatch = content.match(/^metadata:\s*\n(?:[ \t]+\S.*\n)*?[ \t]+category:\s*(\S+)/m);
  return metaMatch ? metaMatch[1] : null;
}
