---
title: Simplify RLS with Drizzle
subtitle: Use Drizzle ORM to declaratively manage Row-Level Security policies in your
  schema
summary: >-
  Covers the setup of Row-Level Security (RLS) using Drizzle ORM, including how
  to implement `crudPolicy`, utilize custom Postgres roles, and integrate RLS
  with the Data API and serverless driver.
enableTableOfContents: true
updatedOn: '2026-02-15T20:51:54.193Z'
redirectFrom:
  - /docs/guides/neon-rls-authorize-drizzle
  - /docs/guides/neon-authorize-drizzle
  - /docs/guides/neon-rls-drizzle
---

<InfoBlock>
<DocsList title="What you'll learn">
<p>How to simplify Row-Level Security using `crudPolicy`</p>
<p>Common RLS patterns with Drizzle</p>
<p>How to use custom Postgres roles with your policies</p>
<p>How to use Drizzle RLS with the Data API</p>
<p>How to use Drizzle RLS with the serverless driver</p>
</DocsList>

<DocsList title="Related docs" theme="docs">
  <a href="/docs/guides/row-level-security">Row-Level Security with Neon</a>
  <a href="/docs/data-api/get-started">Data API</a>
  <a href="https://orm.drizzle.team/docs/rls">RLS in Drizzle</a>
</DocsList>
</InfoBlock>

Row-Level Security (RLS) is an important last line of defense for protecting your data at the database level. It ensures that users can only access the data they are permitted to see. When exposing your database directly to clients (for example, through the [Data API](/docs/data-api/get-started)), RLS policies are highly recommended to keep your data secure.

However, implementing RLS natively requires writing and maintaining separate SQL policies for each table, and often for each CRUD operation (Create, Read, Update, Delete). This can quickly become tedious and error-prone.

Drizzle ORM provides a declarative way to manage these policies directly within your TypeScript database schema, making them much easier to write, review, and maintain. Once you define policies in your Drizzle schema and run migrations, they are automatically created in your Postgres database and reliably enforced for all queries.

## The baseline: RLS in plain SQL

Before seeing how Drizzle simplifies things, it helps to understand the underlying SQL it replaces. Below is a sample schema for a basic todo application, where users should only be able to view and manage their own tasks:

```sql
CREATE TABLE IF NOT EXISTS "todos" (
    "id" bigint PRIMARY KEY,
    "user_id" text DEFAULT (auth.user_id()) NOT NULL,
    "task" text NOT NULL,
    "is_complete" boolean DEFAULT false NOT NULL
);

-- This boilerplate SQL code is required for every table you want to secure
ALTER TABLE "todos" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "manage todos" ON "todos"
FOR ALL
TO "authenticated"
USING ((select auth.user_id()) = user_id);
```

These SQL policies guarantee strict, per-user access control at the database level. The `USING` clause defines the condition under which a row is accessible (readable). Since `WITH CHECK` is omitted, Postgres automatically applies the `USING` condition to also restrict inserts and updates.

### Understanding authentication context

Notice the `auth.user_id()` function in the SQL above. When you use Neon's [Data API](/docs/data-api/get-started) alongside your database, this function automatically extracts the user identifier from the active [JWT claims](/blog/wtf-are-jwts). This makes the authenticated user's identity securely available directly in your database policies without needing extra backend logic.

While this plain SQL approach is secure and explicit, managing multiple policies across many tables can become repetitive. Drizzle's declarative `crudPolicy` and `pgPolicy` helpers eliminate this boilerplate, letting you define your security logic directly alongside your tables for better maintainability.

## Simplifying RLS with crudPolicy

Drizzle provides a convenient `crudPolicy` helper to simplify the creation of RLS policies. With `crudPolicy`, you can achieve the same result declaratively. For example:

