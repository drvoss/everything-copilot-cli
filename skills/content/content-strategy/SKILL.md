---
name: content-strategy
description: Build a content strategy with keyword research, topic clusters, and a content calendar. Drive organic traffic and authority in your product category.
metadata:
  category: content
---

# Content Strategy

Content strategy is the intersection of what your audience searches for, what
you have authority to say, and what supports your business goals. This skill
helps you build a data-driven content plan — not a random blog schedule.

## Core Framework

```
Business Goal → Target Audience → Keyword Research → Topic Clusters → Content Calendar
```

## Step 1: Define Your Content Goals

```
> Help me define a content strategy for [product/company]:
>
> Product: [what you sell]
> Target customer: [who they are, what they care about]
> Business goal: [increase signups / build authority / retain users / etc.]
> Current content state: [have nothing / have a blog / have docs but no marketing content]
>
> What type of content strategy would best serve these goals?
```

Content strategy types:
- **SEO-led**: Target high-volume keywords; build organic traffic at scale
- **Authority-led**: Publish original research, opinions, and deep expertise
- **Product-led**: Content that drives product usage (tutorials, use cases)
- **Community-led**: User-generated content, forums, templates

## Step 2: Keyword Research

### Seed Keywords

```
> I'm building a content strategy for [product/niche].
>
> Generate 20 seed keywords organized by intent:
> - Informational (how-to, what-is, learn)
> - Commercial (best, vs, review, alternatives)
> - Transactional (buy, sign up, free trial)
>
> For each keyword, estimate: search volume (rough order: hundreds / thousands / 10k+),
> competition level (low / medium / high), and funnel stage (awareness / consideration / decision)
```

### Long-tail Expansion

```
> For the seed keyword "[main keyword]":
> Generate 15 long-tail variations that:
> - Have lower competition
> - Address specific use cases
> - Include question-format keywords (who, what, how, why, when)
>
> These should represent real queries your target users would type.
```

### Content Gap Analysis

```
> Our top competitors in this space are: [Competitor A, B, C]
>
> Based on what I know about their content strategies, what topic areas
> are likely underserved that we could own?
>
> Prioritize by: search demand, our credibility to publish on this topic,
> and strategic differentiation value.
```

## Step 3: Topic Cluster Architecture

Build content clusters to establish authority in a topic area:

```
> Design a topic cluster for the pillar keyword: "[main topic]"
>
> Include:
> 1. Pillar page (comprehensive 3,000+ word guide on the main topic)
> 2. 8-12 cluster pages (specific subtopics that link to and from the pillar)
> 3. Supporting content (comparison pages, case studies, tools)
>
> For each piece, define:
> - Target keyword
> - Search intent
> - Unique angle (why ours > existing content)
> - Estimated word count
> - Internal link connections
```

Example cluster for "product analytics":
- Pillar: "The Complete Guide to Product Analytics"
- Cluster: "How to Set Up Funnel Analysis", "Product Analytics vs. Web Analytics", "Best Product Analytics Tools", etc.

## Step 4: Content Calendar

```
> Create a 12-week content calendar based on this strategy:
>
> Publishing cadence: [2x per week / 1x per week / 2x per month]
> Content types: [blog posts / videos / case studies / newsletters]
> Priority order: [highest-value content first]
>
> Format as a Markdown table:
> | Week | Content Title | Type | Target Keyword | Goal | Status |
```

## SQL Content Tracker

```sql
CREATE TABLE content_pieces (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    target_keyword TEXT,
    content_type TEXT,           -- blog | video | case_study | guide | landing_page
    funnel_stage TEXT,           -- awareness | consideration | decision
    estimated_volume TEXT,       -- hundreds | thousands | 10k+
    competition TEXT,            -- low | medium | high
    priority_score REAL,
    status TEXT DEFAULT 'planned',  -- planned | in_progress | published | updating
    published_url TEXT,
    notes TEXT
);

-- Query by priority
SELECT title, target_keyword, funnel_stage, competition, status
FROM content_pieces
WHERE status = 'planned'
ORDER BY priority_score DESC;
```

## Content Brief Generator

For each content piece, generate a brief:

```
> Write a content brief for: "[article title]"
>
> Target keyword: [keyword]
> Search intent: [what the user wants]
> Target audience: [who is reading this]
>
> Include:
> 1. H1 and meta description (with keyword)
> 2. Outline with H2/H3 structure
> 3. Key points to cover (must-have vs. nice-to-have)
> 4. Competitor gaps to address (what they miss that we should include)
> 5. Internal links to include
> 6. Call-to-action recommendation
```

## Content Performance Review

```
> Analyze this content's performance:
>
> URL: [URL]
> Current position: [rank]
> Traffic: [monthly visitors]
> Conversions: [signups/leads]
>
> What should we do:
> A) Update and expand (if ranking 4-15, content is good but needs improvement)
> B) Consolidate (if similar content is cannibalizing)
> C) Deprecate (if no traffic, no conversions, no strategic value)
> D) Leave as-is (if ranking 1-3 and converting well)
```

## Tips

- **Pillar pages are your highest-leverage investment**: One great 3,000-word guide outperforms ten thin posts
- **Update before creating**: Refreshing a page ranking #8 to #3 is faster than ranking a new page
- **Keyword intent > keyword volume**: A 200-search/month "how to migrate from [Competitor]" keyword converts better than a 50,000/month generic term
- **Build for both humans and AI**: Structure your content to be cited by AI systems (see `ai-visibility` skill) AND scanned by human readers
- **Measure conversion, not just traffic**: Content that drives signups is worth 10x content that drives views
