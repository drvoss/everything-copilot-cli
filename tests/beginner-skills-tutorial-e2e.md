# Beginner skills tutorial E2E test case

Use this procedure whenever the beginner tutorial, setup flow, or Copilot-facing install paths change.

## Goal

Verify that the beginner tutorial in `guides/the-beginner-skills-tutorial*.md` is accurate, copy-pasteable, and produces a practice project where Copilot CLI discovers the installed skills and agents.

## Preconditions

- GitHub Copilot CLI is installed and authenticated.
- Run from a clean clone of `everything-copilot-cli`.
- Use fresh target directories under `C:\work-copilot\test`.

## Procedure

1. Remove any old tutorial directories:

   ```powershell
   Remove-Item C:\work-copilot\test\skills-lab-template -Recurse -Force -ErrorAction SilentlyContinue
   Remove-Item C:\work-copilot\test\skills-lab-plain -Recurse -Force -ErrorAction SilentlyContinue
   Remove-Item C:\work-copilot\test\skills-lab-guided -Recurse -Force -ErrorAction SilentlyContinue
   ```

2. Create the template directory:

   ```powershell
   New-Item -ItemType Directory -Force C:\work-copilot\test\skills-lab-template | Out-Null
   ```

3. From the repository root, run:

   ```powershell
   npm install
   npm run setup -- --target C:\work-copilot\test\skills-lab-template --profile recommended
   ```

4. In `C:\work-copilot\test\skills-lab-template`, run:

   ```powershell
   npm init -y
   npm pkg set scripts.test="node --test"
   ```

5. Add the tutorial's `src\calculator.js` and `src\calculator.test.js` files exactly as written in the guide.

6. Run:

   ```powershell
   npm test
   ```

7. Confirm the tests fail with both of these signals:
   - `divide returns the quotient`
   - `total sums item prices`

8. Copy the template project:

   ```powershell
   Copy-Item C:\work-copilot\test\skills-lab-template C:\work-copilot\test\skills-lab-plain -Recurse
   Copy-Item C:\work-copilot\test\skills-lab-template C:\work-copilot\test\skills-lab-guided -Recurse
   ```

9. Start Copilot in `skills-lab-template`:

   ```powershell
   cd C:\work-copilot\test\skills-lab-template
   copilot
   ```

10. Inside Copilot, run:

    ```text
    /skills
    /agent
    ```

11. Confirm:
    - the startup environment includes `1 custom instruction`, `80 skills`, and `8 agents`
    - `/skills` includes `systematic-debugging` and `tdd-workflow`
    - `/agent` includes `planner`

## Pass criteria

- Every command block in the tutorial can be pasted into PowerShell without modification other than path changes.
- The tutorial creates a failing test project on purpose.
- Copilot CLI discovers the installed project skills and agents in the tutorial project.
- The two comparison folders are created successfully for plain-vs-guided exercises.

## Regression notes

- A failing `npm test` result is expected in the tutorial's initial state.
- The tutorial relies on `npm pkg set scripts.test="node --test"` and Node.js 18+.
- If Copilot falls back to built-in skills only, inspect `.github/skills/` and `.github/agents/` first.
