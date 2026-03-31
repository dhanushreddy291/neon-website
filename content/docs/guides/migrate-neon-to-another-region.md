---
title: Migrate to another Neon region
subtitle: Choose a migration method for a new Neon project in another region
summary: >-
  A Neon project's region is fixed. To run in another region, create a new project there and migrate.
  Compare the Import Data Assistant, dump and restore, and logical replication, then use the Region migration
  guide and the how-to for your chosen method.
enableTableOfContents: true
isDraft: false
updatedOn: '2026-03-30T12:00:00.000Z'
---

When your **Neon database** must run in a **different Neon region** than it does today, you are not moving the project. A project's region is fixed, so you **create a new Neon project** in the target region and **migrate** your database into it. Use the sections below to **select a migration method** that best fits your requirements (for example database size, whether you want a Console-driven flow, and how much downtime you can accept). Each section links to a guide with the full procedure.

The **[Region migration](/docs/guides/region-migration)** topic explains the broader workflow: when to migrate, how this path fits alongside Lakebase or export options, and how to pick a guide. This page focuses only on **choosing among the three Neon-to-Neon methods** when you stay on Neon.

<a id="azure-neon-regions-to-suggested-neon-aws-regions" aria-hidden="true"></a>

## Choose a migration method

Each option below is a different way to **move the same database** into a new project. Pick **one** based on database size, whether you want a Console-driven flow, and how much downtime you can accept. The linked topics contain the **step-by-step** procedures.

### Import Data Assistant

**Best for** smaller databases (roughly **under 10 GB**) and when you want a guided flow in the Neon Console.

You create a **new Neon project** in the **target region**, then use the **Import Data Assistant** from the target project's **Import** or onboarding flow. See **[Import Data Assistant](/docs/import/import-data-assistant)** for how it works and what to connect.

### pg_dump and pg_restore

**Best for** larger databases, or when you want full control of dump files and restore timing.

You export from the source with **`pg_dump`** and import to the target with **`pg_restore`**, typically using **unpooled** connection strings on both sides. For **Neon project to Neon project**, you can run them **in one piped command** (`pg_dump ... | pg_restore ...`) for smaller databases. See **[Migrate data from another Neon project](/docs/import/migrate-from-neon)**. For **separate** dump and restore steps, flags, and ownership, see **[Migrate data from Postgres](/docs/import/migrate-from-postgres)**. For Neon connection strings and installing client tools, see **[Backups with pg_dump](/docs/manage/backup-pg-dump)**.

### Logical replication

**Best for** **minimal downtime** on busy databases where a long dump or restore window is not acceptable.

You replicate from the source project to the target and cut over when caught up. **wal_level** and replication setup are described in **[Replicate data from one Neon project to another](/docs/guides/logical-replication-neon-to-neon)**. Expect more configuration and monitoring than the Import Data Assistant or a one-shot dump and restore.

## Related docs

- [Region migration](/docs/guides/region-migration)
- [Neon data migration guides](/docs/import/migrate-intro)
- [Migrate data from another Neon project](/docs/import/migrate-from-neon)
- [Get started with logical replication](/docs/guides/logical-replication-guide)

<NeedHelp/>
