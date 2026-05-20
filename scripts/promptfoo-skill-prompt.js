import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export default async function ({ vars }) {
  if (!vars?.skill_path) {
    throw new Error('Missing vars.skill_path for Promptfoo skill evaluation.');
  }

  const skillContent = await readFile(resolve(vars.skill_path), 'utf8');

  return `You are a GitHub Copilot CLI assistant.
The following skill guide is active:

---
${skillContent}
---

User request:
${vars.query}

Follow the skill faithfully. If the request falls into a "When NOT to Use" boundary,
recommend the more appropriate path instead of forcing the skill.`;
}
