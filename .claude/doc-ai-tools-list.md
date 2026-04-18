# Doc AI tools available in this repo

When the user asks "what doc AI tools are available" or "what AI tools for docs" or similar, output the following list.

---

## Claude (`.claude/`)

**Commands** (`.claude/commands/`) — run with `/command-name`

- **create-pr-report** — Generates a weekly report of merged PRs across monitored Neon repositories to identify documentation needs. Default range: since last Friday. Also supports PR deep dives and follow-on docs PR or changelog workflows.
- **create-changelog** — Generates next Friday's changelog draft (or a specific date) with placeholder content and titled dropdown sections. Timezone: America/New_York.
- **post-changelog** — Posts the weekly changelog preview to all Lakebase Slack channels for team review. Requires a Vercel preview URL and PR URL. Databricks employees only — requires the Slack MCP.
- **update-roadmap** — Reviews the changelog (default: past 1 month) and syncs the introduction roadmap: moves shipped items from "What we're working on now" to "What we've shipped recently" and adds missing changelog features.
- **write-content** — Full orchestrated workflow for new pages or substantial rewrites: IA specialist → content-drafter → content-refiner → syntax-validator. Heavyweight — use for new pages or major rewrites.
- **simple-content** — Lighter single-thread workflow with user confirmation at each step (plan, draft, review). Use for edits to existing pages or smaller additions.
- **review-content** — One-off review of content for style, standards, and technical accuracy.
- **validate** — Pre-commit check: verifies frontmatter has `title`, no stray h1 headings, new files are in `navigation.yaml`, image paths exist, `redirectFrom` is well-formed, no em dashes. Then runs lint and format.
- **check-consistency** — Finds other places in the docs that say the same thing as the current page; suggests a single source or aligned wording.
- **update-glossary** — Compares a doc to the glossary and lists missing or reviewable terms (Mode A), or audits the glossary itself for order, cross-links, best practices, and obsolete entries (Mode B).
- **redirect-update** — Step-by-step for moving or renaming docs: add `redirectFrom`, update links and navigation, preserve redirect chains.
- **golden-corpus** — Curated exemplary doc files by type (tutorial, get-started, concept, how-to, reference, etc.). Use for style, tone, and structure reference.
- **improve-intro** — Improves the first paragraph of a doc page to match Neon style.
- **navigation-principles** — Reference for how `navigation.yaml` works: nav, subnav, items, and placement.
- **docs-prime** — Primes the agent with project structure and key paths for the doc ecosystem.
- **create-doc-ticket** — Create a JIRA task in the Databricks LKB project, assigned to yourself. Databricks employees only — requires the JIRA MCP. Non-employees should open a GitHub issue at github.com/neondatabase/website instead.
- **list-doc-ai-tools** — Run this (or ask "what doc AI tools are available") to print this list.
- **triage-changelog** — *(Deprecated — use `/create-pr-report` instead.)* Extracts PRs from Console, CLI, MCP, Storage, Compute repos using parallel agents and drafts a changelog.

**Agents** (`.claude/agents/`)

- **content-drafter**, **content-planner**, **content-refiner**, **ia-specialist**, **syntax-validator**, **supervisor** — Write/revise, plan specs, review, structure/nav, MDX/build validation, orchestrate multi-step workflows.
- **extract-analyze-console**, **-cli**, **-mcp**, **-storage**, **-compute** — Changelog extraction and analysis by repo.

---

For more detail, see `content/docs/community/ai-tools.md` and the files under `.claude/commands/` or `.claude/agents/`.
