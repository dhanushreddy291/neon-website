# RLS Documentation Audit: Findings and Recommendations

This document outlines the findings from a comprehensive audit of Neon's Row-Level Security (RLS) documentation. It identifies gaps, inconsistencies, and areas for improvement to ensure a better developer experience.

## Executive Summary

The RLS documentation is generally high-quality and covers a broad range of use cases from simple per-user access to complex multi-tenant scenarios. However, there are notable inconsistencies in function naming (`auth.user_id()` vs `auth.uid()`), inconsistent application of performance best practices (wrapping calls in subqueries), and some outdated references to deprecated Drizzle methods.

## Key Findings

### 1. Function Naming Inconsistency (`auth.user_id()` vs `auth.uid()`)

- **Observation**: The primary function for retrieving the user ID from a JWT is referred to as `auth.user_id()` in most Data API and Drizzle guides. However, `auth.uid()` is used extensively in `database-advisor.md` and mentioned as a UUID-returning alternative in `pg_session_jwt.md`.
- **Conflict**: `complete-supabase-migration.md` explicitly instructs users to replace `auth.uid()` with `auth.user_id()`, implying `auth.uid()` might be a Supabase-specific legacy or simply less preferred in the Neon ecosystem.
- **Risk**: Users might be confused about which function to use, especially if they are migrating or using the Database Advisor which suggests `auth.uid()`.

### 2. Performance Best Practice (InitPlan / Subqueries)

- **Observation**: `database-advisor.md` and `rls-drizzle.md` correctly highlight that wrapping RLS function calls in a subquery (e.g., `(SELECT auth.user_id())`) prevents Postgres from re-evaluating the function for every row (improving performance from $O(N)$ to $O(1)$).
- **Inconsistency**: Many code snippets in `row-level-security.md`, `rls-tutorial.md`, and `get-started.md` use the naked function call `auth.user_id() = user_id`.
- **Recommendation**: Standardize on the subquery pattern `(SELECT auth.user_id()) = user_id` across all documentation to promote "performance by default".

### 3. Drizzle `$withAuth` Deprecation

- **Observation**: `rls-query-execution.md` correctly notes that the `$withAuth` method in Drizzle is deprecated and provides the new transaction-based pattern.
- **Risk**: Other guides or external community knowledge might still point to `$withAuth`. Ensure all internal guides have moved away from this.

### 4. Drizzle `authUid` Helper vs. Raw SQL

- **Observation**: The `authUid` helper is promoted in `rls-drizzle.md` and `rls-tutorial.md`. It generates `(select auth.user_id() = column)`.
- **Inconsistency**: Some examples use `sql` templates with raw `auth.user_id()` instead of the helper, even when the helper would suffice.
- **Recommendation**: Prefer `authUid(table.column)` in all Drizzle examples for simplicity, or consistently show both if explaining the underlying SQL.

### 5. `pg_session_jwt` Extension Visibility

- **Observation**: The `pg_session_jwt` extension is the engine behind RLS and Data API, but its dedicated page is located under "Extensions".
- **Gap**: While it's "automatically installed", users building custom backends (not using Data API) need to understand `auth.init()` and `auth.jwt_session_init()`. This path is less clear than the Data API path.

### 6. Role Naming Inconsistencies

- **Observation**: `rls-multi-tenant-apps.md` uses `current_setting('app.current_tenant')`, while Data API docs focus on JWT claims via `auth.user_id()`.
- **Gap**: There is a slight disconnect between "standard Postgres RLS" (using session variables) and "Neon Data API RLS" (using JWT claims via an extension). A "Rosetta Stone" or clearer bridge between these two worlds would help.

---

## Recommendations

### Short-term Improvements (Content Fixes)

1.  **Standardize Function Names**: Decide on a preferred "canonical" function. If `auth.user_id()` is the standard, update `database-advisor.md` and others to use it instead of `auth.uid()`.
2.  **Apply Subquery Pattern**: Update all SQL and Drizzle snippets to use the subquery pattern for performance.
    - SQL: `USING ((SELECT auth.user_id()) = user_id)`
    - Drizzle: `authUid(table.userId)` (which already uses a subquery).
3.  **Cross-Linking**: Ensure `pg_session_jwt.md` is more prominently linked from `row-level-security.md` for users who want to understand "how it works under the hood".

### Long-term Improvements (Structural)

1.  **Unified RLS Landing Page**: Enhance `row-level-security.md` to be a stronger hub that clearly branches off into:
    - Data API (JWT-based)
    - Drizzle (Declarative)
    - Custom Backends (Manual JWT/Session handling)
    - Traditional Postgres RLS (Session variables)
2.  **Performance Section**: Add a dedicated "RLS Performance" section to the main RLS guide, consolidating the "InitPlan" advice.

## File-Specific Audit Notes

| File | Status | Issue |
| :--- | :--- | :--- |
| `content/docs/guides/row-level-security.md` | Needs Update | Uses naked `auth.user_id()` instead of subquery pattern. |
| `content/docs/guides/rls-tutorial.md` | Good | Uses `authUid` and explains the subquery underlying it. |
| `content/docs/guides/rls-drizzle.md` | Good | Correctly identifies subquery benefits. |
| `content/docs/guides/rls-query-execution.md` | Good | Correctly identifies Drizzle deprecations. |
| `content/docs/data-api/database-advisor.md` | Needs Update | Uses `auth.uid()` which contradicts migration guide advice. |
| `content/docs/data-api/get-started.md` | Needs Update | Mixed use of naked function vs subquery. |
| `content/postgresql/administration/row-level-security.md` | Neutral | Focuses on standard Postgres (roles/users), which is fine, but could link to Neon-specific JWT RLS. |
| `content/guides/complete-supabase-migration.md` | Critical | Explicitly mentions `auth.user_id()` as the replacement for `auth.uid()`. This reinforces the need to standardize on `auth.user_id()`. |
