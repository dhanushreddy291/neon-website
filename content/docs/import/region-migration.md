---
title: Region migration
subtitle: Move your Neon database to another region
summary: >-
  Choose a path to migrate your database to another region (new Neon project plus data migration), or to export your Neon
  data in Postgres-compatible form. Covers another Neon region, Lakebase, dump and restore, logical replication,
  and export options.
enableTableOfContents: true
isDraft: false
updatedOn: '2026-04-03T14:00:00.000Z'
redirectFrom:
  - /docs/guides/region-migration
---

A Neon **project** is created in a single [region](/docs/introduction/regions). Your database runs there, and you **cannot change the region** for that project.

If you need your **data** in a different region, you **create a new Neon project** in that region and **migrate your database** into it.

Common reasons to migrate to a different region:

- Your app moved to a different region and you want lower latency between your app and database.
- You need to set up a new environment in another region.
- You are migrating away from a [deprecated Neon Azure](/docs/introduction/regions#azure-regions) region.

<Admonition type="note" title="Databricks Lakebase">
If you must keep Postgres in Azure for residency or colocation, **[Lakebase Postgres](https://docs.databricks.com/aws/en/oltp)** on Databricks supports Azure regions.
</Admonition>

## Choose a path

Use the flowchart to pick a migration path that best fits your requirements.

```mermaid
flowchart TD
  start["Neon data, new region?"]
  q1{"Azure residency?"}
  lake["Lakebase"]
  q2{"Another Neon region?"}
  neon["Neon region move"]
  q3{"Other destination?"}
  exp["Postgres export"]

  start --> q1
  q1 -->|Yes| lake
  q1 -->|No| q2
  q2 -->|Yes| neon
  q2 -->|No| q3
  q3 -->|Yes| exp
```

<a id="azure-neon-regions-to-suggested-neon-aws-regions" aria-hidden="true"></a>

## Select a migration guide

After the flowchart, open the guide that matches your requirements.

1. **[Migrate to another Neon region](/docs/import/migrate-neon-to-another-region)**. Compare the **Import Data Assistant**, dump and restore, and logical replication, then follow the guide linked from that page.
2. **[Migrate Neon to Lakebase](/docs/guides/migrate-neon-to-lakebase)**. Create a Lakebase project, **`pg_dump`** from Neon, **`pg_restore`** on Lakebase.
3. **[Postgres-compatible export from Neon](/docs/guides/export-neon-postgres-compatible)**. If another Neon region and Lakebase do not meet your requirements, you can use `pg_dump` to export your data in a Postgres-compatible for migration elsewhere.

<NeedHelp/>
