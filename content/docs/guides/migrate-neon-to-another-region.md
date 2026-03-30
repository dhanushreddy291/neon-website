---
title: Migrate to another Neon region
subtitle: Move your database to a new Neon project in a different region
summary: >-
  Move a Neon database to another Neon project using the Import Data Assistant,
  pg_dump and pg_restore, or logical replication. For production cutover, see
  the Region migration guide.
enableTableOfContents: true
isDraft: false
updatedOn: '2026-03-30T12:00:00.000Z'
---

Use this guide when you want to migrate your **database** to a **different region** on Neon. A project's region is fixed. To move your data to a new region, you need to **create a new Neon project** in the target region and **migrate your database** into it.

<a id="azure-neon-regions-to-suggested-neon-aws-regions" aria-hidden="true"></a>

## Choosing a destination AWS region (from Neon on Azure)

Use the table below to choose an AWS region for your new Neon project that's closest to your project's Azure region.

| Neon Azure region                                   | Suggested Neon AWS region      |
| --------------------------------------------------- | ------------------------------ |
| `azure-eastus2` (Azure East US 2, Virginia)         | `aws-us-east-1` (N. Virginia)  |
| `azure-westus3` (Azure West US 3, Arizona)          | `aws-us-west-2` (Oregon)       |
| `azure-gwc` (Azure Germany West Central, Frankfurt) | `aws-eu-central-1` (Frankfurt) |

For moves that do not start from these Azure regions (for example AWS to AWS), choose any [supported Neon region](/docs/introduction/regions). We recommend choosing a region closest to your application.

## Prerequisites

- A Neon **source** project (your database today) in your current region.
- Permission to create a **target** Neon project in the new region (where your migrated database will live).
- A plan for **downtime** or **near-zero downtime** (logical replication fits the latter for many apps). See [Neon data migration guides](/docs/import/migrate-intro) for a quick comparison.

## Migration methods

The subsections below are **different ways** to complete the same job. Pick **one** method based on database size, whether you want to use the Console, and your downtime tolerance.

### Import Data Assistant (smaller databases)

Best when your database is **under roughly 10 GB** and you can use the Neon Console migration flow.

1. Create a **new Neon project** in the **target region**. See [Create a project](/docs/manage/projects#create-a-project).
2. Open the target project in the Neon Console and use the **Import Data Assistant** from the **Import** or onboarding flow. See [Import Data Assistant](/docs/import/import-data-assistant).
3. Connect to the **source** Neon database when prompted and complete the import.
4. **Verify** data and applications against the target.
5. **Cut over** app connection strings and secrets. For a full production cutover checklist, see [Cutover for live databases](/docs/guides/region-migration#cutover-for-live-databases).
6. **Delete** the old project when you no longer need it.

### pg_dump and pg_restore

Best for larger databases or when you want full control of dump files.

1. Create a **target** Neon project and database in the new region. Match database names if that simplifies your restore.
2. Export from the **source** with **`pg_dump`** using an **unpooled** connection string. See [Backups with pg_dump](/docs/manage/backup-pg-dump).
3. Import to the **target** with **`pg_restore`**. See [Migrate data from Postgres](/docs/import/migrate-from-postgres).
4. **Verify**, **cut over**, then **retire** the source project when ready. See [Cutover for live databases](/docs/guides/region-migration#cutover-for-live-databases) for detailed cutover steps.

### Logical replication (near-zero downtime)

Use when you need **ongoing replication** before switchover. Follow [Replicate data from one Neon project to another](/docs/guides/logical-replication-neon-to-neon) end to end. That guide includes **publication**, **subscription**, and **monitoring** steps.

Enable **logical replication** on the source project only when you accept the **wal_level** change described in that guide. After replication catches up, use [Cutover for live databases](/docs/guides/region-migration#cutover-for-live-databases) when you switch traffic.

## Related docs

- [Region migration](/docs/guides/region-migration)
- [Neon data migration guides](/docs/import/migrate-intro)
- [Migrate data from another Neon project](/docs/import/migrate-from-neon)
- [Get started with logical replication](/docs/guides/logical-replication-guide)
- [Migrate data from Postgres](/docs/import/migrate-from-postgres)

<NeedHelp/>
