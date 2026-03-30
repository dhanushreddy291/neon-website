---
title: Postgres-compatible export from Neon
subtitle: Take a standard pg_dump archive from Neon for use outside Neon
summary: >-
  Export Neon data with pg_dump for Postgres-compatible archives. Restore steps
  on other providers are out of scope here; link to Neon dump docs and
  migrate-from-postgres reference.
enableTableOfContents: true
isDraft: false
updatedOn: '2026-03-30T12:00:00.000Z'
---

Prefer **[another Neon region](/docs/guides/migrate-neon-to-another-region)** or **[Databricks Lakebase](/docs/guides/migrate-neon-to-lakebase)** when they meet your needs. This page is for a **standard Postgres export** from Neon when you must use your own destination.

Neon does **not** document third‑party consoles. After you have a dump file, follow your **destination** Postgres provider’s documentation for **`pg_restore`** or their import tools.

## Export steps on Neon

1. Use an **unpooled** connection string from the Neon Console (**Connect** → pooling **off**).
2. Run **`pg_dump`** with **custom** format (`-Fc`). See [Backups with pg_dump](/docs/manage/backup-pg-dump) for the exact command and examples.
3. Store the file where your restore environment can reach it securely.

For advanced options, ownership, and piping, see [Migrate data from Postgres with pg_dump and pg_restore](/docs/import/migrate-from-postgres).

## Related

- [Region migration](/docs/guides/region-migration)
- [Backups with pg_dump](/docs/manage/backup-pg-dump)

<NeedHelp/>
