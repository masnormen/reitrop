import type { ApplicationId, Integration, SyncEvent } from "./schema/integrations";

export const MOCK_USER = {
  id: "2998b136-c351-461e-a312-f8a8eed51f13",
  name: "John Doe",
  email: "admin@admin.com",
  phone: "123-456-7890",
  role: "user",
  status: "active",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// In-memory storage for sync events
export const SYNC_EVENTS: Partial<Record<ApplicationId, SyncEvent[]>> = {
  slack: [
    {
      version: "20260419.01",
      applicationId: "slack",
      actions: [
        {
          syncChange: {
            id: "change_001",
            field_name: "door.status",
            change_type: "UPDATE",
            current_value: "offline",
            new_value: "online",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_011",
            field_name: "key.access_end",
            change_type: "UPDATE",
            current_value: "2026-03-31T18:00:00Z",
            new_value: "2026-09-30T18:00:00Z",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_008",
            field_name: "key.id",
            change_type: "DELETE",
            current_value: "0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_002",
            field_name: "key.status",
            change_type: "UPDATE",
            current_value: "active",
            new_value: "revoked",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_012",
            field_name: "user.email",
            change_type: "UPDATE",
            current_value: "evan.temp@company.com",
            new_value: "evan@company.com",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_007",
            field_name: "user.id",
            change_type: "ADD",
            new_value: "1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_010",
            field_name: "user.id",
            change_type: "ADD",
            new_value: "4f5a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_013",
            field_name: "user.id",
            change_type: "DELETE",
            current_value: "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_009",
            field_name: "user.phone",
            change_type: "UPDATE",
            current_value: "+6581110000",
            new_value: "+6581119999",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_004",
            field_name: "user.role",
            change_type: "UPDATE",
            current_value: "user",
            new_value: "admin",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_005",
            field_name: "user.role",
            change_type: "UPDATE",
            current_value: "admin",
            new_value: "user",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_003",
            field_name: "user.status",
            change_type: "UPDATE",
            current_value: "active",
            new_value: "suspended",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_006",
            field_name: "user.status",
            change_type: "UPDATE",
            current_value: "suspended",
            new_value: "active",
          },
          action: "accept",
        },
      ],
      createdAt: "2026-04-19T03:00:08.289Z",
      createdBy: "2998b136-c351-461e-a312-f8a8eed51f13",
    },
    {
      version: "20260419.02",
      applicationId: "slack",
      actions: [
        {
          syncChange: {
            id: "change_011",
            field_name: "door.status",
            change_type: "UPDATE",
            current_value: "offline",
            new_value: "online",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_009",
            field_name: "key.id",
            change_type: "DELETE",
            current_value: "0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_002",
            field_name: "key.status",
            change_type: "UPDATE",
            current_value: "active",
            new_value: "revoked",
          },
          action: "discard",
        },
        {
          syncChange: {
            id: "change_010",
            field_name: "user.email",
            change_type: "UPDATE",
            current_value: "charlie.old@company.com",
            new_value: "charlie@company.com",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_004",
            field_name: "user.id",
            change_type: "ADD",
            new_value: "1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_006",
            field_name: "user.id",
            change_type: "DELETE",
            current_value: "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_007",
            field_name: "user.name",
            change_type: "UPDATE",
            current_value: "Bob S.",
            new_value: "Bob Smith",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_003",
            field_name: "user.phone",
            change_type: "UPDATE",
            current_value: "+6581110000",
            new_value: "+6581119999",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_005",
            field_name: "user.role",
            change_type: "UPDATE",
            current_value: "guest",
            new_value: "user",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_008",
            field_name: "user.role",
            change_type: "UPDATE",
            current_value: "admin",
            new_value: "user",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_001",
            field_name: "user.status",
            change_type: "UPDATE",
            current_value: "suspended",
            new_value: "active",
          },
          action: "accept",
        },
      ],
      createdAt: "2026-04-19T03:01:03.795Z",
      createdBy: "2998b136-c351-461e-a312-f8a8eed51f13",
    },
    {
      version: "20260419.03",
      applicationId: "slack",
      actions: [
        {
          syncChange: {
            id: "change_005",
            field_name: "door.status",
            change_type: "UPDATE",
            current_value: "offline",
            new_value: "online",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_003",
            field_name: "key.id",
            change_type: "DELETE",
            current_value: "0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_004",
            field_name: "key.status",
            change_type: "UPDATE",
            current_value: "active",
            new_value: "revoked",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_010",
            field_name: "user.email",
            change_type: "UPDATE",
            current_value: "evan.temp@company.com",
            new_value: "evan@company.com",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_007",
            field_name: "user.id",
            change_type: "ADD",
            new_value: "1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_011",
            field_name: "user.id",
            change_type: "ADD",
            new_value: "4f5a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_008",
            field_name: "user.name",
            change_type: "UPDATE",
            current_value: "Bob S.",
            new_value: "Bob Smith",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_001",
            field_name: "user.phone",
            change_type: "UPDATE",
            current_value: "+6581110000",
            new_value: "+6581119999",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_002",
            field_name: "user.role",
            change_type: "UPDATE",
            current_value: "guest",
            new_value: "user",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_006",
            field_name: "user.role",
            change_type: "UPDATE",
            current_value: "admin",
            new_value: "user",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_009",
            field_name: "user.status",
            change_type: "UPDATE",
            current_value: "suspended",
            new_value: "active",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_012",
            field_name: "user.status",
            change_type: "UPDATE",
            current_value: "active",
            new_value: "suspended",
          },
          action: "accept",
        },
      ],
      createdAt: "2026-04-19T03:02:23.176Z",
      createdBy: "2998b136-c351-461e-a312-f8a8eed51f13",
    },
    {
      version: "20260419.04",
      applicationId: "slack",
      actions: [
        {
          syncChange: {
            id: "change_002",
            field_name: "door.status",
            change_type: "UPDATE",
            current_value: "offline",
            new_value: "online",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_004",
            field_name: "key.access_end",
            change_type: "UPDATE",
            current_value: "2026-03-31T18:00:00Z",
            new_value: "2026-09-30T18:00:00Z",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_006",
            field_name: "key.id",
            change_type: "DELETE",
            current_value: "0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_001",
            field_name: "user.email",
            change_type: "UPDATE",
            current_value: "charlie.old@company.com",
            new_value: "charlie@company.com",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_003",
            field_name: "user.id",
            change_type: "ADD",
            new_value: "1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_009",
            field_name: "user.id",
            change_type: "ADD",
            new_value: "4f5a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_010",
            field_name: "user.name",
            change_type: "UPDATE",
            current_value: "Bob S.",
            new_value: "Bob Smith",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_011",
            field_name: "user.name",
            change_type: "UPDATE",
            current_value: "Diana P.",
            new_value: "Diana Park",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_005",
            field_name: "user.role",
            change_type: "UPDATE",
            current_value: "guest",
            new_value: "user",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_007",
            field_name: "user.role",
            change_type: "UPDATE",
            current_value: "user",
            new_value: "admin",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_008",
            field_name: "user.role",
            change_type: "UPDATE",
            current_value: "admin",
            new_value: "user",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_012",
            field_name: "user.status",
            change_type: "UPDATE",
            current_value: "active",
            new_value: "suspended",
          },
          action: "accept",
        },
        {
          syncChange: {
            id: "change_013",
            field_name: "user.status",
            change_type: "UPDATE",
            current_value: "suspended",
            new_value: "active",
          },
          action: "accept",
        },
      ],
      createdAt: "2026-04-19T03:02:59.240Z",
      createdBy: "2998b136-c351-461e-a312-f8a8eed51f13",
    },
    {
      version: "20260419.05",
      applicationId: "slack",
      actions: [
        {
          syncChange: {
            id: "change_005",
            field_name: "door.status",
            change_type: "UPDATE",
            current_value: "offline",
            new_value: "online",
          },
          action: "discard",
        },
        {
          syncChange: {
            id: "change_003",
            field_name: "key.access_end",
            change_type: "UPDATE",
            current_value: "2026-03-31T18:00:00Z",
            new_value: "2026-09-30T18:00:00Z",
          },
          action: "discard",
        },
        {
          syncChange: {
            id: "change_001",
            field_name: "key.id",
            change_type: "DELETE",
            current_value: "0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a",
          },
          action: "discard",
        },
        {
          syncChange: {
            id: "change_002",
            field_name: "user.email",
            change_type: "UPDATE",
            current_value: "evan.temp@company.com",
            new_value: "evan@company.com",
          },
          action: "discard",
        },
        {
          syncChange: {
            id: "change_007",
            field_name: "user.email",
            change_type: "UPDATE",
            current_value: "charlie.old@company.com",
            new_value: "charlie@company.com",
          },
          action: "discard",
        },
        {
          syncChange: {
            id: "change_012",
            field_name: "user.id",
            change_type: "ADD",
            new_value: "1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f",
          },
          action: "discard",
        },
        {
          syncChange: {
            id: "change_011",
            field_name: "user.id",
            change_type: "DELETE",
            current_value: "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
          },
          action: "discard",
        },
        {
          syncChange: {
            id: "change_008",
            field_name: "user.name",
            change_type: "UPDATE",
            current_value: "Bob S.",
            new_value: "Bob Smith",
          },
          action: "discard",
        },
        {
          syncChange: {
            id: "change_013",
            field_name: "user.name",
            change_type: "UPDATE",
            current_value: "Diana P.",
            new_value: "Diana Park",
          },
          action: "discard",
        },
        {
          syncChange: {
            id: "change_010",
            field_name: "user.phone",
            change_type: "UPDATE",
            current_value: "+6581110000",
            new_value: "+6581119999",
          },
          action: "discard",
        },
        {
          syncChange: {
            id: "change_006",
            field_name: "user.role",
            change_type: "UPDATE",
            current_value: "user",
            new_value: "admin",
          },
          action: "discard",
        },
        {
          syncChange: {
            id: "change_004",
            field_name: "user.status",
            change_type: "UPDATE",
            current_value: "active",
            new_value: "suspended",
          },
          action: "discard",
        },
        {
          syncChange: {
            id: "change_009",
            field_name: "user.status",
            change_type: "UPDATE",
            current_value: "suspended",
            new_value: "active",
          },
          action: "discard",
        },
      ],
      createdAt: "2026-04-19T03:03:15.985Z",
      createdBy: "2998b136-c351-461e-a312-f8a8eed51f13",
    },
  ],
};

// In-memory database for integrations
// Edit this file to add/modify integrations
export const INTEGRATIONS: Integration[] = [
  {
    id: "slack",
    name: "Slack",
    emoji: "💬",
    status: "synced",
    lastSyncedAt: SYNC_EVENTS.slack?.[SYNC_EVENTS.slack.length - 1]!.createdAt || null,
    version: SYNC_EVENTS.slack?.[SYNC_EVENTS.slack.length - 1]!.version || "20260419.05",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    emoji: "☁️",
    status: "synced",
    lastSyncedAt: null,
    version: "20250118.02",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    emoji: "🧲",
    status: "conflict",
    lastSyncedAt: null,
    version: "20250118.01",
  },
  {
    id: "stripe",
    name: "Stripe",
    emoji: "💳",
    status: "synced",
    lastSyncedAt: null,
    version: "20250118.03",
  },
  {
    id: "intercom",
    name: "Intercom",
    emoji: "📞",
    status: "syncing",
    lastSyncedAt: null,
    version: "20250118.01",
  },
  {
    id: "zendesk",
    name: "Zendesk",
    emoji: "🎧",
    status: "error",
    lastSyncedAt: null,
    version: "20250117.05",
  },
];
