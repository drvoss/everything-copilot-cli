<p align="center">
  <img src="docs/images/copilot.svg" width="80" alt="Copilot CLI" />
</p>

<h1 align="center">everything-copilot-cli</h1>

<p align="center">
  <strong>GitHub Copilot CLI 的权威指南与配置系统</strong><br/>
  Agents · Skills · Rules · 多AI协同编排
</p>

<p align="center">
  <a href="LICENSE"><img src="docs/images/badge-license.svg" alt="MIT License" /></a>
  <a href="#"><img src="docs/images/badge-copilot-cli-ready.svg" alt="Copilot CLI Ready" /></a>
  <a href="#"><img src="docs/images/badge-models.svg" alt="20+ Models" /></a>
  <a href="#"><img src="docs/images/badge-agents.svg" alt="8 Agents" /></a>
  <a href="#"><img src="docs/images/badge-skills.svg" alt="64 Skills" /></a>
  <a href="#多ai协同编排-"><img src="docs/images/badge-multi-ai.svg" alt="Multi-AI Orchestrator" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.ja.md">日本語</a>
</p>

---

## 这是什么？

**everything-copilot-cli** 是一个经过整理、由社区驱动的资源集合，包含适用于 [GitHub Copilot CLI](https://github.com/github/copilot-cli) 的 agent、可复用 skill、编码规则、MCP 配置以及完整指南。

它最初是 [everything-claude-code](https://github.com/affaan-m/everything-claude-code) 的平行项目，并借鉴了 [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) 等社区资源——但如今已发展出独立定位。其核心关注点是 Copilot CLI 的真正差异化能力：**原生 GitHub 集成、多模型灵活性，以及从单一枢纽编排其他 AI 编码 agent 的能力**。

> **Act as a Multi-AI Orchestrator** —— 通过单一命令行协调 Claude Code、Codex CLI、Gemini CLI 等。_（社区模式——见 [多AI协同编排](#多ai协同编排-)）_

---

## 为什么选择 Copilot CLI？

GitHub Copilot CLI 提供 **11 项关键优势**，使其成为 AI 辅助开发的理想枢纽：

| # | 优势 | 说明 |
|---|------|------|
| 1 | **GitHub-Native Integration** | Issue、PR、Actions、代码搜索——全部通过内置 MCP 完成，无需额外配置。 |
| 2 | **20+ Model Selection** | GPT-5.x、Claude Sonnet/Opus 4.6、Gemini 3 Pro——可按任务选择最合适模型。 |
| 3 | **IDE ↔ CLI Seamless Switching** | 在 VS Code、JetBrains 与终端中共享同一 Copilot 上下文。 |
| 4 | **Plan Mode** | 结构化文本规划——在编写任何代码前先生成分步实施计划。 |
| 5 | **Autopilot Mode** | 带护栏的自主任务执行。_（实验性功能）_ |
| 6 | **Background Agents** | 通过 `&` 或 `/delegate` 委托云端 Copilot agents；可随时用 `/resume` 恢复。 |
| 7 | **Fleet Mode** | 并行 agent 执行——将工作同时分配给多个 agents。 |
| 8 | **Session SQL Database** | 内置每会话 SQLite，用于结构化数据、todo 跟踪与状态管理。 |
| 9 | **Cross-Session Memory** | 通过 `session_store` 持久化知识，实现跨会话学习。 |
| 10 | **LSP First-Class Support** | 集成 Language Server Protocol，提供精准代码智能。 |
| 11 | **Multi-AI Orchestrator** | 以 Copilot 为元枢纽，编排 Claude Code、Codex、Gemini CLI。 |

---

## 快速开始

```bash
# 1. Install GitHub Copilot CLI
npm install -g @github/copilot

# 2. Clone this repository
git clone https://github.com/drvoss/everything-copilot-cli.git
cd everything-copilot-cli

# 3. 验证刚克隆的仓库
npm install && npm run setup

# 4. 将集合安装到你的项目中
npm run setup -- --target ../your-project
```

第一条命令会快速验证 README 中的 clone + setup 流程。第二条命令会以交互方式把这套集合复制到你的项目中。

随后打开终端，开始使用安装到项目中的 agent、skill 与规则：

```bash
# Start a session in your project directory
cd your-project
copilot

# Use the planner agent (inside the session)
> Design a REST API for user management — use plan mode

# Run TDD workflow
> Add tests for the auth module using TDD

# Orchestrate multiple AIs
> Claude reasons architecture, Codex implements, Copilot reviews — delegate accordingly
```

> 详细说明请参见[快速入门指南](guides/)。

---

## 仓库结构

```
everything-copilot-cli/
├── agents/                        # Agent definitions (8 core agents)
│   ├── planner.md
│   ├── architect.md
│   ├── code-reviewer.md
│   ├── security-reviewer.md
│   ├── tdd-guide.md
│   ├── build-error-resolver.md
│   ├── doc-updater.md
│   └── refactor-cleaner.md
│
├── skills/                        # Reusable workflow skills (64 total)
│   ├── copilot-exclusive/         #   ★ Copilot-only skills (16)
│   ├── development/               #   Dev skills (16)
│   ├── documentation/             #   Doc skills (5)
│   ├── security/                  #   Security skills (6)
│   ├── testing/                   #   Test skills (4)
│   ├── workflow/                  #   Workflow skills (9)
│   ├── product/                   #   Product skills (5)
│   └── content/                   #   Content & GEO skills (3)
│
├── rules/                         # Coding rules & guidelines
│   ├── common/                    #   Universal rules (6)
│   ├── languages/                 #   Language-specific: TS, Python, Go, C#, Java
│   └── frameworks/                #   Framework rules (7)
│
├── orchestration/                 # ★ Multi-AI Orchestration
│   ├── patterns/                  #   11 orchestration patterns
│   ├── configs/                   #   MCP bridge configs
│   ├── skills/                    #   Orchestration skills (6)
│   ├── templates/                 #   Reusable orchestrator templates
│   └── examples/                  #   Real-world examples (6)
│
├── guides/                        # 12 comprehensive guides
├── mcp-configs/                   # MCP server configurations (6)
├── examples/                      # Project-specific copilot-instructions
│   ├── nextjs-app/
│   ├── python-api/
│   ├── dotnet-webapp/
│   └── monorepo/
│
├── contexts/                      # Context presets
├── references/                    # Checklist & pattern references
│   ├── testing-patterns.md        # AAA structure, mocking, component/API/E2E patterns
│   ├── security-checklist.md      # OWASP Top 10, auth, input validation, security headers
│   ├── performance-checklist.md   # Core Web Vitals, frontend/backend optimization
│   └── accessibility-checklist.md # WCAG 2.1 AA, keyboard nav, screen reader, forms
├── scripts/                       # Setup & migration tools
└── tests/                         # Test suite
```

---

## 核心组件

### 智能体（Agent）（8 个核心）

预配置的 agent 定义——每个都包含特定角色、system prompt 与工具集。

| Agent | 用途 |
|-------|------|
| **planner** | 将任务拆解为可执行的结构化计划，并跟踪依赖关系 |
| **architect** | 设计系统架构与组件边界 |
| **code-reviewer** | 审查代码中的缺陷、逻辑错误与安全问题 |
| **security-reviewer** | 聚焦安全审计，并进行 OWASP/CWE 分类 |
| **tdd-guide** | Test-Driven Development 工作流——red/green/refactor |
| **build-error-resolver** | 诊断并修复构建/编译错误 |
| **doc-updater** | 使文档与代码变更保持同步 |
| **refactor-cleaner** | 识别并执行安全的重构机会 |

### 技能（Skill）（共 64 个 · 8 个类别）

按类别组织的可复用工作流技能。全部遵循 [agentskills.io](https://agentskills.io) 规范。

<details>
<summary><strong>★ Copilot 专属技能（16）</strong></summary>

利用 GitHub Copilot CLI 独有能力的 skills：

| Skill | 说明 |
|-------|------|
| `context-prime` | 会话启动时加载项目上下文（README、文件树、提交记录、技术栈） |
| `session-management` | 使用内置 SQLite 进行 todo 跟踪与结构化状态管理 |
| `plan-mode-mastery` | 带审批流程的结构化文本规划 |
| `autopilot-patterns` | 带护栏的自主执行模式 |
| `background-agent` | 通过 `&` / `/delegate` 委托云端 agents |
| `fleet-parallel` | 使用 `/fleet` 进行并行 agent 执行 |
| `github-pr-workflow` | 通过内置 GitHub MCP 完成完整 PR 生命周期 |
| `github-issue-triage` | 批量 Issue 分类与分诊 |
| `actions-debugging` | 利用原生 Actions 访问能力调试 CI 失败 |
| `cross-session-memory` | 在会话间持久化知识 |
| `multi-model-strategy` | 按任务选择合适模型 |
| `mcp-ecosystem` | 通过自定义 MCP server 扩展能力 |
| `ide-switching` | VS Code ↔ CLI 无缝上下文切换 |
| `team-planner` | 通过 SQL roster + `/fleet` 分发，组建专家 agent 团队 |
| `agentic-engineering` | 设计 15 分钟任务单元、eval-first 循环与显式 I/O 契约 |
| `stack-detector` | 扫描项目技术栈并推荐本集合中的相关 skills 与规则 |
</details>

<details>
<summary><strong>开发技能（16）</strong></summary>

| Skill | 说明 |
|-------|------|
| `api-and-interface-design` | 在实现前先定义公开 API / CLI / webhook / SDK 的契约 |
| `tdd-workflow` | Red → Green → Refactor 循环 |
| `code-review` | 带严重级别的结构化评审 |
| `fix-github-issue` | 读取 Issue → 定位 bug → 修复 → 测试 → PR |
| `fix-build-errors` | 诊断并解决构建失败 |
| `performance-optimization` | 基于测量定位瓶颈，并验证性能优化是否真实生效 |
| `pr-multi-perspective-review` | 六视角 PR 评审：PM / Dev / QA / Security / DevOps / UX |
| `refactor-clean` | 安全地移除死代码并简化逻辑 |
| `spec-driven-development` | 先写技术规范再编码——先定义接口、结构与边界 |
| `context-engineering` | 优化向 AI agent 传递信息——减少噪声、提升信号 |
| `deprecation-and-migration` | 通过三阶段流程安全移除旧 API 并迁移到新模式 |
| `skill-creator` | 根据工作流描述生成新的 SKILL.md 脚手架 |
| `systematic-debugging` | 采用 reproduce → isolate → hypothesize → verify 的四阶段调试流程 |

**组合技能**（当两种技术同时使用时启用）：

| Skill | 说明 |
|-------|------|
| `nextjs-prisma` | 面向 Next.js App Router + Prisma 项目的类型安全数据获取与 Server Actions |
| `react-vitest` | 面向 React + Vitest 项目的组件测试配置与模式 |
| `nestjs-prisma` | 面向 NestJS + Prisma 的 PrismaService 单例、仓储模式与单元测试 |
</details>

<details>
<summary><strong>文档技能（5）</strong></summary>

| Skill | 说明 |
|-------|------|
| `add-to-changelog` | Keep a Changelog 格式与 semver 版本同步 |
| `doc-update` | 在实现变更时同步更新文档 |
| `api-documentation` | 从源码生成并维护 API 文档 |
| `code-tour` | 生成用于代码库入门的 VS Code CodeTour `.tour` 文件 |
| `architecture-decisions` | 以 Architecture Decision Records（ADR）记录难以逆转的技术决策 |
</details>

<details>
<summary><strong>安全技能（6）</strong></summary>

| Skill | 说明 |
|-------|------|
| `evaluate-repository` | 六维评分卡（1–10）与修复计划 |
| `security-scan` | OWASP Top 10 + 依赖审计 |
| `secret-detection` | 在源码与 git 历史中查找硬编码密钥 |
| `input-validation` | 防止注入攻击（SQL、XSS、CSRF） |
| `security-bounty-hunter` | 以漏洞赏金视角进行漏洞挖掘，并提供 PoC 步骤 |
| `pr-security-review` | 围绕认证、注入、密钥与 OWASP Top 10 的 PR 安全分析 |
</details>

<details>
<summary><strong>工作流技能（9）</strong></summary>

| Skill | 说明 |
|-------|------|
| `commit-workflow` | Conventional commits + emoji，以及原子化拆分指导 |
| `release` | tag → GitHub Release → 发布（npm/PyPI/Docker） |
| `sprint-workflow` | 完整冲刺流程：Think → Plan → Build → Review → Ship |
| `security-audit` | OWASP Top 10 + STRIDE 威胁建模 |
| `sprint-retro` | 基于 git 指标的数据驱动复盘 |
| `cost-audit` | 审计 AI 推理 token 开销，并给出模型/prompt 优化建议 |
| `council` | 为高风险决策召集四方对抗式决策 council |
| `deep-research` | 系统化多源研究与结构化综合 |
| `using-git-worktrees` | 无需重复克隆仓库即可为并行分支工作创建独立工作目录 |
</details>

<details>
<summary><strong>产品技能（5）</strong></summary>

| Skill | 说明 |
|-------|------|
| `create-prd` | 基于 JTBD 的 PRD 模板 |
| `feature-prioritization` | 影响 × 信心 × 成本矩阵 |
| `opportunity-solution-tree` | Teresa Torres 的 OST 框架 |
| `launch-strategy` | Alpha → Beta → GA 发布清单 |
| `product-capability` | 将需求转化为 SRS 风格 capability 规范，包含 AC 与可追踪性 |
</details>

<details>
<summary><strong>测试技能（4）</strong></summary>

| Skill | 说明 |
|-------|------|
| `test-coverage` | 识别覆盖缺口并编写有针对性的测试 |
| `e2e-testing` | 为关键路径搭建 E2E 测试脚手架 |
| `eval-harness` | 构建带 SQL 跟踪测试用例的 LLM pipeline 评估套件 |
| `browser-devtools` | 在运行时验证前端行为——DOM 校验、网络检查、性能分析 |
</details>

<details>
<summary><strong>内容与营销技能（3）</strong></summary>

| Skill | 说明 |
|-------|------|
| `ai-visibility` | GEO 优化：llms.txt、AI 爬虫访问 |
| `content-strategy` | 关键词研究、主题集群、内容日历 |
| `seo` | 技术 SEO 审计：Core Web Vitals、结构化数据、抓取问题 |
</details>

### 规则

按范围组织的编码规则与指南：

- **通用规则** —— 通用最佳实践（错误处理、日志、命名规范）
- **语言特定规则** —— TypeScript、Python、Go、C#、Java
- **框架特定规则** —— Next.js、React、Prisma、Playwright、NestJS、Cloudflare Workers、Vitest

### 编排

多AI协同编排系统（见下方[专门章节](#多ai协同编排-)）。

---

## 指南

| 指南 | 说明 |
|------|------|
| **Quick Start** | 5 分钟快速上手 |
| **Shortform Guide** | 面向日常使用的精简参考 |
| **Longform Guide** | 对全部功能的深入讲解 |
| **Security Guide** | 安全最佳实践与扫描方法 |
| **Copilot Exclusive Features** | 仅在 Copilot CLI 中提供的功能 |
| **Tool Selection Guide** | 为每项任务选择合适的 AI 工具 |
| **Migration Guide** | 含概念映射的分步迁移路径 |
| **Hooks to GitHub Actions** | Claude Code Hooks 替代方案（Git Hooks / Actions / Prompt Guards） |
| **Orchestration Guide** | 多AI协同编排模式与配置 |
| **Skill Writing Best Practices** | 编写真正能触发的 trigger-first 描述 |
| **Skill Testing Guide** | 为 promptware 测试触发准确性与输出质量 |
| **QA Agent Guide** | 设计可通过跨边界比较捕捉真实缺陷的 QA agent |

所有指南均位于 [`guides/`](guides/) 目录。

---

## 多AI协同编排 ★

> **社区模式。** 这不是 GitHub Copilot CLI 的官方内置功能，而是一种由社区提出的工作流模式：通过 shell scripting、MCP 与 pipeline 组合多个 AI 工具。由于具备 GitHub 集成与多模型支持，Copilot CLI 可作为便利的统一枢纽。

### 核心思路

没有任何单一 AI 在所有场景都最优。Claude 擅长推理，Codex 擅长快速实现，Gemini 擅长多模态理解，而 Copilot 擅长 GitHub 集成。那如果你能在一个地方使用**它们全部**呢？

```
┌──────────────────────────────────────────────────┐
│                GitHub Copilot CLI                │
│            (Orchestrator / Meta-Hub)             │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  │
│  │ Claude Code│  │  Codex CLI │  │ Gemini CLI │  │
│  │ (Reasoning)│  │(Impl./Gen.)│  │(Multimodal)│  │
│  └────────────┘  └────────────┘  └────────────┘  │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 5 种编排模式（模式 1–5：跨 AI）

| 模式 | 工作方式 | 适用场景 |
|------|----------|----------|
| **Shell Execution** | Copilot 通过 shell 命令拉起其他 CLI | 简单委派 |
| **MCP Bridge** | 通过 Model Context Protocol servers 连接 agents | 结构化工具共享 |
| **Message IPC** | 通过文件/管道进行进程间通信 | 实时协作 |
| **Pipeline** | 按顺序串联 agents——前一者输出成为后一者输入 | 多阶段工作流 |
| **Agent Council** | 多个 agents 共同讨论并投票决策 | 关键决策 |

### 另外 5 种模式（团队内编排）

| 模式 | 工作方式 | 适用场景 |
|------|----------|----------|
| **Fan-Out Parallel** | 同时分发独立子任务 | 批处理操作 |
| **Producer-Reviewer** | 迭代式 produce→review 反馈循环 | 产物打磨 |
| **Hierarchical Delegation** | 嵌套式 orchestrator（root→domain→specialists） | 大型跨领域任务 |
| **Iterative Refinement** | 带可衡量退出标准的自纠正循环 | 对质量敏感的生成任务 |
| **Review Trio** | 面向非 PR 产物的三方评审（RFC、schema、architecture） | 发布前评审 |

### 工具专长分工

编排生态中的每种 AI 工具都有明确专长。Copilot CLI 作为协调者将它们整合起来：

| AI 工具 | 专长 | 在工作流中的角色 |
|---------|------|------------------|
| **Copilot CLI** | GitHub 集成 · 多模型灵活性 · 编排 | 元枢纽 / 协调者 |
| **Claude Code** | 深度推理 · 大上下文分析 | 推理专家 |
| **Codex CLI** | 快速代码生成 · 样板代码 | 实现专家 |
| **Gemini CLI** | 多模态理解 · 视觉分析 | 视觉 / 多模态专家 |

### 参考与验证过的框架

该编排系统参考了真实世界中的多 agent 框架：

- [microsoft/autogen](https://github.com/microsoft/autogen) — Microsoft AutoGen framework
- [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) — CrewAI role-based agents
- [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) — LangGraph state machines
- [geekan/MetaGPT](https://github.com/geekan/MetaGPT) — MetaGPT multi-agent SOP
- [openai/swarm](https://github.com/openai/swarm) — OpenAI Swarm patterns

> 实施细节请见完整的[编排指南](guides/)。

---

## Copilot CLI 的独特之处

Copilot CLI 围绕你的 GitHub 工作流而构建。以下能力开箱即用：

| 能力 | 细节 |
|------|------|
| **GitHub-Native MCP** | Issue、PR、Actions 和代码搜索——零额外配置 |
| **20+ Model Selection** | 可按任务在 GPT-5.x、Claude Sonnet/Opus 4.6、Gemini 3 Pro 间切换 |
| **IDE ↔ CLI Context Sharing** | 在 VS Code、JetBrains 与终端间无缝切换上下文 |
| **Plan Mode** | 在写代码前进行带审批流程的结构化文本规划 |
| **Autopilot Mode** | 带护栏的自主任务执行 _（实验性功能）_ |
| **Background Agents** | 通过 `&` / `/delegate` 委托云端 agents；用 `/resume` 恢复 |
| **Fleet Mode** | 并行 agent 执行——同时将任务分配给多个 agents |
| **Session SQL Database** | 每会话内置 SQLite，用于结构化状态与 todo 跟踪 |
| **Cross-Session Memory** | 通过 `session_store` 持久化知识——跨会话学习与召回 |
| **LSP Integration** | Language Server Protocol 提供精准、符号感知的代码智能 |
| **Multi-AI Orchestration** | 从单一枢纽协调 Claude Code、Codex、Gemini CLI |

> 详见 [Copilot Exclusive Features guide](guides/) 以深入了解每项能力。

---

## 从其他工具迁移

从其他 AI 编码工具迁移而来？skill 格式几乎一致，因此迁移非常直接：

```
CLAUDE.md rules        →  .github/copilot-instructions.md
.claude/commands/      →  skills/
.claude/settings.json  →  mcp-configs/ & contexts/
Claude Code Hooks      →  Git Hooks / GitHub Actions / Prompt Guards
```

迁移脚本可自动完成大部分工作：

```bash
node scripts/migrate-from-claude.js --source /path/to/your/project
```

> 请参阅完整的[迁移指南](guides/migration-from-claude-code.md)与[Hooks Alternatives Guide](guides/hooks-to-github-actions.md)。

---

## 贡献指南

欢迎贡献！你可以这样参与：

1. **新增 agents** —— 在 `agents/` 中定义新的 agent 角色
2. **创建 skills** —— 在 `skills/` 中构建可复用工作流
3. **编写规则** —— 在 `rules/` 中添加编码指南
4. **分享编排模式** —— 向 `orchestration/` 贡献内容
5. **改进指南** —— 完善 `guides/` 文档
6. **补充示例** —— 在 `examples/` 展示真实场景配置

### 开发

```bash
# Install dependencies
npm install

# Validate configs
npm run validate

# Run tests
npm test

# Lint markdown
npm run lint:md
```

提交 PR 前，请先阅读现有指南并遵循既有模式。

---

## 许可证

[MIT](LICENSE) © Everything Copilot CLI Contributors

---

<p align="center">
  <sub>Built for the GitHub Copilot CLI community · Inspired by <a href="https://github.com/affaan-m/everything-claude-code">everything-claude-code</a> and <a href="https://github.com/hesreallyhim/awesome-claude-code">awesome-claude-code</a></sub>
</p>
