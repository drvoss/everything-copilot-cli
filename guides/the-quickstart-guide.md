---
name: the-quickstart-guide
description: 5-minute quickstart guide to get productive with GitHub Copilot CLI
category: guide
---

# The Quickstart Guide

> ⏱️ **Time: 5 minutes** | **Level: Beginner** | **Goal: Your first productive session**

Get from zero to productive with GitHub Copilot CLI in 5 minutes.

---

## Prerequisites

Before you start, make sure you have:

| Requirement | Check |
|---|---|
| Node.js 18+ | `node --version` |
| GitHub account | [github.com](https://github.com) |
| Copilot subscription | Individual, Business, or Enterprise |
| Terminal | PowerShell, bash, zsh, or any modern terminal |

---

## Step 1: Install Copilot CLI

```powershell
npm install -g @github/copilot
```

Verify the installation:

```powershell
copilot --version
```

---

## Step 2: Log In

Start the CLI and authenticate:

```powershell
copilot
```

Once inside, run the login command:

```
/login
```

Follow the browser prompt to authenticate with your GitHub account.

---

## Step 3: Your First Session

Navigate to any project directory and start a session:

```powershell
cd C:\your-project
copilot
```

Try these basic commands:

```
# Ask a question about your codebase
> Explain how authentication works in this project

# Make a change
> Add input validation to the user registration endpoint

# Check what changed
> Show me a summary of files you modified
```

---

## Step 4: Try Agent Modes

Copilot CLI has three modes. Switch between them with **Shift+Tab**:

| Mode | When to Use | Behavior |
|---|---|---|
| **Interactive** | Exploration, Q&A | Asks before every action |
| **Plan** | Complex tasks | Creates plan → you approve → executes |
| **Autopilot** | Trusted tasks | Executes autonomously, minimal prompts |

Try it now:

```
# Start in Interactive mode (default)
> Refactor the user service to use dependency injection

# Press Shift+Tab to switch to Plan mode
# Copilot creates a step-by-step plan for you to approve

# Press Shift+Tab again for Autopilot
# Copilot executes the full refactor autonomously
```

---

## Step 5: Add Project Instructions

Create a `.github/copilot-instructions.md` in your project root:

```markdown
# Project Instructions

- This is a TypeScript project using Express.js
- Use Jest for testing with >80% coverage
- Follow the repository's existing code style
- Always add JSDoc comments to public functions
- Use dependency injection for services
```

Copilot CLI reads this file automatically and tailors its behavior to your project.

---

## Step 6: Essential Slash Commands

These commands work inside any Copilot CLI session:

```
/model              # Switch between 18 available models
/skills             # List available skills and workflows
/add-dir ./src      # Add directories to context
/clear              # Clear conversation history
/help               # Show all available commands
```

Quick model switching examples:

```
/model claude-sonnet-4.6    # Balanced reasoning (default)
/model gpt-5-mini              # Fast code generation
/model claude-opus-4.6      # Deep analysis (premium)
```

---

## What's Next?

You're up and running! Here's where to go from here:

| Goal | Resource |
|---|---|
| Learn core concepts | [The Shortform Guide](the-shortform-guide.md) |
| Explore skills & workflows | [Skills Directory](../skills/) |
| Set up multi-AI orchestration | [The Orchestration Guide](the-orchestration-guide.md) |
| Security best practices | [The Security Guide](the-security-guide.md) |
| See agent definitions | [Agents Directory](../agents/) |
| Browse orchestration patterns | [Orchestration Patterns](../orchestration/patterns/) |

---

> ★ **Tip**: The fastest way to learn is to open a real project and start asking questions. Copilot CLI understands your codebase through file context — the more specific your questions, the better the answers.