```typescript {17-21}
import { pgTable, text, bigint, boolean } from 'drizzle-orm/pg-core';
import { crudPolicy, authenticatedRole, authUid } from 'drizzle-orm/neon';
import { sql } from 'drizzle-orm';

export const todos = pgTable(
  'todos',
  {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    userId: text('user_id')
      .notNull()
      .default(sql`(auth.user_id())`),
    task: text('task').notNull(),
    isComplete: boolean('is_complete').notNull().default(false),
  },
  (table) => [
    // Apply RLS policies for the 'authenticated' role
    crudPolicy({
      role: authenticatedRole,
      read: authUid(table.userId), // Users can only read their own todos
      modify: authUid(table.userId), // Users can only create, update, or delete their own todos
    }),
  ]
);
```

<Admonition type="note">
**About Drizzle's role:** Drizzle is used to **declare and migrate RLS policies** in TypeScript. When migrations are run, these policies are created in your Postgres database and enforced automatically regardless of how queries are executed.

You can run queries that respect these policies using either the [Data API client](/docs/data-api/get-started#connect-and-query) (frontend) or the [Neon serverless driver](#using-drizzle-with-the-serverless-driver) using the Drizzle query builder (backend).
</Admonition>

### Configuration parameters

The `crudPolicy` function from `drizzle-orm/neon` is a high-level helper that declaratively generates Row-Level Security (RLS) policies for your tables. It accepts the following parameters:

- **`role`**: The Postgres role or array of roles the policy applies to. Neon provides `authenticatedRole` and `anonymousRole` out of the box, but you can also use custom roles.
- **`read`**: Controls access to `SELECT` operations. Accepts:
  - `true` to allow all reads for the role
  - `false` to deny all reads
  - a custom SQL expression for fine-grained access (for example, `authUid(table.userId)`)
  - `null` to skip generating a `SELECT` policy
- **`modify`**: Controls access to `INSERT`, `UPDATE`, and `DELETE` operations. Accepts:
  - `true` to allow all modifications
  - `false` to deny all modifications
  - a custom SQL expression for conditional access (for example, `authUid(table.userId)`)
  - `null` to skip generating policies for these operations

The `crudPolicy` helper generates an array of RLS policy definitions for all CRUD operations (select, insert, update, delete) based on these parameters. For most use cases, this lets you express common access patterns with minimal boilerplate.

> The `authUid(column)` helper generates the SQL condition `(select auth.user_id() = column)`, which is used to restrict access to rows owned by the current user for use in `read` and `modify` policies.

## Fine-grained control with pgPolicy

While `crudPolicy` is ideal for scenarios where a role has the same permissions for reading and modifying data, there are cases where you need more granular control. For these situations, you can use Drizzle's `pgPolicy` function, which provides the flexibility to define custom policies for each operation.

Using `pgPolicy` is ideal when you need to:

- Define different logic for `INSERT` vs. `UPDATE` operations.
- Create a policy for a single command, like `DELETE` only.
- Implement complex conditions where the `USING` and `WITH CHECK` clauses differ significantly.

For example, you might want to allow only users with an `admin` role to update or delete rows in a table, while regular users can insert new rows and view only their own data. This kind of scenario where different roles have different permissions for each operation is easy to express using `pgPolicy`, giving you fine-grained control over who can perform which actions on your data.

### Replicating `crudPolicy` with `pgPolicy`

To understand how `pgPolicy` works, let's rewrite the `todos` example using it. The following `pgPolicy` definition is exactly what `crudPolicy` would generate from your simpler configuration.

```typescript {18-22}
import { pgTable, text, bigint, boolean, pgPolicy } from 'drizzle-orm/pg-core';
import { authenticatedRole, authUid } from 'drizzle-orm/neon';
import { sql } from 'drizzle-orm';

export const todos = pgTable(
  'todos',
  {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    userId: text('user_id')
      .notNull()
      .default(sql`(auth.user_id())`),
    task: text('task').notNull(),
    isComplete: boolean('is_complete').notNull().default(false),
  },
  (table) => {
    return [
      // Single policy for all CRUD operations
      pgPolicy('manage todos', {
        for: 'all',
        to: authenticatedRole,
        using: authUid(table.userId), // users can only access their own todos
      }),
    ];
  }
);
```

This single `pgPolicy` definition with `for: 'all'` is exactly what `crudPolicy` would generate from your simpler configuration. Note that `withCheck` is omitted because when it's not specified, PostgreSQL automatically uses the `USING` clause for both read and write checks. This eliminates unnecessary repetition while maintaining the same security guarantees.

You can apply this approach to additional tables and operations, allowing you to define increasingly sophisticated and tailored security policies as your application's requirements evolve.

### Example: Time limited updates

Here is how you can implement a rule that `crudPolicy` can't handle alone: **A user can update their todo, but only within 24 hours of creating it.** They should still be able to view and delete it anytime.

This requires a different `WITH CHECK` condition for `UPDATE` than the `USING` condition.

```typescript {17,20,24-28,31-35,38-42,45-50}
import { pgTable, text, bigint, timestamp, pgPolicy, boolean } from 'drizzle-orm/pg-core';
import { authenticatedRole } from 'drizzle-orm/neon';
import { sql } from 'drizzle-orm';

export const todos = pgTable(
  'todos',
  {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    userId: text('user_id')
      .notNull()
      .default(sql`(auth.user_id())`),
    task: text('task').notNull(),
    isComplete: boolean('is_complete').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => {
    const userOwnsTodo = sql`(select auth.user_id() = ${table.userId})`;

    // Condition for updates: user must own the todo AND it must be less than 24 hours old.
    const canUpdateTodo = sql`(${userOwnsTodo} and ${table.createdAt} > now() - interval '24 hours')`;

    return [
      // View policy remains the same.
      pgPolicy('view todos', {
        for: 'select',
        to: authenticatedRole,
        using: userOwnsTodo,
      }),

      // Insert policy also remains the same.
      pgPolicy('create todos', {
        for: 'insert',
        to: authenticatedRole,
        withCheck: userOwnsTodo,
      }),

      // Delete policy remains the same.
      pgPolicy('delete todos', {
        for: 'delete',
        to: authenticatedRole,
        using: userOwnsTodo,
      }),

      // The update policy now has a different, stricter WITH CHECK condition.
      pgPolicy('update todos (time-limited)', {
        for: 'update',
        to: authenticatedRole,
        using: userOwnsTodo, // User must own the row to even attempt an update.
        withCheck: canUpdateTodo, // The updated row must satisfy this stricter condition.
      }),
    ];
  }
);
```

This example demonstrates how `pgPolicy` gives you precise, command-level control over your security rules, making it easy to implement complex business logic directly in your database schema.

## Securing database views with RLS

Row-Level Security (RLS) can also be enabled on Postgres views, allowing you to control access to view data at the row level. For details on how to enable RLS on views and apply policies using Drizzle, refer to the [Drizzle documentation](https://orm.drizzle.team/docs/rls#rls-on-views). This approach makes it possible to expose curated or joined subsets of your data while ensuring users only see the rows they are authorized to access.

## Common RLS patterns

Using `crudPolicy` and `pgPolicy`, you can implement a variety of security models. Here are some of the most common ones:

### User-Owned Data

This is the most common RLS pattern, where each user can access only the records they own. It's ideal for applications such as personal to-do lists, user profile settings, or any scenario where users should have full control over their own data and no visibility into others' information. As demonstrated in the todos example above, this approach ensures strict data isolation and privacy.

A typical `crudPolicy` and a `pgPolicy` for this scenario might look like:

<CodeTabs labels={["Drizzle (crudPolicy)", "Drizzle (pgPolicy)"]}>

```typescript
[
  crudPolicy({
    role: authenticatedRole,
    read: authUid(table.userId),
    modify: authUid(table.userId),
  }),
];
```

```typescript
[
  pgPolicy('manage todos', {
    for: 'all',
    to: authenticatedRole,
    using: authUid(table.userId),
  }),
];
```

</CodeTabs>

### Role-based access control

Assign different permissions to anonymous users and authenticated users. For example, in a blog application, anyone can read posts, but only authenticated users can modify their own content. This setup uses separate policies for the `anonymousRole` (public read access) and the `authenticatedRole` (user-specific modifications), making it ideal for applications that distinguish between public and logged-in user actions.

A typical Drizzle schema with `crudPolicy` and `pgPolicy` for this scenario might look like:

<CodeTabs labels={["Drizzle (crudPolicy)", "Drizzle (pgPolicy)"]}>

```typescript {17-21,23-27}
import { sql } from 'drizzle-orm';
import { crudPolicy, authenticatedRole, authUid, anonymousRole } from 'drizzle-orm/neon';
import { bigint, boolean, pgTable, text } from 'drizzle-orm/pg-core';

export const posts = pgTable(
  'posts',
  {
    id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    userId: text('user_id')
      .notNull()
      .default(sql`(auth.user_id())`),
    content: text().notNull(),
    published: boolean().notNull().default(false),
  },
  (table) => [
    // Public read access
    crudPolicy({
      role: anonymousRole,
      read: true, // Anyone can read
      modify: false, // No one can modify anonymously
    }),
    // Policy for authenticated users
    crudPolicy({
      role: authenticatedRole,
      read: true, // Can also read all posts
      modify: authUid(table.userId), // Can only modify their own posts
    }),
  ]
);
```

```typescript {17-21,24-28}
import { sql } from 'drizzle-orm';
import { authenticatedRole, authUid, anonymousRole } from 'drizzle-orm/neon';
import { bigint, boolean, pgPolicy, pgTable, text } from 'drizzle-orm/pg-core';

export const posts = pgTable(
  'posts',
  {
    id: bigint({ mode: 'number' }).primaryKey(),
    userId: text()
      .notNull()
      .default(sql`(auth.user_id())`),
    content: text().notNull(),
    published: boolean().notNull().default(false),
  },
  (table) => [
    // Anonymous users can read but not modify
    pgPolicy('Anonymous users can read posts', {
      to: anonymousRole,
      for: 'all',
      using: sql`true`, // can read all posts
      withCheck: sql`false`, // cannot create/modify posts
    }),

    // Authenticated users can read all, modify their own
    pgPolicy('Authenticated users manage their own posts', {
      to: authenticatedRole,
      for: 'all',
      using: sql`true`, // can read all posts
      withCheck: authUid(table.userId), // can only create/modify their own
    }),
  ]
);
```

</CodeTabs>

### Complex relationships & shared data

Secure data based on relationships in other tables, such as allowing access to a shared document only if the user is part of a specific group or project. This often involves more complex SQL queries and may require additional metadata to be stored alongside your main data.

This is where Drizzle really helps: expressing these relationship based policies declaratively in your schema is much less error-prone and far easier to maintain than writing raw SQL policies by hand.

For example, suppose you have a `notes` table and a `paragraphs` table that contains the text of each note. You want to ensure that users can only access paragraphs from notes they own or that are shared with them.

```typescript {17-21,23-27,40-44,46-50} shouldWrap
import { sql } from 'drizzle-orm';
import { crudPolicy, authenticatedRole, authUid } from 'drizzle-orm/neon';
import { boolean, pgPolicy, pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const notes = pgTable(
  'notes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    ownerId: text('owner_id')
      .notNull()
      .default(sql`auth.user_id()`),
    title: text('title').notNull().default('untitled note'),
    shared: boolean('shared').default(false),
  },
  (table) => [
    // Users can only access their own notes
    crudPolicy({
      role: authenticatedRole,
      read: authUid(table.ownerId),
      modify: authUid(table.ownerId),
    }),
    // Shared notes are visible to authenticated users
    pgPolicy('shared_policy', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${table.shared} = true`,
    }),
  ]
);

