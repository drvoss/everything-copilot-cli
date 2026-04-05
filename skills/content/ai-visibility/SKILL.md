---
name: ai-visibility
description: Use when you want your product to surface in AI-generated answers (ChatGPT, Perplexity, Gemini) — creates llms.txt, optimizes structured data, and configures AI crawler access for GEO.
metadata:
  category: content
---

# AI Visibility (GEO — Generative Engine Optimization)

Search is shifting from Google links to AI-generated answers. Users ask ChatGPT, Claude,
Perplexity, and Gemini instead of searching. If your product isn't cited in those
answers, you're invisible to a growing segment of your audience.

GEO (Generative Engine Optimization) is the practice of making your content easy for
AI systems to find, understand, cite, and recommend.

## The llms.txt Standard

`llms.txt` is a proposed standard (similar to `robots.txt`) that helps LLMs understand
your site's structure and find your most important content.

### Generate your llms.txt

```
> Generate an llms.txt file for my product: [product name]
>
> Product description: [what it does]
> Target users: [who it's for]
> Key pages: [list of important URLs]
> Documentation: [docs URL]
> API reference: [API URL if applicable]
>
> Follow the llms.txt specification format.
```

**llms.txt format:**

```markdown
# [Product Name]

> [One-line description of what your product does]

[2-3 sentence explanation of the product for an LLM to understand context]

## Documentation

- [Getting Started](https://yoursite.com/docs/start): How to install and begin
- [API Reference](https://yoursite.com/api): Full API documentation
- [Tutorials](https://yoursite.com/tutorials): Step-by-step guides

## Key Pages

- [Pricing](https://yoursite.com/pricing): Plans and pricing information
- [Changelog](https://yoursite.com/changelog): Recent updates

## Optional

- [Full Docs](https://yoursite.com/docs/llms-full.txt)
```

Place at: `https://yoursite.com/llms.txt`

### Verify AI Crawler Access

Check that AI crawlers aren't blocked in your `robots.txt`:

```
> Review my robots.txt for AI crawler access:
> [paste robots.txt content]
>
> Are these AI crawlers blocked?
> - GPTBot (OpenAI)
> - ClaudeBot (Anthropic)
> - PerplexityBot
> - GoogleOther (Google AI)
> - Meta-ExternalAgent
>
> If any are blocked, what's the risk/benefit of allowing them?
```

**Allow specific AI crawlers:**

```txt
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /
```

## Content Optimization for AI Citation

### What AI Systems Prioritize

```
> Analyze this piece of content for AI citation potential:
> [paste content]
>
> Score it on:
> 1. Factual density (specific claims, statistics, named concepts)
> 2. Structural clarity (headers, lists, clear hierarchy)
> 3. Citation worthiness (does it answer specific questions?)
> 4. Authority signals (original research, first-party data, expert voice)
>
> Suggest specific improvements to make it more likely to be cited.
```

### AI-Optimized Content Patterns

Content structures that get cited more often:

```
> Rewrite this content using AI-citation-optimized patterns:
> [paste content]
>
> Apply these patterns:
> - Lead with the direct answer (not context)
> - Use numbered or bulleted lists for steps/options
> - Include specific statistics with sources
> - Add a "bottom line" summary at the top
> - Use exact phrases users would search/ask
```

### Structured Data for AI

```
> Generate JSON-LD structured data for this page:
> Page type: [FAQ / Article / Product / How-to]
> Content: [paste content]
>
> Include schema.org types that are most likely to surface in AI answers.
```

## Testing AI Visibility

```
> Test my product's AI visibility for these queries:
> [list of queries your target users would ask]
>
> For each query:
> 1. What would an ideal AI answer look like?
> 2. Is our content positioned to be cited in that answer?
> 3. What content gaps exist?
```

Test manually:
- Ask ChatGPT, Claude, Perplexity, and Gemini about your product category
- Check if you're cited, how you're described, and what competitors appear
- Note which content pieces get referenced

## GEO Content Audit

```
> Perform a GEO audit of our content:
> [list of key pages / paste sitemap]
>
> For each page, evaluate:
> - Is the title a question or answer (not just a keyword)?
> - Does the introduction directly answer the likely query?
> - Are there factual claims that an AI would want to cite?
> - Is the content structured for scanning (headers, lists)?
> - Does it include original data or perspective (not just generic advice)?
>
> Prioritize pages to rewrite for AI visibility.
```

## Monitoring

Track AI-driven traffic:

```
> Help me set up monitoring for AI-driven traffic:
> - What UTM parameters to use for AI referral tracking
> - How to identify "dark social" / AI referral traffic in analytics
> - What baseline metrics to establish now
```

## Tips

- **Direct answers rank**: AI systems prefer content that directly answers questions, not content that builds to an answer
- **Update frequently**: AI systems often weight recency; add a last-updated date to key pages
- **Claim your entity**: Ensure consistent NAP (Name, Address, Phone) and product descriptions across all platforms
- **Internal linking matters**: Help AI systems understand which content is authoritative on each topic
- **Monitor brand mentions**: Set up alerts for when AI systems mention your product incorrectly
