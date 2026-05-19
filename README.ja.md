<p align="center">
  <img src="docs/images/copilot.svg" width="80" alt="Copilot CLI" />
</p>

<h1 align="center">everything-copilot-cli</h1>

<p align="center">
  <strong>GitHub Copilot CLI のための Copilot-first ガイド＆設定システム</strong><br/>
  Agents · Skills · Rules · Multi-AI Orchestration
</p>

<p align="center">
  <a href="LICENSE"><img src="docs/images/badge-license.svg" alt="MIT License" /></a>
  <a href="#"><img src="docs/images/badge-copilot-cli-ready.svg" alt="Copilot CLI Ready" /></a>
  <a href="#"><img src="docs/images/badge-models.svg" alt="20+ Models" /></a>
  <a href="#"><img src="docs/images/badge-agents.svg" alt="8 Agents" /></a>
  <a href="#"><img src="docs/images/badge-skills.svg" alt="96 Skills" /></a>
  <a href="#multi-ai-orchestration-"><img src="docs/images/badge-multi-ai.svg" alt="Multi-AI Orchestrator" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.zh.md">中文</a>
</p>

---

## これは何ですか？

**everything-copilot-cli** は、GitHub 上で AI 支援ソフトウェア開発を運用するための Copilot-first な運用キットです。

このリポジトリは次の三つの考え方を軸にしています:

- **GitHub を system of record として扱う** — Issue、PR、Actions、code search を補助情報ではなく第一級の入力として扱います
- **Copilot CLI を orchestration hub として扱う** — task を適切な model や agent にルーティングし、その結果を GitHub の流れへ戻す調整レイヤーとして捉えます
- **model 選択は loyalty ではなく routing** — Copilot 内では GPT、Claude、Gemini を task ごとに使い分け、別の specialist tool が適切なら Codex CLI のような外部ツールもオーケストレーションします

その結果、このリポジトリは agent、skill、rule、MCP 設定、orchestration pattern をまとめて提供します。可能なものは portable に、Copilot の強みが重要な部分は Copilot-native に設計しています。

