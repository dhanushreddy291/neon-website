---
title: Migrate to another Neon region
subtitle: Move your database to a new Neon project in a different region
summary: >-
  Move a Neon database to another Neon project using the Import Data Assistant,
  pg_dump and pg_restore, or logical replication, including cutover notes for
  production databases.
enableTableOfContents: true
isDraft: false
updatedOn: '2026-03-30T12:00:00.000Z'
---

Use this guide when you want to **stay on Neon** and run in a **different region** (often **AWS**). If you are leaving **Neon on Azure**, see the mapping table in [Region migration](/docs/guides/region-migration#azure-neon-regions-to-suggested-neon-aws-regions).

Pick **one** method in the steps below.

## Prerequisites

- A Neon **source** project in your current region.
- Permission to create a **target** Neon project in the new region.
- A plan for **downtime** or **near‑zero downtime** (logical replication fits the latter for many apps). See [Neon data migration guides](/docs/import/migrate-intro) for a quick comparison.

<Steps>

## Import Data Assistant (smaller databases)

Best when your database is **under roughly 10 GB** and you can use the Neon Console migration flow.

1. Create a **new Neon project** in the **target region**. See [Create a project](/docs/manage/projects#create-a-project).
2. Open the target project in the Neon Console and use the **Import Data Assistant** from the **Import** or onboarding flow. See [Import Data Assistant](/docs/import/import-data-assistant).
3. Connect to the **source** Neon database when prompted and complete the import.
4. **Verify** data and applications against the target.
5. **Cut over** app connection strings and secrets. See [Cutover](#cutover) below.
6. **Delete** the old project when you no longer need it.

## pg_dump and pg_restore

Best for larger databases or when you want full control of dump files.

1. Create a **target** Neon project and database in the new region. Match database names if that simplifies your restore.
2. Export from the **source** with **`pg_dump`** using an **unpooled** connection string. See [Backups with pg_dump](/docs/manage/backup-pg-dump).
3. Import to the **target** with **`pg_restore`**. See [Migrate data from Postgres](/docs/import/migrate-from-postgres).
4. **Verify**, **cut over**, then **retire** the source project when ready.

## Logical replication (near‑zero downtime)

Use when you need **ongoing replication** before switchover. Follow [Replicate data from one Neon project to another](/docs/guides/logical-replication-neon-to-neon) end to end. That guide includes **publication**, **subscription**, and **monitoring** steps.

Enable **logical replication** on the source project only when you accept the **wal_level** change described in that guide.

## Cutover

For **live** traffic:

1. **Stop or pause writes** to the source when you are ready (Neon cannot freeze writes for you).
2. For **logical replication**, wait until **replication lag** is acceptable and run final checks. Then **promote** traffic to the target using your app’s connection strings.
3. **Rotate** connection strings, pools, env vars, and CI secrets to the **target** project.
4. **Monitor** errors and performance on the target.
5. Keep the source project **read‑only** until you are past your rollback window.
6. **Delete** the source project when you no longer need it.

More detail: [Switch over your applications](/docs/postgresql/postgres-upgrade#switch-over-your-applications) and [Move project data to a new region](/docs/introduction/regions#move-project-data-to-a-new-region).

</Steps>

## Related docs

- [Region migration](/docs/guides/region-migration)
- [Get started with logical replication](/docs/guides/logical-replication-guide)
- [Migrate data from Postgres](/docs/import/migrate-from-postgres)

<NeedHelp/>
