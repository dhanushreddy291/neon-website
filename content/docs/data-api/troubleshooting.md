---
title: Data API troubleshooting
subtitle: Common issues and solutions when using the Neon Data API
enableTableOfContents: true
---

<FeatureBetaProps feature_name="Neon Data API" />

## Permission denied to create extension "pg_session_jwt"

```bash
ERROR: permission denied to create extension "pg_session_jwt" (SQLSTATE 42501)
```

You might also see this generic error instead:

```bash
Request failed: unknown internal server error
```

### Why this happens

You created your database with a direct SQL query (`CREATE DATABASE foo;`) instead of using the Console UI or Neon API. The Data API requires specific database permissions that aren't automatically granted when you create databases this way.

### Fix

Grant `neon_superuser` permissions to the database you want to enable the Data API for.

```sql
GRANT ALL PRIVILEGES ON DATABASE your_database_name TO neon_superuser;
```

For future databases, create them using the Console UI or Neon API instead of direct SQL. Neon automatically sets up the required permissions when you use these methods.

**Example**

```bash
curl -X POST "https://console.neon.tech/api/v2/projects/${projectId}/branches/${branchId}/databases" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -d '{
    "database": {
      "name": "your_database_name"
    }
  }'
```
