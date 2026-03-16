# Git Workflow Rules

Guidelines for consistent, clean version control practices.

## Commit Messages

- Use **Conventional Commits** format:
  - `feat:` — new feature
  - `fix:` — bug fix
  - `docs:` — documentation changes
  - `style:` — formatting, no code change
  - `refactor:` — code restructuring, no behavior change
  - `test:` — adding or updating tests
  - `chore:` — maintenance, dependencies, tooling
- Write in **imperative mood**: "Add feature" not "Added feature"
- Keep the subject line under 72 characters
- Add a body for non-trivial changes explaining *why*

## Commit Scope

- **One logical change per commit** — don't mix refactoring with features
- Each commit should leave the codebase in a working state
- Separate formatting/whitespace changes from functional changes
- Squash fixup commits before merging

## AI-Assisted Commits

- Include the **Co-authored-by trailer** for AI-generated commits:
  ```
  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```
- Review AI-generated code before committing — you own the commit

## Branch Naming

- Use prefixes that describe the purpose:
  - `feature/` — new features (e.g., `feature/user-auth`)
  - `fix/` — bug fixes (e.g., `fix/login-redirect`)
  - `docs/` — documentation (e.g., `docs/api-guide`)
  - `chore/` — maintenance (e.g., `chore/update-deps`)
- Use kebab-case for branch names
- Include a ticket/issue number when applicable: `fix/123-null-pointer`

## Pull Requests

- **Always review before merge** — no direct pushes to main/master
- Keep PRs focused and small (under 400 lines of diff when possible)
- Write a clear PR description: what changed, why, and how to test
- Link related issues and reference relevant context
- Request reviews from domain experts

## Branch Management

- Keep `main`/`master` always deployable
- Delete branches after merging
- Rebase feature branches on main regularly to avoid large merge conflicts
- Use protected branches with required reviews and CI checks

## General Practices

- Never force-push to shared branches
- Use `.gitignore` to keep generated files, dependencies, and secrets out of the repo
- Tag releases with semantic versioning (e.g., `v1.2.3`)
- Write meaningful PR titles — they become the merge commit message