export const paragraphs = pgTable(
  'paragraphs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    noteId: uuid('note_id').references(() => notes.id),
    content: text('content').notNull(),
  },
  (table) => [
    // Users can only access paragraphs from their own notes
    crudPolicy({
      role: authenticatedRole,
      read: sql`(select notes.owner_id = auth.user_id() from notes where notes.id = ${table.noteId})`,
      modify: sql`(select notes.owner_id = auth.user_id() from notes where notes.id = ${table.noteId})`,
    }),
    // Shared note paragraphs are visible to authenticated users
    pgPolicy('shared_policy', {
      for: 'select',
      to: authenticatedRole,
      using: sql`(select notes.shared from notes where notes.id = ${table.noteId})`,
    }),
  ]
);
```

In this example:

- Users can only access paragraphs from notes they own or that are shared with them.
- Shared paragraphs are visible to authenticated users.

This pattern can be adapted for other relationship-based access controls, such as project teams, organization memberships, or shared resources.

## Using Custom Roles with Drizzle RLS

Custom roles are essential when your application requires more nuanced access control than what default roles (like `authenticated` or `anonymous`) provide. By defining custom roles, you can assign specific permissions to different user groups, such as moderators, editors, or admins, tailoring access to fit your business logic and security needs.

For example, in a blog application, you might define an `editor` role that can update or delete any post, while regular users can only modify their own posts. This approach lets you implement granular access control by assigning permissions based on each role's responsibilities.

Here's how you can define custom roles and apply policies in Drizzle:

```typescript {5,19-23,25-29}
import { sql } from 'drizzle-orm';
import { authenticatedRole, authUid, crudPolicy } from 'drizzle-orm/neon';
import { bigint, boolean, pgRole, pgTable, text } from 'drizzle-orm/pg-core';

