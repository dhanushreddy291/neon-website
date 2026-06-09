# Research: Neon TypeScript SDK Documentation Audit

This document outlines the findings and recommendations from an audit of the Neon TypeScript SDK documentation, specifically focusing on `@neondatabase/api-client` (Management SDK) and its relationship with other SDKs like `@neondatabase/neon-js` (Client SDK).

## 1. Major Gaps and Missing Information

### 1.1 Polling for Asynchronous Operations

The Neon API is largely asynchronous. While the documentation mentions that many operations return an `operation_id`, there are no TypeScript SDK examples showing how to poll for the completion of an operation.

- **Recommendation:** Add a section "Polling for Operations" in `typescript-sdk.md` with a helper function example (e.g., using a while loop with a delay).

### 1.2 Pagination Examples

The `api-reference.md` mentions cursor-based pagination, but the TypeScript SDK guide does not demonstrate how to use `limit` and `cursor` parameters in methods like `listProjects` or `listProjectBranches`.

- **Recommendation:** Include a pagination example in the "List Projects" or "Key SDK Method Signatures" section.

### 1.3 Incomplete "Using SDK Types" Section

In `content/docs/reference/typescript-sdk.md`, the section "Using SDK Types" ends abruptly:

> Similarly, when creating a project, you can use types like `ProjectCreateRequest` for the request body and `ProjectResponse` for the expected response:

- **Recommendation:** Complete this section with a code example showing the use of these types.

---

## 2. Inconsistencies Across Documents

### 2.1 Confusing Naming Convention

There is significant overlap and potential confusion between the two "TypeScript SDKs":

- **Neon API TypeScript SDK** (`@neondatabase/api-client`): Used for management/infrastructure.
- **Neon TypeScript SDK** (`@neondatabase/neon-js`): Used for Data API and Auth.
- In `sdk.md`, the title for the Client SDK is "Neon TypeScript SDK", while the Management SDK is "Neon API TypeScript SDK".
- However, `typescript-sdk.md` (Management) is titled "Neon API TypeScript SDK" but its URL is `reference/typescript-sdk`, while the Client SDK is `reference/javascript-sdk`.
- **Recommendation:** Standardize the naming. Refer to them consistently as "Management SDK" and "Client SDK" in subtitles or summaries to reduce confusion. Rename `javascript-sdk.md` to `client-sdk.md` or similar if possible, or at least update the titles to be more distinct.

### 2.2 Method Signature Discrepancies (`listProjectBranches`)

- In `typescript-sdk.md`, the signature is listed as:
  `listProjectBranches(projectId: string, query?: ListProjectBranchesParams)`
- However, the "List Branches" example in the same file uses:
  `const response = await apiClient.listProjectBranches({ projectId });`
- The AI Skills reference (`public/docs/ai/skills/neon-postgres/references/neon-typescript-sdk.md`) also uses the object-based call:
  `apiClient.listProjectBranches({ projectId })`
- **Correction:** Based on the signature and other methods (like `getProject(projectId)`), the positional argument `projectId: string` is likely correct. The examples passing an object `{ projectId }` are likely incorrect.

---

## 3. Structural and Clarity Improvements

### 3.1 Duplicate Method Entries

In `typescript-sdk.md`, `getProjectOperation(projectId: string, operationId: string)` is listed twice:

1. Under "Manage projects"
2. Under "General" (at the very end of method signatures)

- **Recommendation:** Remove the duplicate entry in the "General" section.

### 3.2 Error Handling Consistency

The `typescript-sdk.md` guide suggests:

```typescript
} catch (error) {
  console.error('Error listing projects:', error);
}
```

But the AI Skills guide provides a more detailed `AxiosError` check:

```typescript
} catch (error: any) {
  if (error.isAxiosError) { ... }
}
```

- **Recommendation:** Use the more robust error handling example in the main `typescript-sdk.md` to help developers debug faster.

### 3.3 Outdated/Inconsistent Cloud Region Links

`typescript-sdk.md` refers to "Neon Regions" at `/docs/introduction/regions`. This link should be verified to ensure it's the current canonical location for region IDs.

---

## 4. Specific Documentation Fixes (Action Plan)

1.  **Fix `listProjectBranches` example**: Update code block in `typescript-sdk.md` to use `apiClient.listProjectBranches(projectId)`.
2.  **Remove duplicate `getProjectOperation`**: Clean up the "General" section.
3.  **Complete the "Using SDK Types" section**: Add the missing code example.
4.  **Add Polling Example**: Insert a new section showing how to wait for an operation to finish.
5.  **Distinguish from Client SDK**: Add a note at the top of `typescript-sdk.md` and `javascript-sdk.md` to clearly point to the other if the user is looking for Data API vs Management API.
