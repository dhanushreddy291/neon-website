---
title: Migrate Neon to Lakebase
subtitle: End-to-end migration from Neon Serverless Postgres to Databricks Lakebase Postgres
summary: >-
  Plan and run a full Neon-to-Lakebase migration: Lakebase project and connection
  setup, pg_dump from Neon, pg_restore on Lakebase, verification, cutover, and
  optional Neon teardown, with Databricks docs for Lakebase console and networking.
enableTableOfContents: true
isDraft: false
updatedOn: '2026-03-30T12:00:00.000Z'
---

This guide is an **end-to-end** path from **Neon** to **Databricks Lakebase**: you will **plan** compatibility, **provision and connect to Lakebase**, **export** from Neon with **`pg_dump`**, **restore** into Lakebase with **`pg_restore`**, **verify** and **cut over** applications, then optionally **decommission** Neon. Lakebase runs Postgres in **Azure** regions and elsewhere. Use it when you need Postgres to stay in Azure or when Lakebase is your chosen target.

**Databricks** owns the Lakebase console, networking, and authentication flows. This page sequences the full migration and links to **[Lakebase Postgres](https://docs.databricks.com/aws/en/oltp)** documentation wherever steps happen inside Databricks. Neon-specific export behavior is covered here and in [Backups with pg_dump](/docs/manage/backup-pg-dump) and [Migrate data from Postgres](/docs/import/migrate-from-postgres).

Start with [Region migration](/docs/guides/region-migration) if you have not chosen a destination yet.

<Admonition type="note" title="Logical replication">
**Logical replication** is only supported for **Neon-to-Neon** migrations. Neon-to-Lakebase moves use **`pg_dump`** and **`pg_restore`** as in this guide. Logical replication to Lakebase is **not** supported yet.
</Admonition>

## Prerequisites

- A Neon **source** project with the database you are migrating.
- A Databricks account with permission to create **Lakebase** resources in the target region.
- **Postgres major versions** aligned when possible between Neon and Lakebase. Compare **extensions** and features before cutover.
- `pg_dump` and `pg_restore` installed on a **stable** machine (CI runner or VM), not a flaky network.
- Skim [Backups with pg_dump](/docs/manage/backup-pg-dump) and [Migrate data from Postgres](/docs/import/migrate-from-postgres) for Neon **unpooled** URLs and **`-Fc`** custom format.

<Admonition type="important" title="Auth for long restores">
Lakebase recommends a **native Postgres password** for long `pg_restore` jobs. Short-lived OAuth tokens can expire mid-run. See [Authenticate to a database instance](https://docs.databricks.com/aws/en/oltp/instances/authentication) and [Postgres pg_dump and pg_restore](https://docs.databricks.com/aws/en/oltp/projects/pg-dump-restore) on Databricks.
</Admonition>

<Steps>

## 1. Plan the migration

- Confirm **region and residency** (for example staying in **Azure**) match your Lakebase deployment.
- Note **Postgres versions** on Neon and the Lakebase instance you will create. Plan upgrades or compatibility work if they differ.
- List **extensions** and non-default settings on Neon. Recreate or adjust them on Lakebase before you rely on production traffic.

## 2. Create Lakebase and get a connection string

Complete the **Databricks** side before you depend on a final restore.

1. In your Databricks workspace, create a **Lakebase Postgres** deployment in the intended region. Follow [Lakebase Postgres](https://docs.databricks.com/aws/en/oltp) for workspace prerequisites, regions, and creation flow.
2. Create the **database** (and roles if needed) that will receive the restore. Use Databricks guidance for your org’s networking and security.
3. Obtain a **Postgres connection string** for the target database. See [Connect to your database](https://docs.databricks.com/aws/en/oltp/projects/connect).
4. Set up **authentication** suitable for a long `pg_restore` (password-based as recommended in Databricks docs). See [Authenticate to a database instance](https://docs.databricks.com/aws/en/oltp/instances/authentication).

Databricks also documents **`pg_dump` / `pg_restore`** patterns for Lakebase in [Postgres pg_dump and pg_restore](https://docs.databricks.com/aws/en/oltp/projects/pg-dump-restore). Use that alongside the restore step below.

## 3. Export data from Neon

Dump your Neon database with **`pg_dump`** using an **unpooled** connection string.

1. In the Neon Console, open your project and click **Connect**. Turn **Connection pooling** **off** and copy the connection string.
2. Run:

```bash
pg_dump -Fc -v -d "<neon_connection_string>" -f neon-export.dump
```

See [Backups with pg_dump](/docs/manage/backup-pg-dump) for the full procedure and flags.

## 4. Restore into Lakebase

Run **`pg_restore`** against the **Lakebase** connection string from step 2. Example shape (replace host, user, database, and password with your values):

```bash
pg_restore -v -d "postgresql://user:password@host/dbname?sslmode=require" neon-export.dump
```

Follow Databricks guidance for SSL, passwords, and troubleshooting. If you see ownership errors, consider **`-O`** / **`--no-owner`** as in [Migrate data from Postgres](/docs/import/migrate-from-postgres#database-object-ownership-considerations).

## 5. Verify and cut over

1. Run **application-level** checks on Lakebase (row counts, critical queries, integrations).
2. Plan **cutover**: stop writes to Neon, run a **final** `pg_dump` / `pg_restore` cycle if you need minimal drift, then point applications at **Lakebase** connection strings.
3. Rotate **secrets** and **pools** everywhere (app hosting, CI, jobs).
4. Keep the Neon project **read-only** until you no longer need rollback.

For general application switchover patterns, see [Switch over your applications](/docs/postgresql/postgres-upgrade#switch-over-your-applications).

## 6. Decommission Neon (optional)

When Lakebase is live and retention allows, delete the Neon project from the Console or API.

</Steps>

## Related docs

**Neon**

- [Region migration](/docs/guides/region-migration)
- [Migrate data from Postgres](/docs/import/migrate-from-postgres)
- [Get started with logical replication](/docs/guides/logical-replication-guide) (Neon-to-Neon only; not used for Lakebase yet)

**Databricks Lakebase**

- [Lakebase Postgres](https://docs.databricks.com/aws/en/oltp)
- [Connect to your database](https://docs.databricks.com/aws/en/oltp/projects/connect)
- [Postgres pg_dump and pg_restore](https://docs.databricks.com/aws/en/oltp/projects/pg-dump-restore)
- [Authenticate to a database instance](https://docs.databricks.com/aws/en/oltp/instances/authentication)

<NeedHelp/>
