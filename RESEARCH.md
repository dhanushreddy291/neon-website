# Audit Report: Neon Data API Documentation

This report outlines the findings from a comprehensive audit of the Neon Data API documentation, focusing on consistency, completeness, and clarity.

## 1. Consistency Issues

### `auth.user_id()` vs `auth.uid()`

There is significant inconsistency in which function is recommended for Row-Level Security (RLS) policies.

- **`auth.user_id()`**: Predominantly used in `get-started.md`, `access-control.md`, and `demo.md`. Returns a `text` type.
- **`auth.uid()`**: Used in `database-advisor.md` and `authentication-flow.md`. Returns a `UUID` type.
- **Issue**: Many users use UUIDs for their user ID columns. If they follow the `get-started.md` guide which uses `auth.user_id()`, they often have to cast it to `text` (e.g., `user_id::text = auth.user_id()`), which is less efficient and clunkier than using `auth.uid()`.
- **Files affected**:
    - `content/docs/data-api/get-started.md`
    - `content/docs/data-api/database-advisor.md`
    - `content/docs/auth/authentication-flow.md`
    - `content/docs/extensions/pg_session_jwt.md` (This file correctly explains the difference, but the distinction is lost in other guides).

### SDK Naming Conventions

The SDK is referred to by multiple names, which can be confusing for new users.

- **Names used**: "Neon TypeScript SDK", "Neon JS SDK", "@neondatabase/neon-js", "Neon SDK".
- **Files affected**:
    - `content/docs/data-api/overview.md`
    - `content/docs/reference/javascript-sdk.md`
    - `content/guides/react-neon-auth-data-api.md`

### RLS Policy Syntax (Subqueries)

- **`database-advisor.md`** strongly recommends wrapping `auth.uid()` or `auth.user_id()` in a subquery `(SELECT auth.uid())` to prevent per-row re-evaluation and improve performance.
- **`get-started.md`** and **`access-control.md`** do not follow this recommendation in their examples (e.g., `USING (auth.user_id() = user_id)`).
- **Issue**: Users following the quickstart might run into performance issues as their data grows, and only discover the "correct" way later through the Advisor.

## 2. Gaps and Incompleteness

### Custom Claim Usage

The `pg_session_jwt` extension supports `auth.session()` (or `auth.jwt()`) to return the full JWT payload.

- **Gap**: There is no documentation or example of how to use custom claims (e.g., `(auth.session() ->> 'org_id')`) in RLS policies, even though "Custom roles" are mentioned in `access-control.md`.

### Regional and Infrastructure Limitations

- **Gap**: `get-started.md` mentions that IP Allow and Private Networking are not supported. However, `rls-tutorial.md` mentions that Azure regions are not supported. This regional limitation should be centralized in the main `overview.md` or `get-started.md` "Before you begin" section.

### Error Message Mapping

- **Gap**: While `troubleshooting.md` is extensive, it lacks mapping for some common PostgREST-specific error codes (e.g., `PGRSTxxx`) that users might see when using the Data API directly via cURL.

## 3. Recommendations for Improvement

### Standardize RLS Recommendations

- Consistently recommend the subquery pattern: `(SELECT auth.user_id())`.
- Clarify when to use `auth.uid()` (for `UUID` columns) vs `auth.user_id()` (for `text` columns) in the primary RLS guide.

### Centralize Limitations

- Create a clear "Limitations" section in `overview.md` that covers:
    - Regional support (AWS only for now).
    - Networking restrictions (IP Allow/Private Networking).
    - Database creation methods (Console/API vs raw SQL).

### Improve Type Safety Documentation

- In `generate-types.md`, explicitly mention that the generated types work with the subquery RLS pattern.
- Update the React/Todo guide to use `auth.uid()` instead of casting a UUID to `text`.

### Enhance Troubleshooting

- Add a "Common PostgREST Errors" section to `troubleshooting.md`.
- Include a section on "Debugging RLS" using `SET request.jwt.claims` in the SQL Editor, which is hinted at in `pg_session_jwt.md` but not explicitly taught as a debugging tool.