export const editorRole = pgRole('editor').existing();

export const posts = pgTable(
  'posts',
  {
    id: bigint({ mode: 'number' }).primaryKey(),
    userId: text()
      .notNull()
      .default(sql`(auth.user_id())`),
    content: text().notNull(),
    published: boolean().notNull().default(false),
  },
  (table) => [
    // Editors: full access
    crudPolicy({
      role: editorRole,
      read: true, // Editors can read all posts
      modify: true, // Editors can modify all posts
    }),
    // Authenticated users (authors): can only modify their own posts
    crudPolicy({
      role: authenticatedRole,
      read: true, // Can read all posts
      modify: authUid(table.userId), // Can only modify their own posts
    }),
  ]
);
```

<Admonition type="important">
It's important to note that while Drizzle RLS policies define row-level access, you must also grant the necessary table privileges to the `editor` role directly in Postgres. Drizzle does not manage these privileges for you. Make sure to follow the instructions in [Granting permissions to Postgres roles](#granting-permissions-to-postgres-roles) to ensure the `editor` role has the required access.
</Admonition>

This approach lets you easily combine multiple roles with different permissions in your schema, keeping your access logic clear and maintainable.

### Granting permissions to Postgres roles

Drizzle does not manage Postgres table privileges. When you create new roles (such as `editor` or a custom backend role), you must manually grant them permission to access your schema and tables. You can execute these commands in the [Neon SQL Editor](/docs/get-started/query-with-neon-sql-editor) or via a custom database migration:

```sql shouldWrap
-- Create a role that can log in (for backend connections) or a NOLOGIN role
CREATE ROLE editor WITH LOGIN PASSWORD 'your_secure_password';

