# Docs Guide Eval Harness

Tests whether Neon framework integration guides are effective enough for an AI agent to follow from zero to a working Neon connection. The agent reads the guide, sets up the project in an isolated Docker container with an ephemeral Neon database, and a separate evaluator scores the result.

## Usage with Claude Code

The easiest way to use this harness is via the `/eval-guide` slash command in a Claude Code session:

```
/eval-guide express
/eval-guide rust --local ./content/docs/guides/
/eval-guide express,prisma,django
```

Claude runs the harness, reads the results, and summarizes the findings conversationally.

## Manual setup

Prerequisites: Docker Desktop, Node.js 18+.

```bash
cd evals/docs-guides
npm install
cp .env.example .env   # Add your API credentials (see .env.example for options)
```

Run against a published guide:
```bash
npm run eval -- --guide express
```

Run against a local draft before publishing:
```bash
npm run eval -- --guide express --local ../../content/docs/guides/
```

Run multiple guides:
```bash
npm run eval -- --guide express,prisma,django
```

## What it does

1. Creates an ephemeral Neon Postgres database (via neon.new, no account needed)
2. Starts a Docker container with Node.js, Python, and apt-get access for other runtimes
3. Gives the AI agent the guide content and a task prompt
4. The agent installs packages, writes code, and verifies the connection
5. Deterministic checks confirm: connection works, .env exists, no hardcoded credentials
6. An LLM evaluator scores the session against a rubric (0-10)
7. Saves transcript, file snapshots, and scores to `results/`

## Output

Results go to `results/history/{timestamp}/` with:
- `summary.json` — scores and deterministic check results
- `{guide}/transcript.txt` — readable conversation log
- `{guide}/files/` — every file the agent created

## Configuration

- `config/guides.yaml` — registry of guides available for eval
- `config/rubric.md` — evaluation criteria for the LLM scorer
- `.env` — API credentials and optional registry proxies (see `.env.example`)
