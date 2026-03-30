---
title: Postgres-compatible export from Neon
subtitle: Export your Neon database with pg_dump as a standard Postgres archive
summary: >-
  How to export your Neon database to a Postgres-compatible archive using
  pg_dump, and a standard pg_restore pattern for the same dump—with caveats to
  validate import steps against your destination Postgres provider.
enableTableOfContents: true
isDraft: false
updatedOn: '2026-03-30T12:00:00.000Z'
---

This topic describes how to export your **Neon** database to a **Postgres-compatible** archive using the Postgres **`pg_dump`** utility. You get a normal custom-format dump (for example `-Fc`) that any Postgres toolchain can consume.

If you can stay on Neon or move to **Lakebase**, **[Migrate to another Neon region](/docs/guides/migrate-neon-to-another-region)** and **[Migrate Neon to Lakebase](/docs/guides/migrate-neon-to-lakebase)** are usually simpler paths. Use this guide when your **destination** is something else and you need a portable dump file.

Once you have the archive, importing it is standard Postgres tooling. The **[Restore on your destination](#restore-on-your-destination-with-pg-restore)** section below shows a **`pg_restore`** command that pairs with the **`-Fc`** export. **You must still check your destination Postgres platform or provider**—their docs are authoritative for SSL, networking, extensions, roles, empty-database requirements, and any managed import UI they offer.

## Export steps on Neon

1. Use an **unpooled** connection string from the Neon Console (**Connect** → pooling **off**).
2. Run **`pg_dump`** with **custom** format (`-Fc`). See [Backups with pg_dump](/docs/manage/backup-pg-dump) for the exact command and examples.
3. Store the file where your restore environment can reach it securely.

For advanced options, ownership, and piping, see [Migrate data from Postgres with pg_dump and pg_restore](/docs/import/migrate-from-postgres).

## Restore on your destination with `pg_restore` (#restore-on-your-destination-with-pg-restore)

A **custom-format** dump (`-Fc`) from Neon is restored with **`pg_restore`**. The following matches the usual export from [Backups with pg_dump](/docs/manage/backup-pg-dump) (same dump file name as in that example).

**Before you run this:** Confirm with **your destination’s documentation** that direct `pg_restore` is supported, that your Postgres major version and extensions are compatible, and whether you need flags such as **`-O` / `--no-owner`** (common when source and destination roles differ). Managed providers may require an empty database, specific SSL parameters, or a different import path.

1. Create or select a **target database** on your destination as their docs require (often empty).
2. Obtain a **connection string** for that database from your provider (direct / unpooled if they distinguish pooling from restore).
3. Run **`pg_restore`**:

   ```bash shouldWrap
   pg_restore -v -d "<destination_database_connection_string>" <dump_file_name>
   ```

   For example, if you exported to `mydatabase.bak` as in [Backups with pg_dump](/docs/manage/backup-pg-dump), a restore might look like:

   ```bash shouldWrap
   pg_restore -v -d "postgresql://user:password@db.example.com:5432/mydb?sslmode=require" mydatabase.bak
   ```

   - **`-v`**: Verbose output while restoring.
   - **`-d`**: Target database (use your provider’s URL format and query parameters).

If restore fails on ownership or role statements, try adding **`-O`** and consult [Database object ownership considerations](/docs/import/migrate-from-postgres#database-object-ownership-considerations). For more flags (parallel jobs, schema-only, exclusions), see [Advanced pg_dump and pg_restore options](/docs/import/migrate-from-postgres#advanced-pg_dump-and-pg_restore-options).

## Related

- [Region migration](/docs/guides/region-migration)
- [Backups with pg_dump](/docs/manage/backup-pg-dump)
- [Migrate data from Postgres with pg_dump and pg_restore](/docs/import/migrate-from-postgres)

<NeedHelp/>