-- Grant schema access
GRANT USAGE ON SCHEMA public TO editor;

-- Grant access to specific tables
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE todos TO editor;

-- Note: Repeat the GRANT statement for any other tables this role needs to access or use a wildcard to grant on all tables in the schema:
-- GRANT SELECT, UPDATE, INSERT, DELETE ON ALL TABLES IN SCHEMA public TO editor;

-- Set default privileges for future tables in the schema:
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, UPDATE, INSERT, DELETE ON TABLES TO editor;
```

## How to run authenticated queries

After defining RLS policies, the next step is choosing how to run queries that respect these policies. Depending on your application architecture, you have two main options for running authenticated queries with RLS:

- **Frontend**: use the [Data API](/docs/data-api/get-started)
- **Backend**: use the Neon serverless driver with Drizzle

### Frontend: Use the Data API

For frontend applications, use the [Data API](/docs/data-api/get-started#connect-and-query), which provides a REST interface for your database. In this setup, Drizzle is used only to **declare and migrate RLS policies**; query execution is done with a PostgREST-compatible client such as `@neondatabase/neon-js`, `postgrest-js` etc.

When requests go through the Data API, your database enforces RLS policies automatically based on the JWT claims included in the request. This means that as long as your frontend includes the appropriate authentication token, users will only be able to access the data they're authorized to see.

For complete examples of using Drizzle RLS with the Data API, see:

- [Data API tutorial](/docs/data-api/demo) - Full note-taking app example built with Neon Auth, Drizzle RLS, and the Data API
- [Data API getting started](/docs/data-api/get-started) - Setup and basic queries

### Backend: Use Drizzle with the serverless driver

When connecting a backend API directly to the database using the Neon serverless driver, you have two options for handling authorization. The approach you choose depends on the Postgres role you use to connect.

By default, the `authenticated` role used for Data API is a `NOLOGIN` role. Consequently, if you connect using your default administrative role (like `neondb_owner`), that role has the `BYPASSRLS` attribute, meaning Row-Level Security policies are ignored. If you want to rely on your RLS policies at the database level, you must connect using a custom role that can log in and does not bypass RLS. Otherwise, you must enforce authorization directly in your queries.

Install the necessary dependencies for either approach:

```bash
npm install drizzle-orm @neondatabase/serverless jose
```

<Tabs labels={["Using a custom role (Enforce RLS)", "Using a role with BYPASSRLS"]}>
<TabItem>

If you connect with a custom role that does **not** have the `BYPASSRLS` attribute, the database will enforce your RLS policies. To use this approach, you must create a custom role, grant it the necessary privileges, and define your RLS policies for it.

#### 1. Create role and grant privileges

Make sure you have created your custom backend role (e.g., `my_backend_role`) and granted it the necessary privileges to access your schema and tables. See [Using custom roles with Drizzle RLS](#using-custom-roles-with-drizzle-rls) and [Granting permissions to Postgres roles](#granting-permissions-to-postgres-roles) for details.

#### 2. Define RLS Policies

Next, define policies that allow your custom role to access the rows conditionally.

<CodeTabs labels={["Drizzle", "SQL"]}>

```typescript
import { pgTable, text, bigint, boolean, pgRole } from 'drizzle-orm/pg-core';
import { crudPolicy, authUid } from 'drizzle-orm/neon';
import { sql } from 'drizzle-orm';

