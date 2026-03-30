---
title: Migrate Neon to Lakebase
subtitle: Export from Neon with pg_dump and restore into Databricks Lakebase Postgres
summary: >-
  Move data from Neon Serverless Postgres to Databricks Lakebase Postgres using
  pg_dump from Neon and pg_restore on Lakebase, with links to Databricks docs.
enableTableOfContents: true
isDraft: false
updatedOn: '2026-03-30T12:00:00.000Z'
---

This guide covers the **Neon** side (export) and points you to **Databricks** documentation for **Lakebase** (import). Lakebase runs Postgres in **Azure** regions and elsewhere. Use it when you need Postgres to stay in Azure or when Lakebase is your chosen target.

Start with the [Region migration](/docs/guides/region-migration) overview if you have not picked a path yet.

## Prerequisites

- A Neon project with the database you want to migrate to Lakebase (export from Neon, restore on Lakebase). See [Region migration](/docs/guides/region-migration) for how this fits with other paths.
- A Databricks account and a **Lakebase** project in the target region. Databricks manages Lakebase creation and networking. See [Lakebase Postgres](https://docs.databricks.com/aws/en/oltp) on Databricks docs.
- Matching **Postgres major versions** when possible. Check extension and feature compatibility on both sides before you run a full cutover.
- `pg_dump` and `pg_restore` installed locally or on a stable runner (CI or VM). Long jobs should not rely on a flaky laptop Wi‑Fi link.
- Read [Backups with pg_dump](/docs/manage/backup-pg-dump) and [Migrate data from Postgres](/docs/import/migrate-from-postgres) for Neon connection rules (**unpooled** URLs, `-Fc` format).

<Admonition type="important" title="Auth for long restores">
Lakebase recommends a **native Postgres password** for long `pg_restore` jobs. Short‑lived OAuth tokens can expire mid‑run. Follow [Authenticate to a database instance](https://docs.databricks.com/aws/en/oltp/instances/authentication) and [Postgres pg_dump and pg_restore](https://docs.databricks.com/aws/en/oltp/projects/pg-dump-restore) on Databricks.
</Admonition>

<Steps>

## Export data from Neon

Dump your Neon database with **`pg_dump`** using an **unpooled** connection string.

1. In the Neon Console, open your project and click **Connect**. Turn **Connection pooling** **off** and copy the connection string.
2. Run:

```bash
pg_dump -Fc -v -d "<neon_connection_string>" -f neon-export.dump
```

See [Backups with pg_dump](/docs/manage/backup-pg-dump) for the full procedure and flags.

## Prepare Lakebase

Create or select a Lakebase project and database that will receive the restore. Use the Databricks console and docs for workspace, region, and roles.

- [Connect to your database](https://docs.databricks.com/aws/en/oltp/projects/connect)
- [Postgres pg_dump and pg_restore](https://docs.databricks.com/aws/en/oltp/projects/pg-dump-restore)

Confirm Postgres version and extensions against your Neon source. Fix mismatches before production cutover.

## Restore into Lakebase

Use **`pg_restore`** against the Lakebase connection string Databricks provides. Example shape (replace with your host, user, and database name):

```bash
pg_restore -v -d "postgresql://user:password@host/dbname?sslmode=require" neon-export.dump
```

Follow Databricks guidance for passwords, SSL, and troubleshooting. If ownership errors appear, consider `-O` / `--no-owner` as described in [Migrate data from Postgres](/docs/import/migrate-from-postgres#database-object-ownership-considerations).

## Verify and cut over

1. Run application‑level checks (row counts, critical queries, integrations).
2. Plan **cutover**: stop writes to Neon, run a **final** dump and restore if you need zero drift, then point apps at Lakebase connection strings.
3. Update **secrets** and **connection pools** everywhere (hosting, CI, jobs).
4. Keep the Neon project read‑only until you are sure you do not need rollback.

For switching apps in general, see [Switch over your applications](/docs/postgresql/postgres-upgrade#switch-over-your-applications).

## Decommission Neon (optional)

When Lakebase is live and you no longer need the old database, delete the Neon project from the Console or API after your retention policy allows.

</Steps>

## Related Neon docs

- [Region migration](/docs/guides/region-migration)
- [Migrate data from Postgres](/docs/import/migrate-from-postgres)
- [Logical replication guide](/docs/guides/logical-replication-guide) (not Lakebase‑specific, for context only)

<NeedHelp/>
