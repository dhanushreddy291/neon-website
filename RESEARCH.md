# Neon Auth Documentation Audit Results

This document summarizes the findings from the audit of Neon Auth documentation for consistency, completeness, and accuracy.

## 1. Broken Links and Fragments

### Internal Fragment Issues
Multiple documents contain links to fragments that do not exist or use incorrect naming conventions. Neon Auth docs frequently use custom IDs (e.g., `id="auth-getsession"`) but are sometimes linked using standard markdown slugs (e.g., `#get-session`).

- **`content/docs/auth/troubleshooting.md`**:
    - Links to `/docs/auth/reference/nextjs-server#get-session` but the actual ID is `#auth-getsession`.
- **`content/docs/auth/overview.md`**:
    - Links to `/docs/auth/guides/plugins#example-applications` but `plugins.md` has no such anchor or header.
    - Links to `/docs/manage/projects#configure-ip-allow` but `projects.md` uses standard slugs (likely `#configure-ip-allow-list` or similar).
    - Links to `/docs/introduction/plans#auth` but `plans.md` header is `### Auth` which slugs to `#auth`. If it's nested it might be reachable, but typically top-level headers are preferred for stable linking.
- **`content/docs/auth/guides/plugins/email-otp.md`**:
    - Links to `/docs/reference/javascript-sdk#auth-signinwithemailotp` but the actual ID is `#auth-signinwithotp`.
- **`content/docs/auth/guides/plugins/organization.md`**:
    - Links to `/docs/auth/reference/ui-components#core-components` but `ui-components.md` has `## Core Components` (slug `#core-components`).

### Outdated/Missing Pages
- **Changelog entries**: Many older changelog entries (e.g., `2025-02-07.md`, `2025-03-14.md`) link to `/docs/guides/neon-auth` or `/docs/neon-auth/overview` which have been moved to `/docs/auth/overview`.
- **`content/changelog/2025-01-10.md`**: Links to `/docs/guides/neon-identity` which does not exist in the current guides directory.

## 2. Image References

- **Unreferenced Image**: `public/docs/auth/console-auth-organizations-config.png` exists but is not used in any `content/docs/auth` file.
- **Inconsistent Path**: `content/docs/auth/guides/plugins/organization.md` references an image in `/docs/changelog/` instead of `/docs/auth/`.
- **Verified existence**: `public/docs/auth/neon-auth-base-url.png` exists and is correctly referenced.

## 3. Inconsistencies and Terminology

- **Legacy Names**: "Stack Auth" is correctly identified as legacy. "Neon Identity" appears in older changelogs and should be considered an alias for the legacy version of Neon Auth.
- **Better Auth Versioning**: Only `overview.md` mentions the supported Better Auth version (1.4.18). Other guides do not mention it, which is consistent but worth noting if version-specific features are added.
- **SDK Methods**:
    - The Troubleshooting guide mentions `BetterAuthReactAdapter` is needed for `useSession()`.
    - The React Quickstart (`react.md`) does not use the adapter or mention it, focusing on raw SDK methods. This might confuse users trying to use hooks later.

## 4. Gaps and Improvements

- **React Quickstart**: Could benefit from a note about the `BetterAuthReactAdapter` if the user intends to use React hooks like `useSession()`.
- **Organization Plugin**: The "Partial Support" status is well-documented, but a clearer list of "What's Missing" (like Teams, custom permissions) in the main `plugins.md` would be helpful.
- **Next.js Proxy Note**: The `<NextjsProxyNote/>` component is used but its content was not audited. Ensure it correctly explains the `proxy.ts` vs `middleware.ts` distinction for different Next.js versions.

## 5. Recommendations

1. **Standardize Anchors**: Ensure all cross-links use the correct custom IDs or standard slugs. Specifically fix the `#auth-getsession` and `#auth-signinwithotp` links.
2. **Fix Changelog Links**: Bulk update old auth-related links in the changelog to point to the current `/docs/auth/` paths.
3. **Update React Quickstart**: Add an optional step or a "Next Steps" note about `BetterAuthReactAdapter` for users who want to use React hooks.
4. **Clean up Images**: Move auth-related images from `/docs/changelog/` to `/docs/auth/` and remove unused images like `console-auth-organizations-config.png`.
5. **Consolidate Roadmap**: Ensure `roadmap.md` is the single source of truth for plugin support status and that other pages link to it.
