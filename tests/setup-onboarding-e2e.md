# Setup onboarding E2E test case

Use this procedure whenever `scripts/setup.js`, `README*.md`, `skills/README.md`, or Copilot-facing install paths change.

## Goal

Verify that a fresh project can be bootstrapped from this repository and that GitHub Copilot CLI actually discovers the installed instructions, skills, and agents.

## Preconditions

- GitHub Copilot CLI is installed and authenticated.
- Run from a clean clone of `everything-copilot-cli`.
- Use fresh empty target directories for each run.

## Test matrix

| Case | Target directory | Purpose |
|---|---|---|
| README install flow | `quizquiz2` | Verify the documented install flow works end to end |
| Manual flat skill layout | `quizquiz4` | Prove the Copilot skill loader recognizes flat `.github/skills/<skill-name>/SKILL.md` |
| Manual flat agent layout | `quizquiz5` | Prove the Copilot agent loader recognizes `.github/agents/*.md` |

## Case 1 — README install flow

1. Create an empty target directory.
2. From the repository root, run:

   ```powershell
   npm run setup -- --target C:\work-copilot\test\quizquiz2 --profile recommended
   ```

3. Confirm the install summary reports:
   - `.github/copilot-instructions.md`
   - `.github/agents/`
   - `.github/skills/`
   - `.github/copilot/rules/`

4. Start Copilot in the target directory:

   ```powershell
   cd C:\work-copilot\test\quizquiz2
   copilot
   ```

5. Verify the banner reports:
   - `1 custom instruction`
   - `76 skills`
   - `8 agents`

6. Run:

   ```text
   /skills
   ```

7. Confirm project skills such as `fix-build-errors` appear in the list.

8. Run:

   ```text
   /agent
   ```

9. Confirm custom agents such as `planner` appear in the selector.

## Case 2 — Manual flat skill layout

Use this only when debugging loader behavior.

1. Create `.github/skills/fix-build-errors/SKILL.md` in an empty target directory.
2. Add `.github/copilot-instructions.md`.
3. Launch `copilot`.
4. Run `/skills` and confirm `fix-build-errors` is listed under `Project`.

## Case 3 — Manual flat agent layout

Use this only when debugging loader behavior.

1. Create `.github/agents/planner.md` in an empty target directory.
2. Add `.github/copilot-instructions.md`.
3. Launch `copilot`.
4. Confirm the banner reports `1 agent`.
5. Run `/agent` and confirm `planner` appears in the selector.

## Pass criteria

- The README install flow loads project instructions, project skills, and custom agents in Copilot CLI.
- `/skills` shows project skills from `.github/skills/`.
- `/agent` shows custom agents from `.github/agents/`.
- The installer never places project skills under `.github/copilot/skills/`.

## Regression notes

- If the banner falls back to `1 skill`, first inspect the installed skill path and directory depth.
- Copilot CLI v1.0.24 recognizes project skills in `.github/skills/<skill-name>/SKILL.md`.
- Copilot CLI v1.0.24 recognizes custom agents in `.github/agents/*.md`.
