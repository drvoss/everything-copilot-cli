---
name: seo
description: Use when the user wants better search visibility, SEO remediation, schema markup, sitemap/robots work, or keyword mapping — audits and implements technical SEO, on-page optimization, Core Web Vitals, and structured data
metadata:
  category: content
  agent_type: general-purpose
  origin: ported from affaan-m/everything-claude-code
---

# SEO

Improve search visibility through technical correctness, performance, and content relevance — not gimmicks.

> **Distinct from [`ai-visibility`](../ai-visibility/SKILL.md):** This skill covers traditional search engine optimization (Google, Bing). `ai-visibility` covers GEO — optimizing for AI crawlers, llms.txt, and AI citation surfaces.

## When to Use

- Auditing crawlability, indexability, canonicals, or redirects
- Improving title tags, meta descriptions, and heading structure
- Adding or validating structured data (JSON-LD)
- Improving Core Web Vitals (LCP, INP, CLS)
- Keyword research and URL-to-keyword mapping
- Planning internal linking or sitemap/robots changes

## Principles

1. Fix technical blockers before content optimization
2. One page — one clear primary search intent
3. Prefer long-term quality signals over manipulative patterns
4. Mobile-first: indexing is mobile-first
5. Recommendations should be page-specific and implementable

## Technical SEO Checklist

### Crawlability

- `robots.txt` allows important pages, blocks low-value surfaces
- No important page is unintentionally `noindex`
- Important pages reachable within shallow click depth
- No redirect chains longer than two hops
- Canonical tags are self-consistent and non-looping

### Indexability

- Preferred URL format is consistent
- Multilingual pages have correct `hreflang` if used
- Sitemaps reflect the intended public surface
- No duplicate URLs without canonical control

### Core Web Vitals targets

| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| INP (Interaction to Next Paint) | < 200ms |
| CLS (Cumulative Layout Shift) | < 0.1 |

Common fixes: preload hero assets · reduce render-blocking JS · reserve layout space · trim heavy third-party scripts

## On-Page Rules

### Title tags

- ~50–60 characters
- Primary keyword/concept near the front
- Legible to humans first

### Meta descriptions

- ~120–160 characters
- Honest description of the page
- Include main topic naturally

### Heading structure

- One clear `H1` per page
- `H2`/`H3` reflect actual content hierarchy
- Do not skip levels for visual styling

## Structured Data

| Page type | Schema type |
|-----------|-------------|
| Homepage | `Organization` or `LocalBusiness` |
| Blog/article | `Article` or `BlogPosting` |
| Product page | `Product` + `Offer` |
| Interior nav | `BreadcrumbList` |
| Q&A sections | `FAQPage` (only when content truly matches) |

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Page Title Here",
  "author": { "@type": "Person", "name": "Author Name" },
  "publisher": { "@type": "Organization", "name": "Brand Name" }
}
```

## Keyword Mapping

1. Define the search intent
2. Gather realistic keyword variants
3. Prioritize by intent match, value, and competition
4. Map one primary keyword/theme to one URL
5. Detect and avoid keyword cannibalization

## Audit Output Format

```text
[HIGH] Duplicate title tags on product pages
Location: src/routes/products/[slug].tsx
Issue: Dynamic titles collapse to the same default string.
Fix: Generate unique titles using product name + primary category.

[MEDIUM] Missing structured data on blog posts
Location: src/routes/blog/[slug].tsx
Issue: No Article schema — missing potential rich snippet eligibility.
Fix: Add JSON-LD BlogPosting schema with headline, author, datePublished.
```

## Anti-Patterns

| Anti-pattern | Fix |
|-------------|-----|
| Keyword stuffing | Write for users first |
| Thin near-duplicate pages | Consolidate or differentiate |
| Schema for content that doesn't match | Remove or align content |
| `noindex` on indexable pages | Audit robots meta tags |
| Missing canonical on paginated series | Add canonical pointing to series root |

## See Also

- [ai-visibility](../ai-visibility/SKILL.md) — GEO optimization for AI crawlers and llms.txt
- [content-strategy](../content-strategy/SKILL.md) — keyword research, topic clusters, content calendar
