<p align="center">
  <img src="docs/images/copilot.svg" width="80" alt="Copilot CLI" />
</p>

<h1 align="center">everything-copilot-cli</h1>

<p align="center">
  <strong>面向 GitHub Copilot CLI 的 Copilot-first 指南与配置系统</strong><br/>
  Agents · Skills · Rules · 多AI协同编排
</p>

<p align="center">
  <a href="LICENSE"><img src="docs/images/badge-license.svg" alt="MIT License" /></a>
  <a href="#"><img src="docs/images/badge-copilot-cli-ready.svg" alt="Copilot CLI Ready" /></a>
  <a href="#"><img src="docs/images/badge-models.svg" alt="20+ Models" /></a>
  <a href="#"><img src="docs/images/badge-agents.svg" alt="8 Agents" /></a>
  <a href="#"><img src="docs/images/badge-skills.svg" alt="105 Skills" /></a>
  <a href="#多ai协同编排-"><img src="docs/images/badge-multi-ai.svg" alt="Multi-AI Orchestrator" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.ja.md">日本語</a>
</p>

---

## 这是什么？

**everything-copilot-cli** 是一个用于在 GitHub 上运营 AI 辅助软件交付的 Copilot-first 操作套件。

这个仓库围绕三个理念构建：

- **GitHub 作为 system of record** —— Issue、PR、Actions 与代码搜索不是附属信息，而是一等输入
- **Copilot CLI 作为 orchestration hub** —— 将任务路由给合适的模型或 agent，并把结果重新汇入 GitHub 流程的协调层
- **模型选择是 routing，而不是 loyalty** —— 在 Copilot 内按任务选择 GPT、Claude、Gemini；当外部 specialist tool 更合适时，再编排 Codex CLI 之类的工具

因此，这个仓库提供的是一整套 agents、skills、rules、MCP 配置与 orchestration patterns：能 portable 的部分保持 portable，需要原生能力的部分则明确采用 Copilot-native 方式。

