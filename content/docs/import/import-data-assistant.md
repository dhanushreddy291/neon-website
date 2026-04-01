---
title: Import Data Assistant
subtitle: Move your database to Neon using our automated import tool
summary: >-
  How to use the Import Data Assistant to automatically transfer your existing
  database to Neon by providing a connection string, or to migrate data between
  Neon projects.
enableTableOfContents: true
tag: beta
updatedOn: '2026-02-15T20:51:54.206Z'
redirectFrom:
  - /docs/import/migration-assistant
---

When you're ready to move your data to Neon, the **Import Data Assistant** can help you automatically import your existing database. You only need to provide a connection string to get started.

<FeatureBetaProps feature_name="Import Data Assistant"/>

<Admonition type="tip" title="Migrate between Neon projects">
You can also use the **Import Data Assistant** to migrate data between Neon projects. This is useful for upgrading to a newer Postgres version (for example, from Postgres 16 to 17) or moving your database to a different region. The assistant steps you thorugh creating new project.
</Admonition>

## Before you start

You'll need:

- A **Neon account**. Sign up at [Neon](https://neon.tech) if you don't have one.
- A **connection string** to your current database in this format:

  ```
  postgresql://username:password@host:port/database?sslmode=require&channel_binding=require
  ```

  If you are migrating a database from one Neon project to another, you need the connection string for the source database, which you can access from the **Connect** modal on the project dashboard.

- **Admin privileges** on your source database. We recommend using a superuser if migrating from another platform or a user with the necessary `CREATE`, `SELECT`, `INSERT`, and `REPLICATION` privileges.
- A database **smaller than 10 GB** in size for automated import
- Unless you are intentionally migrating to a different region, we recommend migrating to a Neon project created in the same region as your current database for a faster import. There is a 1-hour time limit on import operations.

<Steps>

## Launch the assistant

Launch the assistant from the **Projects** page:

![Import Data Assistant from Projects page](/docs/import/import_data_assistant_project.png)

## Check Compatibility

Enter your database connection string and click **Run Checks**. we'll verify:

- Database size is within the current 10 GB limit
- Postgres version compatibility (Postgres 14 to 17)
- Extension compatibility
- Region availability

## Import Your Data

Once checks pass, we'll:

- Create a new branch for your imported data.
- Copy your data automatically using `pg_dump` and `pg_restore`.
- Verify that the import completed successfully.

<Admonition type="note">
During import, your source database remains untouched; we only read from it to create a copy in Neon.
</Admonition>

### Known Limitations

- Currently limited to databases **smaller than 10GB**. We are actively working on supporting bigger workloads. In the meantime, contact support if you are looking to migrate bigger databases.
- There is a 1-hour limit on import operations. For faster imports, we recommend importing to a Neon project created in the same region as your source database.
- The feature is supported in **AWS regions** only.
- Supabase and Heroku databases are not supported due to unsupported Postgres extensions.
- Databases running on **IPv6 are not supported yet**.
- AWS RDS is generally supported, though some incompatibilities may exist. Support for other providers may vary.

## Next Steps

After a successful import:

1. Find your newly imported database branch on the **Branches** page of your project.

   ![Branches page showing imported branch](/docs/import/import_data_assistant_branch.png)

   _Imported branches are typically named with a timestamp, as shown here._

2. Run some test queries to ensure everything imported correctly.
3. Click on the three dots next to the branch name and select **Set as default** to make it your default branch.
4. Optional cleanup:
   - Delete the old branches (`production` and `development`) if they are no longer needed.
   - Rename the new branch to `production` for clarity and consistency.
5. Switch your connection string to point to your new Neon database.

</Steps>

## Need Help?

- For **technical issues**: [Contact support](/docs/introduction/support)
- For **provider-specific questions**: Let us know what database provider you're using when you contact us

If your database import failed for any reason, please [contact our support team](/docs/introduction/support). We're here to help you get up and running.