// Define the custom role in Drizzle
export const backendRole = pgRole('my_backend_role').existing();

export const todos = pgTable('todos', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  userId: text('user_id').notNull().default(sql`(auth.user_id())`),
  task: text('task').notNull(),
  isComplete: boolean('is_complete').notNull().default(false),
}, (table) => [
  crudPolicy({
    role: backendRole,
    read: authUid(table.userId),
    modify: authUid(table.userId),
  }),
]);
```

```sql
-- Assuming `todos` table and RLS are already enabled
CREATE POLICY "manage todos" ON "todos"
FOR ALL
TO my_backend_role
USING ((select auth.user_id()) = user_id);
```

</CodeTabs>

#### 3. Implement in your backend

Once your role and policies are set up, you can securely connect using this custom role. You can set the JWT claims in the transaction context using `set_config`, allowing functions like `auth.user_id()` to evaluate the authenticated user context.

<Admonition type="note">
The RLS policies in this example use `auth.user_id()`, which requires the Data API to be enabled. This is a hybrid approach: frontend queries use the Data API while backend operations use the serverless driver, both enforcing the same RLS policies.
</Admonition>

<Admonition type="note">
The `$withAuth` method in Drizzle is deprecated; instead, set JWT claims in the transaction context as shown in the example below.
</Admonition>

```typescript
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { Pool } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { todos } from './schema'; // Your Drizzle schema with RLS policies

