---
title: Migrate Neon to Lakebase
subtitle: End-to-end migration from Neon Serverless Postgres to Databricks Lakebase Postgres
summary: >-
  Plan and run a full Neon-to-Lakebase migration: Lakebase project and connection
  setup, pg_dump from Neon, pg_restore on Lakebase, verification, cutover, and
  optional Neon teardown, with Databricks docs for Lakebase console and networking.
enableTableOfContents: true
isDraft: false
updatedOn: '2026-04-02T18:00:00.000Z'
---

This guide describes how to migrate a **Neon** database to **Databricks Lakebase Postgres** using **`pg_dump`** and **`pg_restore`**.

<Admonition type="note" title="Logical replication">
**Logical replication** is only supported for **Neon-to-Neon** migrations. Logical replication to Lakebase is **not** supported.
</Admonition>

## Prerequisites

- A Neon **source** project with the database you are migrating.
- A Databricks account with permission to create **Lakebase** resources in the target region.
- **Postgres major versions** aligned when possible between Neon and Lakebase.
- `pg_dump` and `pg_restore` installed on a **stable** machine.

<Admonition type="important">
Lakebase **OAuth** database tokens expire about every hour ([OAuth token authentication](https://docs.databricks.com/aws/en/oltp/projects/authentication#oauth-token-authentication)), so for **`pg_restore`** use a **native Postgres password role** and the connection string from **Connect** (the URI includes the password). See [Postgres pg_dump and pg_restore](https://docs.databricks.com/aws/en/oltp/projects/pg-dump-restore) on Databricks.
</Admonition>

<Steps>

## Plan the migration

- **Verify Lakebase supports what you need.** Migration assumes Lakebase can run your workload. Read **[Lakebase Postgres](https://docs.databricks.com/aws/en/oltp)** for product scope, regions, and operations. Read **[Postgres compatibility](https://docs.databricks.com/aws/en/oltp/projects/compatibility)** for how Lakebase Postgres differs from standard Postgres (versions, session and scale-to-zero behavior, parameters, limitations such as tablespaces and replication, and more).
- **Extensions.** On Neon, list installed extensions (for example run `SELECT * FROM pg_extension;`). Compare each one to **[Postgres extensions](https://docs.databricks.com/aws/en/oltp/projects/extensions)** on Databricks. If an extension you depend on is not available on Lakebase, plan an alternative.

## Create a Lakebase project and get a connection string

1. Create a **Lakebase Postgres** project and the target **database**. See [Lakebase Postgres](https://docs.databricks.com/aws/en/oltp).
2. Add a **native Postgres password role** for restore: **Roles & Databases** → **Add role** → **Password**. See [Create Postgres roles](https://docs.databricks.com/aws/en/oltp/projects/postgres-roles).
3. Open **Connect**, select that role, and copy the connection string for **`pg_restore`**. See [Connect to your database](https://docs.databricks.com/aws/en/oltp/projects/connect).

## Export data from Neon

<Admonition type="important">
Avoid using `pg_dump` over a [pooled connection string](/docs/reference/glossary#pooled-connection-string). Use an [unpooled connection string](/docs/reference/glossary#unpooled-connection-string) instead.
</Admonition>

Dump your Neon database with **`pg_dump`** using an **unpooled** connection string.

1. In the Neon Console, open your project and click **Connect**. Turn **Connection pooling** **off** and copy the connection string.
2. Run:

```bash
pg_dump -Fc -v -d "<neon_connection_string>" -f neon-export.dump
```

See [Backups with pg_dump](/docs/manage/backup-pg-dump) for the full procedure and flags.

## Restore into Lakebase

Neon dumps include **ownership** and **privileges** for Neon-specific roles (for example `neondb_owner`, `neon_superuser`, roles used in `ALTER DEFAULT PRIVILEGES`). Those roles do not exist on Lakebase, so a plain `pg_restore` often errors on `ALTER ... OWNER TO ...` and default-privilege grants. That does not mean your tables and data failed to restore; it means ownership and ACL replay could not be applied.

Use **`--no-owner`** so objects are created as the user you connect with, and **`--no-acl`** (or **`-x`**) so Neon-specific `GRANT` / `ALTER DEFAULT PRIVILEGES` statements are skipped. You can grant privileges on Lakebase afterward if your security model needs it.

```bash
pg_restore -v --no-owner --no-acl -d "postgresql://user:password@host/dbname?sslmode=require" neon-export.dump
```

For more on ownership when moving between providers, see [Database object ownership considerations](/docs/import/migrate-from-postgres#database-object-ownership-considerations) in **Migrate data from Postgres**.

## Decommission Neon (optional)

When Lakebase is live and retention allows, delete the Neon project from the Console or API.

</Steps>

## Related docs

**Neon**

- [Region migration](/docs/guides/region-migration)
- [Migrate data from Postgres](/docs/import/migrate-from-postgres)

**Databricks Lakebase**

- [Lakebase Postgres](https://docs.databricks.com/aws/en/oltp)
- [Authentication overview](https://docs.databricks.com/aws/en/oltp/projects/authentication)
- [Create Postgres roles](https://docs.databricks.com/aws/en/oltp/projects/postgres-roles)
- [Postgres compatibility](https://docs.databricks.com/aws/en/oltp/projects/compatibility)
- [Postgres extensions](https://docs.databricks.com/aws/en/oltp/projects/extensions)
- [Connect to your database](https://docs.databricks.com/aws/en/oltp/projects/connect)
- [Postgres pg_dump and pg_restore](https://docs.databricks.com/aws/en/oltp/projects/pg-dump-restore)
- [Authenticate to a database instance](https://docs.databricks.com/aws/en/oltp/instances/authentication)

<NeedHelp/>