> 若想了解本仓库的 community patterns 如何协调 Claude Code、Codex CLI、Gemini CLI 等外部 specialist workers，请参见 [多AI协同编排](#多ai协同编排-)。

---

## 设计原则

| 原则 | 实际含义 |
|------|----------|
| **GitHub 作为 system of record** | 所有 workflow 都从 GitHub 开始并回到 GitHub。Issue 是任务输入，PR 是 agent 输出，Actions 是观测层。 |
| **Copilot CLI 作为 orchestration hub** | Copilot 不只是生成代码，而是协调 specialist。Claude 擅长深度推理，Codex 擅长快速生成，Gemini 擅长视觉分析；Copilot 负责路由与综合。 |
| **模型选择是 routing，不是 loyalty** | 没有一个单一模型能赢下所有任务。本仓库中的 skills 与 patterns 都围绕“把子任务路由给最合适的模型”来设计。 |
| **Portable core, Copilot-native layer** | 大多数 skills 都可运行在 agentskills.io 兼容 runtime 中。Copilot 专属能力被明确隔离在 `skills/copilot-exclusive/` 下，因此你始终知道哪些部分依赖原生 Copilot 能力。 |

---

## 为什么选择 Copilot CLI？

让 Copilot CLI 成为 multi-AI 开发 workflow 强力枢纽的，主要是三项能力：

**GitHub-native access** —— Copilot CLI 内置 GitHub MCP server。Issue、PR、Actions 日志与代码搜索都是结构化工具调用，不是抓取来的文本，也不需要额外的 GitHub 集成层。

**多模型路由** —— 在同一会话里，可以通过 `/model` 或按 agent 覆盖来切换 GPT、Claude、Gemini 等模型家族。架构任务用高阶推理模型，样板代码用快速模型，分诊用低成本模型。

**编排原语** —— Plan Mode、Autopilot、Fleet、Background Delegation 以及内置 SQLite session DB，提供了构建复杂 multi-agent workflow 的基础部件。当外部 specialist tool 更适合时，本仓库的 orchestration patterns 也说明了如何把任务委派给 Codex CLI、Claude Code 或 Gemini CLI，并把结果重新带回 GitHub。

<details>
<summary>完整能力参考（11 项）</summary>

| # | 优势 | 说明 |
|---|------|------|
| 1 | **GitHub-Native Integration** | Issue、PR、Actions、代码搜索——全部通过内置 MCP 完成，无需额外配置。 |
| 2 | **20+ Model Selection** | GPT-5.x、Claude Sonnet/Opus 4.6、Gemini 3.1 Pro——可按任务选择最合适模型。 |
| 3 | **IDE ↔ CLI Seamless Switching** | 在 VS Code、JetBrains 与终端中共享同一 Copilot 上下文。 |
| 4 | **Plan Mode** | 结构化文本规划——在编写任何代码前先生成分步实施计划。 |
| 5 | **Autopilot Mode** | 带护栏的自主任务执行。_（实验性功能）_ |
| 6 | **Background Agents** | 通过 `&` 或 `/delegate` 委托云端 Copilot agents；可随时用 `/resume` 恢复。 |
| 7 | **Fleet Mode** | 并行 agent 执行——将工作同时分配给多个 agents。 |
| 8 | **Session SQL Database** | 内置每会话 SQLite，用于结构化数据、todo 跟踪与状态管理。 |
| 9 | **Cross-Session Memory** | 通过 `session_store` 检索并复用过往会话历史。 |
| 10 | **LSP First-Class Support** | 集成 Language Server Protocol，提供精准代码智能。 |
| 11 | **Multi-AI Orchestrator** | 以 Copilot 为元枢纽，编排 Claude Code、Codex、Gemini CLI。_(community pattern)_ |

</details>

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
npm run setup -- --target /path/to/your-project
```

第一条命令会快速验证 README 中的 clone + setup 流程。第二条命令也仍然在这个仓库根目录执行，并把这套集合安装到 `--target` 指定的项目路径中。

在第 4 步中，你可以选择以下安装配置：

| 配置 | 是否推荐 | 安装内容 |
|---|---|---|
| `minimal` | 适合轻量开始 | 只安装 `.github/copilot-instructions.md` |
| `recommended` | **是** | starter instructions、agents、skills、rules |
| `full` | 适合高级场景 | 安装全部内容，包括 contexts |
| `custom` | 需要精细控制时 | 带说明逐项选择每个组件 |

setup 会把项目 instructions 写入 `.github/copilot-instructions.md`，并把 custom agents 安装到 `.github/agents/`、project skills 安装到 `.github/skills/`、rules 安装到 `.github/copilot/rules/`。`full` 配置还会把 contexts 安装到 `.github/copilot/contexts/`。

随后打开终端，开始使用安装到项目中的 agent、skill 与规则：

```bash
# Start a session in your project directory
cd your-project
copilot
```

启动 `copilot` 后，可以用下面的方法快速确认安装是否被识别：

```text
- 启动横幅应显示项目 custom instruction，并且 project skills / agents 数量会增加。
- 运行 `/instructions` 时，应看到已安装的 project instructions。
- 运行 `/skills` 时，除了 built-in 项目，还应看到 project skills。
- 运行 `/agent` 时，应看到 `planner` 等 custom agents。
- 如果只看到 built-in skills、看不到 project agents，说明当前仓库里还没有成功识别这套集合。
```

```bash
# Use the planner agent (inside the session)
> Design a REST API for user management — use plan mode

# Run TDD workflow
> Add tests for the auth module using TDD

# Orchestrate multiple AIs
> Claude reasons architecture, Codex implements, Copilot reviews — delegate accordingly
```

> 详细说明请参见[快速入门指南](guides/the-quickstart-guide.md)。
> 如果你想直接复制粘贴完成一套入门实操，请参见 [Beginner Skills Tutorial](guides/the-beginner-skills-tutorial.zh.md)。

---

## 仓库结构

```text
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
├── skills/                        # Reusable workflow skills (105 total)
│   ├── copilot-exclusive/         #   ★ Copilot-only skills (26)
│   ├── development/               #   Dev skills (24)
│   ├── documentation/             #   Doc skills (6)
│   ├── security/                  #   Security skills (11)
│   ├── testing/                   #   Test skills (6)
│   ├── workflow/                  #   Workflow skills (24)
│   ├── product/                   #   Product skills (5)
│   └── content/                   #   Content & GEO skills (3)
│
├── rules/                         # Coding rules & guidelines
│   ├── common/                    #   Universal rules (6)
│   ├── languages/                 #   Language-specific: TS, Python, Go, C#, Java, C++
│   └── frameworks/                #   Framework rules (8)
│
├── orchestration/                 # ★ Multi-AI Orchestration
│   ├── patterns/                  #   11 orchestration patterns
│   ├── configs/                   #   MCP bridge configs
│   ├── skills/                    #   Orchestration skills (7)
│   ├── templates/                 #   Reusable orchestrator templates
│   └── examples/                  #   Real-world examples (6)
│
├── guides/                        # 16 comprehensive guides
├── mcp-configs/                   # MCP server configurations (7 files; 6 configs + README)
├── examples/                      # Project-specific copilot-instructions
│   ├── nextjs-app/
│   ├── python-api/
│   ├── dotnet-webapp/
│   └── monorepo/
│
├── contexts/                      # Context presets
├── references/                    # Checklist & pattern references（根目录 + 子目录共 13 个文件）
│   ├── github-actions-efficiency/ #   Actions 效率审计参考
│   ├── github-codespaces-efficiency/ # Codespaces 优化指南
│   ├── security-scan/             #   按技术栈拆分的安全参考
│   ├── testing-patterns.md        # AAA structure, mocking, component/API/E2E patterns
│   ├── security-checklist.md      # OWASP Top 10, auth, input validation, security headers
│   ├── performance-checklist.md   # Core Web Vitals, frontend/backend optimization
│   ├── accessibility-checklist.md # WCAG 2.1 AA, keyboard nav, screen reader, forms
│   └── ecosystem-monitoring-playbook.md # 监控节奏、提示模板与 adopt/adapt/reject 输出约定
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

### 技能（Skill）（共 105 个 · 8 个类别）

按类别组织的可复用工作流技能。全部遵循 [agentskills.io](https://agentskills.io) 规范。

<details>
<summary><strong>★ Copilot 专属技能（26）</strong></summary>

利用 GitHub Copilot CLI 独有能力的 skills：

| Skill | 说明 |
|-------|------|
| `context-prime` | 会话启动时加载项目上下文（README、文件树、提交记录、技术栈） |
| `session-management` | 使用内置 SQLite 进行 todo 跟踪与结构化状态管理 |
| `plan-mode-mastery` | 带审批流程的结构化文本规划 |
| `autopilot-patterns` | 带护栏的自主执行模式 |
| `background-agent` | 通过 `&` / `/delegate` 委托云端 agents |
| `fleet-parallel` | 使用 `/fleet` 进行并行 agent 执行 |
| `github-code-search` | 使用 GitHub 全局代码搜索查找真实实现示例，并将结果注入为上下文 |
| `github-pr-workflow` | 通过内置 GitHub MCP 完成完整 PR 生命周期 |
| `github-issue-triage` | 批量 Issue 分类与分诊 |
| `github-codespaces-efficiency` | 审计 GitHub Codespaces 的启动时间、机器规格、prebuild 范围与成本，并在保留必要开发工具的前提下优化 |
| `actions-debugging` | 利用原生 Actions 访问能力调试 CI 失败 |
| `cross-session-memory` | 检索并恢复先前的会话上下文 |
| `copilot-memory` | 审查并整理 CLI、云代理与代码评审共享的仓库级 Copilot Memory |
| `knowledge-curator` | 将反复出现的经验沉淀为持久的项目指引 |
| `mcp-builder` | 构建新的 MCP server，并完成校验、热重载与端到端测试 |
| `multi-model-strategy` | 按任务选择合适模型 |
| `mcp-ecosystem` | 通过自定义 MCP server 扩展能力 |
| `ide-switching` | VS Code ↔ CLI 无缝上下文切换 |
| `scope-guard` | 将任务锁定在狭窄的可写范围内，并为高风险变更加上显式停止规则 |
| `team-planner` | 通过 SQL roster + `/fleet` 分发，组建专家 agent 团队 |
| `agentic-engineering` | 设计 15 分钟任务单元、eval-first 循环与显式 I/O 契约 |
| `stack-detector` | 扫描项目技术栈并推荐本集合中的相关 skills 与规则 |
| `task-intake-router` | 将传入任务路由到合适的模式、agent type、模型与委托路径 |
| `ecosystem-intake` | 将精选生态来源转成 adopt/adapt/reject 待办候选 |
| `sub-agent-sandboxing` | 为委托任务增加循环检测、熔断器与沙箱升级规则，在接受输出前先加上运行时护栏 |
| `token-cost-optimizer` | 在大型 Copilot 任务前主动压低模型、上下文与并行带来的计费压力 |

</details>

<details>
<summary><strong>开发技能（24）</strong></summary>

| Skill | 说明 |
|-------|------|
| `api-and-interface-design` | 在实现前先定义公开 API / CLI / webhook / SDK 的契约 |
| `tdd-workflow` | Red → Green → Refactor 循环 |
| `code-review` | 带严重级别的结构化评审 |
| `cpp-debugging` | 当 C++ 故障涉及对象生命周期、未定义行为、原生崩溃或仅在调试器中显现的状态时，先用符号、sanitizer 与平台原生调试器定位根因，再避免症状式修补 |
| `fix-github-issue` | 读取 Issue → 定位 bug → 修复 → 测试 → PR |
| `implement` | 将 PRD、规格或 Issue 通过五步循环（TDD → 类型检查 → 全量测试 → /review → commit）转化为已提交的代码 |
| `fix-build-errors` | 诊断并解决构建失败 |
| `improve-codebase-architecture` | 当代码库变得难以修改、测试或理解时，梳理架构摩擦点，并把一个更深的模块候选收敛为可执行的重构方向 |
| `performance-optimization` | 基于测量定位瓶颈，并验证性能优化是否真实生效 |
| `pr-multi-perspective-review` | 六视角 PR 评审：PM / Dev / QA / Security / DevOps / UX |
| `review` | 以固定 git 基准点为参照，从仓库规范与原始规格两个独立维度审查变更 |
| `prototype` | 当设计问题仍然模糊时，快速构建只为回答一个问题的临时 logic/UI 原型，并预期后续删除或吸收 |
| `refactor-clean` | 安全地移除死代码并简化逻辑 |
| `diagnose` | 先构建最快的反馈回路，再给主要假设排序，并只添加能缩小搜索范围的定向观测 |
| `source-driven-development` | 先核对官方文档与 API，再开始实现的 source-first 开发方式 |
| `spec-driven-development` | 先写技术规范再编码——先定义接口、结构与边界 |
| `context-engineering` | 优化向 AI agent 传递信息——减少噪声、提升信号 |
| `deprecation-and-migration` | 通过三阶段流程安全移除旧 API 并迁移到新模式 |
| `skill-creator` | 根据工作流描述生成新的 SKILL.md 脚手架 |
| `systematic-debugging` | 采用 reproduce → isolate → hypothesize → verify 的四阶段调试流程 |
| `zoom-out` | 从局部代码细节上移一个抽象层级，梳理所属模块、调用方，并用项目术语重述系统作用 |

**组合技能**（当两种技术同时使用时启用）：

| Skill | 说明 |
|-------|------|
| `nextjs-prisma` | 面向 Next.js App Router + Prisma 项目的类型安全数据获取与 Server Actions |
| `react-vitest` | 面向 React + Vitest 项目的组件测试配置与模式 |
| `nestjs-prisma` | 面向 NestJS + Prisma 的 PrismaService 单例、仓储模式与单元测试 |

</details>

<details>
<summary><strong>文档技能（6）</strong></summary>

| Skill | 说明 |
|-------|------|
| `add-to-changelog` | Keep a Changelog 格式与 semver 版本同步 |
| `doc-update` | 在实现变更时同步更新文档 |
| `document-generate` | 为功能、模块或项目从源码新建 Diataxis 文档覆盖 |
| `api-documentation` | 从源码生成并维护 API 文档 |
| `code-tour` | 生成用于代码库入门的 VS Code CodeTour `.tour` 文件 |
| `architecture-decisions` | 以 Architecture Decision Records（ADR）记录难以逆转的技术决策 |

</details>

<details>
<summary><strong>安全技能（11）</strong></summary>

| Skill | 说明 |
|-------|------|
| `agent-owasp-check` | 按 OWASP Agentic Security Initiative Top 10 审计 AI agent 系统 |
| `agent-governance` | 为 AI agent 系统加入策略控制、审批关卡、信任评分与 append-only 审计轨迹 |
| `agent-supply-chain` | 校验 agent 插件与 MCP bundle 的完整性清单，检测篡改并实施晋级关卡 |
| `evaluate-repository` | 含 AI agent 治理维度的七维评分卡（1–10）与修复计划 |
| `gha-security-review` | 审查 GitHub Actions workflow 中的 pwn request、表达式注入、凭证提权等 CI/CD 攻击路径 |
| `security-scan` | OWASP Top 10 + 依赖审计 |
| `secret-detection` | 在源码与 git 历史中查找硬编码密钥 |
| `input-validation` | 防止注入攻击（SQL、XSS、CSRF） |
| `security-bounty-hunter` | 以漏洞赏金视角进行漏洞挖掘，并提供 PoC 步骤 |
| `pr-security-review` | 围绕认证、注入、密钥与 OWASP Top 10 的 PR 安全分析 |
| `threat-model-analyst` | 构建或更新包含信任边界、abuse case 与变更聚焦发现的 STRIDE-A 威胁模型 |

</details>

<details>
<summary><strong>工作流技能（24）</strong></summary>

| Skill | 说明 |
|-------|------|
| `commit-workflow` | Conventional commits + emoji，以及原子化拆分指导 |
| `conventional-branch` | 在并行工作开始前，以 conventional 的类型/描述格式创建或校验 Git 分支名 |
| `doubt-driven-development` | 在非平凡决策落定前，用 fresh-context 对抗式审查先尝试证伪 |
| `release` | tag → GitHub Release → 发布（npm/PyPI/Docker） |
| `verification-before-completion` | 在宣称完成前，用最新命令输出证明任务确实完成 |
| `sprint-workflow` | 完整冲刺流程：Think → Plan → Build → Review → Test → Ship → Monitor |
| `deployment-canary` | 发布后 canary 检查、回滚阈值，以及 promote/hold 决策 |
| `security-audit` | OWASP Top 10 + STRIDE 威胁建模 |
| `sprint-retro` | 基于 git 指标的数据驱动复盘 |
| `cost-audit` | 审计 AI 推理 token 开销，并给出模型/prompt 优化建议 |
| `github-actions-efficiency` | 审计 GitHub Actions workflow 的 CI minutes、缓存、concurrency、触发范围与浪费执行 |
| `council` | 为高风险决策召集四方对抗式决策 council |
| `deep-research` | 系统化多源研究与结构化综合 |
| `grill-me` | 以一次一个问题的方式拷问方案，直到假设、依赖和风险都被说清 |
| `grill-with-docs` | 对照现有文档、术语和 ADR，在实现前拷问并校正方案 |
| `handoff` | 不重复已有 artifact，为下一个 session、agent 或机器生成可移植交接文档 |
| `implementation-review` | 将实现结果 diff 与原始任务说明逐项比对，并产出可直接执行的修正反馈 |
| `interview-me` | 在写计划、规格或代码前，先挖出用户真正想要的结果 |
| `llm-wiki` | 当研究或领域知识在不同会话里反复被重新整理时，使用补充性的 markdown wiki 累积合成知识，同时不替代 GitHub 或已提交的项目指引 |
| `outside-voice` | 在实现前、中、后分别以 challenge / consult / review 模式获取独立的第二意见 |
| `prompt-optimizer` | 把粗糙 prompt 重写成没有占位符、可直接发送的聊天 prompt |
| `to-issues` | 将计划、规范或 PRD 拆成可验证的薄垂直切片 issue |
| `triage` | 当单个 issue 需要结构化分诊时，完成分类、复现、补充信息请求，并把后续 brief 或关闭说明沉淀到 issue tracker 中 |
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
<summary><strong>测试技能（6）</strong></summary>

| Skill | 说明 |
|-------|------|
| `test-coverage` | 识别覆盖缺口并编写有针对性的测试 |
| `e2e-testing` | 为关键路径搭建 E2E 测试脚手架 |
| `eval-harness` | 构建带 SQL 跟踪测试用例的 LLM pipeline 评估套件 |
| `qa-review` | 从 QA 视角审查测试金字塔分布、测试质量、可靠性与 CI 缺陷报告 |
| `browser-devtools` | 在运行时验证前端行为——DOM 校验、网络检查、性能分析 |
| `ux-audit` | 用 Krug 风格可用性启发式检查界面，并输出带优先级的问题列表 |

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
- **框架特定规则** —— Next.js、React、Vue、Prisma、Playwright、NestJS、Cloudflare Workers、Vitest

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
| **Copilot vs Claude Code** | 比较两种工具的优势、取舍与协作方式 |
| **Migration from Claude Code** | 含概念映射的分步迁移路径 |
| **Hooks to GitHub Actions** | Claude Code Hooks 替代方案（Git Hooks / Actions / Prompt Guards） |
| **Orchestration Guide** | 多AI协同编排模式与配置 |
| **Skill Writing Best Practices** | 编写真正能触发的 trigger-first 描述 |
| **Skill Testing Guide** | 为 promptware 测试触发准确性与输出质量，并将 Promptfoo 作为可选的输出质量补充工具 |
| **QA Agent Guide** | 设计可通过跨边界比较捕捉真实缺陷的 QA agent |
| **Beginner Skills Tutorial (EN)** | 用复制粘贴实验感受普通 prompt 与 skill 引导的差异 |
| **Beginner Skills Tutorial (KO)** | 韩文版入门技能实操教程 |
| **Beginner Skills Tutorial (JA)** | 日文版入门技能实操教程 |
| **Beginner Skills Tutorial (ZH)** | 中文版入门技能实操教程 |

所有指南均位于 [`guides/`](guides/) 目录。

---

## 多AI协同编排 ★

> **两层能力 —— 需要明确区分。**
>
> **Copilot-native**：GitHub MCP、`/model` 切换、Plan Mode、Autopilot、Fleet、Background Agents 与 Session SQL database 都是 Copilot CLI 内建能力。
>
> **Community pattern**：与 Claude Code、Codex CLI、Gemini CLI 的跨工具协同，是本仓库记录的 shell/MCP/pipeline 工作流模式。它依赖外部 CLI 已安装，并不是 Copilot 的官方内置能力。

### 核心思路

没有任何单一 AI 在所有场景都最优。Claude 擅长推理，Codex 擅长快速实现，Gemini 擅长多模态理解，而 Copilot 擅长 GitHub 集成。那如果你能在一个地方使用**它们全部**呢？

```text
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
| **Shell Invocation** | Copilot 通过 shell 命令调用其他 CLI | 简单委派 |
| **MCP Bridge** | 通过 Model Context Protocol servers 连接 agents | 结构化工具共享 |
| **Message IPC** | 通过文件/管道进行进程间通信 | 实时协作 |
| **Pipeline** | 按顺序串联 agents——前一者输出成为后一者输入 | 多阶段工作流 |
| **Agent Council** | 多个 agents 共同讨论并投票决策 | 关键决策 |

### 另外 6 种模式（团队内编排，模式 6–11）

| 模式 | 工作方式 | 适用场景 |
|------|----------|----------|
| **Fan-Out Parallel** | 同时分发独立子任务 | 批处理操作 |
| **Producer-Reviewer** | 迭代式 produce→review 反馈循环 | 产物打磨 |
| **Hierarchical Delegation** | 嵌套式 orchestrator（root→domain→specialists） | 大型跨领域任务 |
| **Iterative Refinement** | 带可衡量退出标准的自纠正循环 | 对质量敏感的生成任务 |
| **Review Trio** | 面向非 PR 产物的三方评审（RFC、schema、architecture） | 发布前评审 |
| **Sub-Agent Sandboxing** | 用 worktree、范围与权限边界隔离被委派 agent | 高安全要求的委派 |

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

> 实施细节请见完整的[编排指南](guides/the-orchestration-guide.md)。

---

## Copilot CLI 的独特之处

Copilot CLI 围绕你的 GitHub 工作流而构建。以下能力开箱即用：

| 能力 | 细节 |
|------|------|
| **GitHub-Native MCP** | Issue、PR、Actions 和代码搜索——零额外配置 |
| **20+ Model Selection** | 可按任务在 GPT-5.x、Claude Sonnet/Opus 4.6、Gemini 3.1 Pro 间切换 |
| **IDE ↔ CLI Context Sharing** | 在 VS Code、JetBrains 与终端间无缝切换上下文 |
| **Plan Mode** | 在写代码前进行带审批流程的结构化文本规划 |
| **Autopilot Mode** | 带护栏的自主任务执行 _（实验性功能）_ |
| **Background Agents** | 通过 `&` / `/delegate` 委托云端 agents；用 `/resume` 恢复 |
| **Fleet Mode** | 并行 agent 执行——同时将任务分配给多个 agents |
| **Session SQL Database** | 每会话内置 SQLite，用于结构化状态与 todo 跟踪 |
| **Cross-Session Memory** | 通过 `session_store` 与 `/resume` 检索并复用过往会话历史 |
| **LSP Integration** | Language Server Protocol 提供精准、符号感知的代码智能 |
| **Multi-AI Orchestration** | 从单一枢纽协调 Claude Code、Codex、Gemini CLI _(community pattern)_ |

> 详见 [Copilot Exclusive Features guide](guides/copilot-exclusive-features.md) 以深入了解每项能力。

---

## 从其他工具迁移

从其他 AI 编码工具迁移而来？skill 格式几乎一致，因此迁移非常直接：

```text
CLAUDE.md rules        →  .github/copilot-instructions.md
.claude/commands/      →  .github/skills/
.claude/settings.json  →  mcp-configs/ & contexts/
Claude Code Hooks      →  Git Hooks / GitHub Actions / Prompt Guards
```

迁移脚本可自动完成大部分工作：

```bash
node scripts/migrate-from-claude.js /path/to/your/project
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
  <sub>为 GitHub Copilot CLI 社区而构建</sub>
</p>

<p align="center">
  <sub>谨向 <a href="https://github.com/affaan-m/everything-claude-code">everything-claude-code</a> 与 <a href="https://github.com/hesreallyhim/awesome-claude-code">awesome-claude-code</a> 的先行工作致意</sub>
</p>
