# Assumptions

This doc lists the assumptions made in the design and implementation of this project.

---

Since I have no access to the complete API schema of https://portier-takehometest.onrender.com/api/v1/data/sync, I am assuming that the API needs this query based on the shown error response:

```
"query parameter 'application_id' is required"
"unsupported application_id; valid values are: salesforce, hubspot, stripe, slack, zendesk, intercom"
```

Assumed schema:

```
GET /api/v1/data/sync

Query Parameters:
- application_id: 'salesforce' | 'hubspot' | 'stripe' | 'slack' | 'zendesk' | 'intercom'
  The application for which the data sync is being requested.
```

---

## Sync Approval Data Change Types

The response from `/api/v1/data/sync` contains a `changes` array with three change types that operate at different levels:

### Change Type Patterns

- **UPDATE** `entity.field` - Modifies an existing field's value on an entity
  - Example: `{"field_name": "user.email", "current_value": "old@example.com", "new_value": "new@example.com"}`
  - Both `current_value` and `new_value` are present

- **DELETE** `entity.id` - Removes an entire entity
  - Example: `{"field_name": "user.id", "current_value": "9e0f1a2b...", "change_type": "DELETE"}`
  - Only `current_value` is present (the ID being deleted)
  - No `new_value`

- **ADD** `entity.id` - Adds a new entity
  - Example: `{"field_name": "user.id", "change_type": "ADD", "new_value": "3e4f5a6b..."}`
  - Only `new_value` is present (the ID being added)
  - No `current_value`

### Key Insight

When `field_name` ends with `.id`, it indicates **whole entity operations**:

- `user.id` → Adding/removing a user entity
- `key.id` → Adding/removing a key entity

When `field_name` is `entity.something_else`, it's a **field modification** on an existing entity.

---

## Resolve Workflow

The resolve workflow allows users to review and approve sync changes before they are applied to the integration.

### Process Flow

1. **Fetch Sync Data**: GET `/api/v1/data/sync?application_id={id}` returns pending changes
2. **User Review**: Users review each change individually
3. **Action Selection**: For each change, user selects:
   - **Accept** - Change will be applied to the integration
   - **Discard** - Change will be ignored
4. **Batch Submission**: POST `/api/v1/data/{application_id}/resolve` submits all actions at once
5. **Event Creation**: A new `SyncEvent` is created with a version number

### SyncEvent Structure

Each resolution creates a `SyncEvent` that records:

```typescript
{
  version: "20250101.01",        // Date-based version (YYYYMMDD.seq)
  applicationId: "salesforce",   // Integration identifier
  createdAt: "2025-01-01T...",   // ISO timestamp
  createdBy: "user-id",          // User who resolved
  actions: [                     // Array of accepted/discarded actions
    {
      syncChange: { /* change details */ },
      action: "accept" | "discard"
    }
  ]
}
```

### Version Format

Versions follow the pattern: `YYYYMMDD.SEQ`

- `20250101.01` - First sync on January 1, 2025
- `20250101.02` - Second sync on January 1, 2025
- `20250102.01` - First sync on January 2, 2025

### History Endpoints

Two endpoints provide different levels of detail:

**List Endpoint**: `GET /api/v1/data/{application_id}/history`

- Returns summary with counts: `added`, `updated`, `deleted`
- No action details - just the numbers
- Used for displaying history list view

**Detail Endpoint**: `GET /api/v1/data/{application_id}/history/{version}`

- Returns full `SyncEvent` with all actions
- Includes both accepted and discarded changes with full details
- Used for displaying detailed view of a specific sync event

### State Management

After successful resolution, the following queries are invalidated:

1. History list query (to show new event)
2. Integration details query (to update `lastSyncedAt` timestamp)
3. Integration list query (to update sync status across dashboard)

This ensures all views reflect the latest sync state immediately after resolution.
