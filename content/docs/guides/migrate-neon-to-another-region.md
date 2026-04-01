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

When your **Neon database** must run in a **different Neon region** than it does today, you are not moving the project. A project's region is fixed, so you need to **create a new Neon project** in the target region and **migrate** your database into it.

<a id="azure-neon-regions-to-suggested-neon-aws-regions" aria-hidden="true"></a>

## Choose a migration method

Each option below is a different way to **move the same database** into a new Neon project in a different region. Pick **one** based on database size, whether you want a Console-driven flow, and how much downtime you can accept. The linked topics contain the **step-by-step** procedures.

<a id="import-data-assistant" aria-hidden="true"></a>

### Import Data Assistant

**Best for** smaller databases (roughly **under 10 GB**) and when you want a guided flow in the Neon Console.

In the Neon Console, open the **[Projects](https://console.neon.tech/app/)** page and start the **Import Data Assistant**. The assistant **creates your new Neon project** in the **target region** as part of the same flow. You begin by entering the **connection string for the database you are migrating from**. See **[Import Data Assistant](/docs/import/import-data-assistant)** for instructions.

### pg_dump and pg_restore

**Best for** larger databases, or when you want full control of dump files and restore timing. See **[Migrate data from Postgres](/docs/import/migrate-from-postgres)**.

### Logical replication

**Best for** **minimal downtime** on busy databases where a long dump or restore window is not acceptable.

You replicate from the source project to the target and cut over when caught up. See **[Replicate data from one Neon project to another](/docs/guides/logical-replication-neon-to-neon)**. Expect more configuration than other migration methods.

## Related docs

- [Region migration](/docs/guides/region-migration)
- [Get started with logical replication](/docs/guides/logical-replication-guide)

<NeedHelp/>