> このリポジトリの community pattern が Claude Code、Codex CLI、Gemini CLI のような外部 specialist worker をどう連携させるかは [Multi-AI Orchestration](#multi-ai-orchestration-) を参照してください。

---

## 設計原則

| 原則 | 実際の意味 |
|------|------------|
| **GitHub を system of record にする** | すべての workflow は GitHub で始まり GitHub で終わります。Issue は task 入力、PR は agent 出力、Actions は observability layer です。 |
| **Copilot CLI を orchestration hub にする** | Copilot は単に code を生成するだけでなく specialist を調整します。Claude は深い reasoning、Codex は高速生成、Gemini は visual analysis を担当し、Copilot はそれを routing・synthesis します。 |
| **model choice は loyalty ではなく routing** | すべての task に最適な単一 model はありません。このリポジトリの skill と pattern は subtask ごとに最適な model へルーティングする前提で設計されています。 |
| **Portable core, Copilot-native layer** | 多くの skill は agentskills.io 互換 runtime ならどこでも動作します。Copilot 専用機能は `skills/copilot-exclusive/` に分離され、native Copilot 依存が明確です。 |

---

## なぜ Copilot CLI なのか？

Copilot CLI が multi-AI 開発 workflow のハブとして強い理由は、次の三つの能力にあります。

**GitHub-native access** — Copilot CLI は GitHub MCP server を標準で備えています。Issue、PR、Actions log、code search をスクレイピングされた text ではなく、構造化された tool call として扱えます。追加の GitHub integration layer は不要です。

**Multi-model routing** — 同じ session の中で `/model` や agent ごとの override を使い、GPT、Claude、Gemini 系 model を切り替えられます。architecture には高性能 reasoning model、boilerplate には高速 model、triage には低コスト model を選ぶ、といった運用が可能です。

**Orchestration primitives** — Plan Mode、Autopilot、Fleet、Background Delegation、組み込み SQLite session DB が、複雑な multi-agent workflow の building block になります。別の specialist tool が適切なら、このリポジトリの orchestration pattern で Codex CLI、Claude Code、Gemini CLI に委任し、結果を GitHub に戻せます。

<details>
<summary>フル機能リファレンス（11項目）</summary>

| # | 強み | 説明 |
|---|-----------|-------------|
| 1 | **GitHub ネイティブ統合** | Issue、PR、Actions、code search をすべて組み込み MCP で利用できます。追加設定は不要です。 |
| 2 | **20+ モデル選択** | GPT-5.x、Claude Sonnet/Opus 4.6、Gemini 3 Pro から、task ごとに最適なモデルを選べます。 |
| 3 | **IDE ↔ CLI のシームレス切り替え** | VS Code、JetBrains、terminal で同じ Copilot context を共有できます。 |
| 4 | **Plan Mode** | 構造化テキストで計画できます。Copilot はコードを書く前に段階的な実装計画を作成します。 |
| 5 | **Autopilot Mode** | ガードレール付きの自律 task 実行。_（実験的機能）_ |
| 6 | **Background Agents** | `&` または `/delegate` で cloud Copilot agent に委任し、`/resume` でいつでも再開できます。 |
| 7 | **Fleet Mode** | 複数 agent を同時並列で実行し、作業を分割できます。 |
| 8 | **Session SQL Database** | session ごとに組み込み SQLite を利用でき、構造化データ、todo 追跡、状態管理が可能です。 |
| 9 | **Cross-Session Memory** | `session_store` で以前の session 履歴を検索し、再利用できます。 |
| 10 | **LSP のファーストクラスサポート** | Language Server Protocol 統合により、高精度な code intelligence を実現します。 |
| 11 | **Multi-AI Orchestrator** | Copilot をメタハブとして Claude Code、Codex、Gemini CLI をオーケストレーションできます。_(community pattern)_ |

</details>

---

## クイックスタート

```bash
# 1. Install GitHub Copilot CLI
npm install -g @github/copilot

# 2. Clone this repository
git clone https://github.com/drvoss/everything-copilot-cli.git
cd everything-copilot-cli

# 3. Clone したリポジトリを検証
npm install && npm run setup

# 4. 自分のプロジェクトにコレクションをインストール
npm run setup -- --target /path/to/your-project
```

最初のコマンドは、README に記載された clone + setup フローを簡易検証します。2つ目のコマンドもこのリポジトリのルートで実行し、`--target` で指定したプロジェクトのパスへコレクションをインストールします。

ステップ 4 では次のインストールプロファイルを選べます:

| プロファイル | 推奨 | インストール内容 |
|---|---|---|
| `minimal` | 軽く始めたい場合 | `.github/copilot-instructions.md` のみ |
| `recommended` | **はい** | starter instructions、agents、skills、rules |
| `full` | 高度なセットアップ向け | contexts を含むすべて |
| `custom` | 細かく選びたい場合 | 各コンポーネントを説明付きで個別選択 |

setup はプロジェクトの instructions を `.github/copilot-instructions.md` に書き込み、custom agents を `.github/agents/` に、project skills を `.github/skills/` に、rules を `.github/copilot/rules/` にインストールします。`full` profile では contexts も `.github/copilot/contexts/` に配置されます。

その後、project にインストールした agent・skill・rule を使って Copilot CLI を開始します。

```bash
# Start a session in your project directory
cd your-project
copilot
```

`copilot` を起動したら、インストールが認識されているかを次の方法ですぐ確認できます:

```text
- 起動バナーに project の custom instruction が表示され、project skills / agents の数も増えているはずです。
- `/instructions` でインストール済みの project instructions が表示されるはずです。
- `/skills` で built-in だけでなく project skills も表示されるはずです。
- `/agent` で `planner` などの custom agent が表示されるはずです。
- built-in skills しか表示されず project agents もない場合は、このリポジトリのインストール内容がまだ現在の project で検出されていません。
```

```bash
# Use the planner agent (inside the session)
> Design a REST API for user management — use plan mode

# Run TDD workflow
> Add tests for the auth module using TDD

# Orchestrate multiple AIs
> Claude reasons architecture, Codex implements, Copilot reviews — delegate accordingly
```

> 詳細な手順は [Quick Start Guide](guides/the-quickstart-guide.md) を参照してください。
> コピペで試せるやさしい実習は [Beginner Skills Tutorial](guides/the-beginner-skills-tutorial.ja.md) を参照してください。

---

## リポジトリ構造

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
├── skills/                        # Reusable workflow skills (96 total)
│   ├── copilot-exclusive/         #   ★ Copilot-only skills (25)
│   ├── development/               #   Dev skills (23)
│   ├── documentation/             #   Doc skills (6)
│   ├── security/                  #   Security skills (7)
│   ├── testing/                   #   Test skills (5)
│   ├── workflow/                  #   Workflow skills (22)
│   ├── product/                   #   Product skills (5)
│   └── content/                   #   Content & GEO skills (3)
│
├── rules/                         # Coding rules & guidelines
│   ├── common/                    #   Universal rules (6)
│   ├── languages/                 #   Language-specific: TS, Python, Go, C#, Java, C++
│   └── frameworks/                #   Framework rules (7)
│
├── orchestration/                 # ★ Multi-AI Orchestration
│   ├── patterns/                  #   11 orchestration patterns
│   ├── configs/                   #   MCP bridge configs
│   ├── skills/                    #   Orchestration skills (7)
│   ├── templates/                 #   Reusable orchestrator templates
│   └── examples/                  #   Real-world examples (6)
│
├── guides/                        # 17 comprehensive guides
├── mcp-configs/                   # MCP server configurations (7 files; 6 configs + README)
├── examples/                      # Project-specific copilot-instructions
│   ├── nextjs-app/
│   ├── python-api/
│   ├── dotnet-webapp/
│   └── monorepo/
│
├── contexts/                      # Context presets
├── references/                    # Checklist & pattern references (5)
│   ├── testing-patterns.md        # AAA structure, mocking, component/API/E2E patterns
│   ├── security-checklist.md      # OWASP Top 10, auth, input validation, security headers
│   ├── performance-checklist.md   # Core Web Vitals, frontend/backend optimization
│   ├── accessibility-checklist.md # WCAG 2.1 AA, keyboard nav, screen reader, forms
│   └── ecosystem-monitoring-playbook.md # Monitoring cadence, prompt archetypes, adopt/adapt/reject contract
├── scripts/                       # Setup & migration tools
└── tests/                         # Test suite
```

---

## コアコンポーネント

### エージェント（8 Core）

事前設定済みの agent 定義です。それぞれが特定の役割、system prompt、tool セットを持ちます。

| Agent | 目的 |
|-------|---------|
| **planner** | 依存関係を追跡しながら task を構造化された計画に分解します |
| **architect** | system architecture と component 境界を設計します |
| **code-reviewer** | bug、ロジックエラー、security 問題をレビューします |
| **security-reviewer** | OWASP/CWE 分類に基づく security audit に特化します |
| **tdd-guide** | Test-Driven Development workflow（red/green/refactor）を実行します |
| **build-error-resolver** | build/compilation エラーを診断・修正します |
| **doc-updater** | code 変更に合わせて documentation を同期します |
| **refactor-cleaner** | 安全な refactoring 機会を特定し、実行します |

### スキル（合計96・8カテゴリ）

カテゴリ別に整理された再利用可能なワークフロースキルです。すべて [agentskills.io](https://agentskills.io) 仕様に従っています。

<details>
<summary><strong>★ Copilot 専用 Skills（25）</strong></summary>

GitHub Copilot CLI 固有の機能を活用する skill です。

| Skill | 説明 |
|-------|-------------|
| `context-prime` | session 開始時に project context（README、file tree、commit、stack）を読み込みます |
| `session-management` | 組み込み SQLite で todo 追跡と構造化状態管理を行います |
| `plan-mode-mastery` | 承認 workflow 付きの構造化テキスト計画を実行します |
| `autopilot-patterns` | ガードレール付きで自律実行します |
| `background-agent` | `&` / `/delegate` で cloud agent に委任します |
| `fleet-parallel` | `/fleet` で並列 agent 実行を行います |
| `github-code-search` | GitHub 全体のコード検索で実装例を探し、根拠付きコンテキストとして取り込みます |
| `github-pr-workflow` | 組み込み GitHub MCP で PR ライフサイクル全体を扱います |
| `github-issue-triage` | Issue を一括分類・トリアージします |
| `actions-debugging` | native Actions アクセスで CI failure をデバッグします |
| `cross-session-memory` | 以前の session context を検索して再開します |
| `copilot-memory` | CLI、cloud agent、code review で共有される repository-level Copilot memory を確認・整理します |
| `knowledge-curator` | 繰り返し現れる学びを永続的な project guidance に昇格します |
| `mcp-builder` | 新しい MCP server を設計・実装し、検証・reload・test まで通します |
| `multi-model-strategy` | task ごとに最適な model を選択します |
| `mcp-ecosystem` | カスタム MCP server で拡張します |
| `ide-switching` | VS Code ↔ CLI の context 共有をシームレスにします |
| `scope-guard` | task を狭い writable surface に固定し、危険な変更前に明示的な stop rule を追加します |
| `team-planner` | SQL roster + `/fleet` dispatch で専門 agent チームを編成します |
| `agentic-engineering` | 15分単位の task、eval-first ループ、明示的 I/O 契約を設計します |
| `stack-detector` | project tech stack をスキャンし、このコレクションの関連 skill と rule を推奨します |
| `task-intake-router` | 受け取った依頼を適切な mode、agent type、model、委任経路へルーティングします |
| `ecosystem-intake` | キュレーション済み ecosystem source を adopt/adapt/reject の backlog 候補へ変換します |
| `sub-agent-sandboxing` | 委任した作業に loop 検知、circuit breaker、sandbox 昇格を適用し、結果受け入れ前の実行ガードを追加します |
| `token-cost-optimizer` | 大きな Copilot task の前に、model・context・parallelism によるコスト増を先回りで抑えます |

</details>

<details>
<summary><strong>開発 Skills（23）</strong></summary>

| Skill | 説明 |
|-------|-------------|
| `api-and-interface-design` | 公開 API / CLI / webhook / SDK の契約を実装前に定義します |
| `tdd-workflow` | Red → Green → Refactor サイクル |
| `code-review` | 重大度レベル付きの構造化 review |
| `cpp-debugging` | C++ の失敗が寿命、未定義動作、native crash、debugger でしか見えない状態を含むときに、symbol、sanitizer、platform-native debugger で症状パッチ前に原因を追跡します |
| `fix-github-issue` | issue を読む → bug 特定 → 修正 → test → PR |
| `fix-build-errors` | build failure を診断して解決します |
| `improve-codebase-architecture` | codebase が変更しづらく、テストしづらく、読み解きにくいときに、設計上の摩擦を洗い出し、より深い module 候補を具体的な refactoring 方向まで絞り込みます |
| `performance-optimization` | 計測ベースで bottleneck を特定し、改善を実証します |
| `pr-multi-perspective-review` | 6視点 PR review：PM / Dev / QA / Security / DevOps / UX |
| `review` | 固定した git 基準点との差分を、repository 規約と元の spec の 2 軸で分離して review します |
| `prototype` | 設計の問いがまだ曖昧なときに、1つの問いへ素早く答える throwaway な logic/UI prototype を作り、後で削除または吸収できる形にします |
| `refactor-clean` | dead code を削除し、ロジックを安全に簡素化します |
| `diagnose` | 最速の feedback loop を先に作り、有力な仮説を順位付けし、探索を狭める計測だけを追加します |
| `source-driven-development` | 実装前に公式 doc を確認してから進める source-first 開発です |
| `spec-driven-development` | coding 前に technical spec を作成し、interface・構造・境界を先に定義します |
| `context-engineering` | AI agent への情報伝達を最適化し、noise を最小化、signal を最大化します |
| `deprecation-and-migration` | 3フェーズで旧 API を安全に廃止し、新パターンへ移行します |
| `skill-creator` | workflow の説明から新しい SKILL.md の雛形を作成します |
| `systematic-debugging` | reproduce → isolate → hypothesize → verify の 4段階でデバッグします |
| `zoom-out` | ローカルな code detail から 1 段階抽象度を上げ、owner module と caller を把握して project 用語で再説明します |

**Combo Skills**（2つの技術を併用する場合に有効化）:

| Skill | 説明 |
|-------|-------------|
| `nextjs-prisma` | Next.js App Router + Prisma project 向けの type-safe data fetching と Server Actions |
| `react-vitest` | React + Vitest project 向けの component testing 設定とパターン |
| `nestjs-prisma` | NestJS + Prisma 向けの PrismaService singleton、repository pattern、unit testing |

</details>

<details>
<summary><strong>ドキュメント Skills（6）</strong></summary>

| Skill | 説明 |
|-------|-------------|
| `add-to-changelog` | Keep a Changelog 形式と semver version 同期を維持します |
| `doc-update` | 実装変更時に docs を同期します |
| `document-generate` | feature、module、project 向けに Diataxis docs を source から新規生成します |
| `api-documentation` | source から API docs を生成・保守します |
| `code-tour` | codebase onboarding 用の VS Code CodeTour `.tour` file を生成します |
| `architecture-decisions` | 取り消しづらい技術判断を Architecture Decision Records（ADR）として記録します |

</details>

<details>
<summary><strong>セキュリティ Skills（7）</strong></summary>

| Skill | 説明 |
|-------|-------------|
| `agent-owasp-check` | AI agent システムを OWASP Agentic Security Initiative Top 10 に沿って監査します |
| `evaluate-repository` | AI agent governance を含む 7次元 scorecard（1〜10）と remediation plan を作成します |
| `security-scan` | OWASP Top 10 + dependency audit を実施します |
| `secret-detection` | source と git history 内のハードコードされた secret を検出します |
| `input-validation` | injection 攻撃（SQL、XSS、CSRF）を防止します |
| `security-bounty-hunter` | bug bounty 観点で vuln を探索し、proof-of-concept 手順を示します |
| `pr-security-review` | auth、injection、secret、OWASP Top 10 を中心に PR を security review します |

</details>

<details>
<summary><strong>ワークフロー Skills（22）</strong></summary>

| Skill | 説明 |
|-------|-------------|
| `commit-workflow` | Conventional commit + emoji、atomic split ガイダンス |
| `doubt-driven-development` | 非自明な判断を確定させる前に fresh-context の adversarial review で揺さぶります |
| `release` | tag → GitHub Release → publish（npm/PyPI/Docker） |
| `verification-before-completion` | 完了を主張する前に新しい command 出力で本当に終わったことを証明します |
| `sprint-workflow` | sprint 全体：Think → Plan → Build → Review → Test → Ship → Monitor |
| `deployment-canary` | release 後の canary 監視、rollback 閾値、promote/hold 判断を定義します |
| `security-audit` | OWASP Top 10 + STRIDE threat modeling |
| `sprint-retro` | git metrics に基づくデータ駆動 retro |
| `cost-audit` | AI inference token コストを監査し、model/prompt 最適化を提案します |
| `council` | 高リスク判断向けの 4者 adversarial decision council を開催します |
| `deep-research` | 構造化 synthesis を伴う体系的な複数ソース調査を行います |
| `grill-me` | 前提、依存関係、リスクが明示されるまで 1 問ずつ plan を厳しく掘り下げます |
| `grill-with-docs` | 既存 docs、用語、ADR に照らして implementation 前の plan を厳しく検証します |
| `handoff` | 既存 artifact を重複させず、次の session、agent、machine 向けの handoff 文書を作成します |
| `implementation-review` | 実装結果の diff を元の task spec と照合し、実行可能な修正フィードバックを作成します |
| `interview-me` | plan、spec、code の前にユーザーが本当に欲しいものを引き出します |
| `llm-wiki` | research や domain knowledge が session ごとに再発明されるときに、GitHub や commit 済み project guidance を置き換えない補助 markdown wiki へ合成知識を蓄積します |
| `outside-voice` | 実装の前・途中・後で、challenge / consult / review の各 mode による独立した second opinion を得ます |
| `prompt-optimizer` | 粗い prompt を placeholders なしの完成済み chat prompt に磨き上げます |
| `to-issues` | plan、spec、PRD を検証可能な薄い vertical slice issue に分解します |
| `triage` | 単一 issue の構造化 triage が必要なときに、分類、再現、追加情報の依頼、次の担当者向け brief または close-out note を issue tracker に残します |
| `using-git-worktrees` | repository を再 clone せずに並列 branch 作業用の分離ディレクトリを作成します |

</details>

<details>
<summary><strong>プロダクト Skills（5）</strong></summary>

| Skill | 説明 |
|-------|-------------|
| `create-prd` | JTBD に基づく PRD template |
| `feature-prioritization` | Impact × Confidence × Effort マトリクス |
| `opportunity-solution-tree` | Teresa Torres の OST フレームワーク |
| `launch-strategy` | Alpha → Beta → GA の launch checklist |
| `product-capability` | 要件を AC と traceability を備えた SRS 形式の capability spec に変換します |

</details>

<details>
<summary><strong>テスト Skills（5）</strong></summary>

| Skill | 説明 |
|-------|-------------|
| `test-coverage` | ギャップを特定し、狙いを定めた test を作成します |
| `e2e-testing` | 重要経路向け E2E test scaffolding |
| `eval-harness` | SQL 追跡 test case 付きで LLM pipeline 評価スイートを構築します |
| `browser-devtools` | 実行時 frontend 挙動を検証します（DOM 検証、network 検査、performance profiling） |
| `ux-audit` | Krug 系ヒューリスティクスで usability を点検し、優先度付きの課題を返します |

</details>

<details>
<summary><strong>コンテンツ＆マーケティング Skills（3）</strong></summary>

| Skill | 説明 |
|-------|-------------|
| `ai-visibility` | GEO 最適化：llms.txt、AI crawler access |
| `content-strategy` | keyword 調査、topic cluster、content calendar |
| `seo` | technical SEO 監査：Core Web Vitals、structured data、crawl 問題 |

</details>

### ルール

コーディングルールとガイドラインは、スコープごとに整理されています。

- **Common Rules** — 汎用ベストプラクティス（エラーハンドリング、logging、命名規則）
- **Language-Specific Rules** — TypeScript、Python、Go、C#、Java
- **Framework-Specific Rules** — Next.js、React、Prisma、Playwright、NestJS、Cloudflare Workers、Vitest

### オーケストレーション

マルチAIオーケストレーションシステムです（下の [専用セクション](#multi-ai-orchestration-) を参照してください）。

---

## ガイド

| ガイド | 説明 |
|-------|-------------|
| **Quick Start** | 5分で利用開始できます |
| **Shortform Guide** | 日常利用向けの簡潔なリファレンスです |
| **Longform Guide** | 全機能を深掘りしたガイドです |
| **Security Guide** | security のベストプラクティスとスキャン方法です |
| **Copilot Exclusive Features** | Copilot CLI でのみ利用できる機能です |
| **Copilot vs Claude Code** | 両ツールの強み・制約・併用方針を比較します |
| **Migration from Claude Code** | 概念対応表付きの段階的 migration パスです |
| **Hooks to GitHub Actions** | Claude Code Hooks の代替（Git Hooks / Actions / Prompt Guards）です |
| **Orchestration Guide** | マルチAIオーケストレーションのパターンと設定方法です |
| **Skill Writing Best Practices** | 実際に発火する trigger-first 記述の書き方です |
| **Skill Testing Guide** | promptware 向けに trigger 精度と出力品質を検証する方法です |
| **Skill Testing & Waza Evaluation** | skill の trigger 精度、token budget、eval coverage を測定します |
| **QA Agent Guide** | 境界横断比較により実バグを捕捉する QA agent 設計です |
| **Beginner Skills Tutorial (EN)** | 通常 prompt と skill 指定 prompt の違いを体感するコピペ実習です |
| **Beginner Skills Tutorial (KO)** | 韓国語版の入門実習ガイドです |
| **Beginner Skills Tutorial (JA)** | 日本語版の入門実習ガイドです |
| **Beginner Skills Tutorial (ZH)** | 中国語版の入門実習ガイドです |

すべてのガイドは [`guides/`](guides/) ディレクトリにあります。

---

## マルチAIオーケストレーション ★

> **二つのレイヤー — 区別が重要です。**
>
> **Copilot-native**: GitHub MCP、`/model` 切り替え、Plan Mode、Autopilot、Fleet、Background Agents、Session SQL database は Copilot CLI に組み込まれています。
>
> **Community pattern**: Claude Code、Codex CLI、Gemini CLI との cross-tool orchestration は、このリポジトリが shell/MCP/pipeline ベースの workflow pattern として文書化したものです。外部 CLI の導入に依存し、Copilot の公式組み込み機能ではありません。

### アイデア

1つの AI がすべてに最適とは限りません。Claude は推論、Codex は高速実装、Gemini はマルチモーダル理解、Copilot は GitHub 統合に強みがあります。これら **すべて** を1か所から使えたらどうでしょうか。

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

### 5つのオーケストレーションパターン（Pattern 1〜5：cross-AI）

| Pattern | 仕組み | 最適な用途 |
|---------|-------------|----------|
| **Shell Invocation** | Copilot が shell command で他 CLI を起動します | シンプルな委任 |
| **MCP Bridge** | Model Context Protocol server を介して agent を接続します | 構造化された tool 共有 |
| **Message IPC** | file/pipe を使ったプロセス間通信です | リアルタイム連携 |
| **Pipeline** | agent を順次連結し、前段の出力を次段に渡します | 多段 workflow |
| **Agent Council** | 複数 agent が議論し、判断を投票します | 重要な意思決定 |

### 追加の6パターン（チーム内オーケストレーション、Pattern 6〜11）

| Pattern | 仕組み | 最適な用途 |
|---------|-------------|----------|
| **Fan-Out Parallel** | 独立した subtask を同時に dispatch します | バッチ処理 |
| **Producer-Reviewer** | produce→review の反復フィードバックループです | 成果物の洗練 |
| **Hierarchical Delegation** | 入れ子の orchestrator（root→domain→specialists）です | 大規模・複数ドメイン task |
| **Iterative Refinement** | 計測可能な終了条件を持つ自己修正ループです | 品質重視の生成 |
| **Review Trio** | PR 以外の成果物（RFC、schema、architecture）向け 3者 review です | 公開前 review |
| **Sub-Agent Sandboxing** | worktree・scope・権限境界で委任 agent を隔離します | 安全性重視の委任 |

### tool の専門性

オーケストレーションエコシステム内の各 AI tool には、明確な専門性があります。Copilot CLI はそれらを束ねる coordinator として機能します。

| AI Tool | 専門性 | workflow での役割 |
|---------|---------------|----------------------|
| **Copilot CLI** | GitHub 統合 · マルチモデル柔軟性 · オーケストレーション | メタハブ / coordinator |
| **Claude Code** | 深い推論 · 大規模 context 分析 | 推論 specialist |
| **Codex CLI** | 高速 code 生成 · boilerplate | 実装 specialist |
| **Gemini CLI** | マルチモーダル理解 · 視覚分析 | vision / マルチモーダル specialist |

### 参考情報と実証済みフレームワーク

このオーケストレーションシステムは、実運用されているマルチagentフレームワークを参考にしています。

- [microsoft/autogen](https://github.com/microsoft/autogen) — Microsoft AutoGen framework
- [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) — CrewAI role-based agents
- [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) — LangGraph state machines
- [geekan/MetaGPT](https://github.com/geekan/MetaGPT) — MetaGPT multi-agent SOP
- [openai/swarm](https://github.com/openai/swarm) — OpenAI Swarm patterns

> 実装の詳細は [Orchestration Guide](guides/the-orchestration-guide.md) を参照してください。

---

## Copilot CLI の独自性

Copilot CLI は GitHub workflow に最適化されて設計されています。標準で次の機能を利用できます。

| 機能 | 詳細 |
|-----------|---------|
| **GitHub-Native MCP** | Issue、PR、Actions、code search を追加設定なしで利用できます |
| **20+ Model Selection** | task ごとに GPT-5.x、Claude Sonnet/Opus 4.6、Gemini 3 Pro を切り替えられます |
| **IDE ↔ CLI Context Sharing** | VS Code、JetBrains、terminal 間をシームレスに切り替えられます |
| **Plan Mode** | code を書く前に承認 workflow 付きの構造化テキスト計画を行います |
| **Autopilot Mode** | ガードレール付きの自律 task 実行 _（実験的機能）_ |
| **Background Agents** | `&` / `/delegate` で cloud agent に委任し、`/resume` で再開します |
| **Fleet Mode** | 複数 agent を同時並列で実行し、作業を分割します |
| **Session SQL Database** | session ごとの組み込み SQLite で構造化状態と todo を管理します |
| **Cross-Session Memory** | `session_store` と `/resume` で以前の session 履歴を検索し、再利用します |
| **LSP Integration** | Language Server Protocol により symbol-aware な高精度 code intelligence を提供します |
| **Multi-AI Orchestration** | 単一ハブから Claude Code、Codex、Gemini CLI を連携します _(community pattern)_ |

> 各機能の詳細は [Copilot Exclusive Features guide](guides/copilot-exclusive-features.md) を参照してください。

---

## 他ツールからの移行

別の AI coding tool から移行しますか？ skill 形式はほぼ同じため、移行は容易です。

```text
CLAUDE.md rules        →  .github/copilot-instructions.md
.claude/commands/      →  .github/skills/
.claude/settings.json  →  mcp-configs/ & contexts/
Claude Code Hooks      →  Git Hooks / GitHub Actions / Prompt Guards
```

migration script により、多くの作業を自動化できます。

```bash
node scripts/migrate-from-claude.js /path/to/your/project
```

> 詳細は [Migration Guide](guides/migration-from-claude-code.md) と [Hooks Alternatives Guide](guides/hooks-to-github-actions.md) を参照してください。

---

## コントリビュート

コントリビューションを歓迎します！次の方法で貢献できます。

1. **agent を追加** — `agents/` に新しい agent role を定義します
2. **skill を作成** — `skills/` に再利用可能な workflow を追加します
3. **rule を作成** — `rules/` にコーディングガイドラインを追加します
4. **オーケストレーションパターンを共有** — `orchestration/` に貢献します
5. **ガイドを改善** — `guides/` の documentation を強化します
6. **example を追加** — `examples/` に実運用セットアップを追加します

### 開発

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

PR を送る前に、既存ガイドを読み、確立されたパターンに従ってください。

---

## ライセンス

[MIT](LICENSE) © Everything Copilot CLI Contributors

---

<p align="center">
  <sub>GitHub Copilot CLI community のために構築しています</sub>
</p>

<p align="center">
  <sub><a href="https://github.com/affaan-m/everything-claude-code">everything-claude-code</a> と <a href="https://github.com/hesreallyhim/awesome-claude-code">awesome-claude-code</a> の先駆的な仕事に敬意を表します</sub>
</p>
