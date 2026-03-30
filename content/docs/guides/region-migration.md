---
title: Region migration
subtitle: Move your Neon database to another region, or export Postgres-compatible data
summary: >-
  Choose a path to migrate your database to another region (new Neon project plus data migration), or to export your Neon
  data in Postgres-compatible form. Covers another Neon region, Lakebase, dump and restore, logical replication,
  and export options.
enableTableOfContents: true
isDraft: false
updatedOn: '2026-03-30T12:00:00.000Z'
---

A Neon **project** is created in a single [region](/docs/introduction/regions). Your database runs there, and you **cannot change the region** for that project.

If you need your **data** in a different region, you **create a new Neon project** in that region and **migrate your database** into it.

Common reasons to migrate data:

- Your app moved to a different region and you want lower latency.
- You need a new environment in another region.
- You are migrating away from a deprecated Neon Azure region.

<Admonition type="note" title="Databricks Lakebase">
If you must keep Postgres in Azure for residency or colocation, consider **[Lakebase Postgres](https://docs.databricks.com/aws/en/oltp)** on Databricks. It supports Azure regions and most Neon features.
</Admonition>

## Choose a path

Use the flowchart or table to pick a migration guide.

```mermaid
flowchart TD
  start["Need to move Neon data?"]
  q1{"Postgres must stay in Azure?"}
  lake["Migrate Neon to Lakebase"]
  q2{"Stay on Neon in a new region?"}
  neon["Migrate to another Neon region"]
  q3{"Lakebase and Neon both ruled out?"}
  exp["Postgres-compatible export"]

  start --> q1
  q1 -->|Yes| lake
  q1 -->|No| q2
  q2 -->|Yes| neon
  q2 -->|No| q3
  q3 -->|Yes| exp
```

| Question                                                     | If yes                                                            | If no                                                                                                                         |
| ------------------------------------------------------------ | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Must Postgres stay in **Azure**?                             | [Migrate Neon to Lakebase](/docs/guides/migrate-neon-to-lakebase) | Stay on Neon in **AWS** ([Azure to AWS pairings](/docs/guides/migrate-neon-to-another-region#choosing-a-destination-aws-region-from-neon-on-azure)) via [Migrate to another Neon region](/docs/guides/migrate-neon-to-another-region) |
| Under **~10 GB** and you want the **Import Data Assistant**? | Start with the Neon region guide (Assistant section)              | Use **pg_dump** / **pg_restore** or **logical replication** in the same guide                                                 |
| Need **near-zero downtime**?                                 | Prefer **logical replication** in the Neon region guide           | Plan a maintenance window for dump and restore                                                                                |

The [Import Data Assistant](/docs/import/import-data-assistant) works well for smaller databases (roughly **under 10 GB**). Larger databases usually use **pg_dump** and **pg_restore** or **logical replication**. See [Migrate data from Postgres](/docs/import/migrate-from-postgres) and [Replicate data from one Neon project to another](/docs/guides/logical-replication-neon-to-neon) for mechanics.

<Admonition type="note" title="Logical replication is Neon-to-Neon only">
**Logical replication** is supported only when both the source and the target are **Neon** projects ([Neon to Neon](/docs/guides/logical-replication-neon-to-neon)). It is **not** supported for **Neon to Lakebase** migrations yet. For Lakebase, use **`pg_dump`** and **`pg_restore`** ([Migrate Neon to Lakebase](/docs/guides/migrate-neon-to-lakebase)).
</Admonition>

<AzureRegionsDeprecation/>

<a id="azure-neon-regions-to-suggested-neon-aws-regions" aria-hidden="true"></a>

The Neon on Azure to Neon on AWS pairing table is in **[Migrate to another Neon region](/docs/guides/migrate-neon-to-another-region#choosing-a-destination-aws-region-from-neon-on-azure)** ([legacy anchor](/docs/guides/migrate-neon-to-another-region#azure-neon-regions-to-suggested-neon-aws-regions)).

## Where to go next

1. **[Migrate to another Neon region](/docs/guides/migrate-neon-to-another-region)**. New Neon project in the target region, then Import Data Assistant, dump and restore, or logical replication to move your database.
2. **[Migrate Neon to Lakebase](/docs/guides/migrate-neon-to-lakebase)**. End-to-end guide: Lakebase setup, **`pg_dump`** from Neon, **`pg_restore`** on Lakebase, verify, and cut over.
3. **[Postgres-compatible export from Neon](/docs/guides/export-neon-postgres-compatible)**. When another Neon region and Lakebase do not fit. Standard `pg_dump` output.

## Cutover for live databases

Production moves need a clear **cutover** order:

1. **Slow or stop writes** on the source (Neon cannot freeze writes for you). See [Move your database to another region](/docs/introduction/regions#move-your-database-to-another-region).
2. **Finish replication** or **final restore**, then **verify** the target.
3. **Rotate connection strings and secrets** (app env vars, CI, pools, schedulers). See [Switch over your applications](/docs/postgresql/postgres-upgrade#switch-over-your-applications).
4. **Monitor** the new database, then **retire** the Neon source project when you no longer need rollback.

For logical replication, confirm **lag** and **consistency** using [Replicate data from one Neon project to another](/docs/guides/logical-replication-neon-to-neon) and [Get started with logical replication](/docs/guides/logical-replication-guide) before you send traffic to the subscriber.

Run long `pg_dump` / `pg_restore` jobs from a **stable** machine (CI runner or VM) with a reliable network. Use **unpooled** connection strings. See [Migrate data from Postgres](/docs/import/migrate-from-postgres).

If you have **many** Neon **projects**, repeat the process per project. If you have **many Postgres databases** inside a single Neon project, repeat the process **per database**, and consider **scripting** a **`pg_dump`** and **`pg_restore`** process.

## AI assistance

If you want **AI help in your editor** while you migrate (for example **creating a Neon project** in your **target region**, drafting **`pg_dump`** and **`pg_restore`** commands, or working through **logical replication**), run **[`neon init`](/docs/reference/cli-init)**. It sets up the Neon CLI, **Neon MCP Server**, and the **[Neon agent skills](https://github.com/neondatabase/agent-skills)** repo for supported editors.

<NeedHelp/>