const JWKS = createRemoteJWKSet(new URL(process.env.JWKS_URL!));

async function verifyJWT(token: string): Promise<JWTPayload> {
    const { payload } = await jwtVerify(token, JWKS, {
        // Adjust issuer and audience checks based on your JWT provider's configuration.
        // For Neon Auth, the issuer is new URL(jwksUrl).origin
        issuer: new URL(process.env.JWKS_URL!).origin,
    });

    if (!payload.sub) {
        throw new Error('JWT is missing required `sub` claim');
    }

    return payload;
}

export async function getTodosForUser(jwtToken: string) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
    const db = drizzle(pool);

    try {
        const claims = await verifyJWT(jwtToken);

        // Use Drizzle transaction to set auth and query
        const result = await db.transaction(async (tx) => {
            // Set JWT claims in the session
            await tx.execute(sql`select set_config('request.jwt.claims', ${claims}, true)`);

            // Now execute your Drizzle query - RLS policies will enforce access
            return await tx.select().from(todos);
        });

        return result;
    } finally {
        await pool.end();
    }
}
```

> Your application should use the correct database connection string with the custom role (for example, `postgresql://my_backend_role:password@host:port/database`) to ensure that RLS policies are enforced for that role.

**Pattern breakdown:**

1. **Verify the JWT** using your provider's JWKS (signature, issuer, and audience checks).
2. **Start a transaction** with Drizzle using the Neon serverless driver.
3. **Set `request.jwt.claims` in the transaction context** to make the authenticated user's identity available to RLS policies.
4. **Run Drizzle queries in the same transaction** and let database RLS policies enforce access.

</TabItem>

<TabItem>

When connecting with a role like `neondb_owner` (which has `BYPASSRLS`), RLS policies are **not enforced**. In this case, you must verify the JWT in your backend and manually apply access control directly in your Drizzle queries.

<Admonition type="important">
If you choose this approach, RLS policies in your database will be ignored, so you must ensure that all queries correctly enforce access control based on the authenticated user's identity. This puts the responsibility for security on your backend code, so it's crucial to implement this logic carefully to avoid data leaks. For this reason, using a custom role without `BYPASSRLS` is generally recommended for better security guarantees.
</Admonition>

```typescript
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { todos } from './schema'; // Your Drizzle schema
import { sql } from 'drizzle-orm';
import { jwtVerify, createRemoteJWKSet } from 'jose'

// Example JWT verification (implement based on your auth provider)
async function verifyJWT(token: string, jwksUrl: string) {
    try {
        const JWKS = createRemoteJWKSet(new URL(jwksUrl))
        const { payload } = await jwtVerify(token, JWKS, {
            // Adjust issuer and audience checks based on your JWT provider's configuration.
            // For Neon Auth, the issuer is new URL(jwksUrl).origin
            issuer: new URL(jwksUrl).origin
        })
        return { payload };
    } catch (err) {
        throw new Error(`JWT verification failed: ${(err as Error).message}`)
    }
}

async function getTodosForUser(jwtToken: string) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
    const db = drizzle(pool);

    try {
        // Verify JWT (Replace your actual JWKS URL and JWT token from your auth provider)
        const { payload } = await verifyJWT(jwtToken, "https://your-jwks-url.json");

        // When using a role with BYPASSRLS, RLS is not enforced.
        // You MUST apply access control directly in your query.
        const result = await db.transaction(async (tx) => {
            return await tx.select().from(todos).where(sql`${todos.userId} = ${payload.sub}`);
        });

        return result;
    } finally {
        await pool.end();
    }
}
```

</TabItem>
</Tabs>

<NeedHelp/>
