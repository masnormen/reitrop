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

// In-memory database for integrations
// Edit this file to add/modify integrations
export const INTEGRATIONS: Integration[] = [
  {
    id: "slack",
    name: "Slack",
    emoji: "💬",
    status: "synced",
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    version: "20250118.01",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    emoji: "☁️",
    status: "synced",
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    version: "20250118.02",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    emoji: "🧲",
    status: "conflict",
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    version: "20250118.01",
  },
  {
    id: "stripe",
    name: "Stripe",
    emoji: "💳",
    status: "synced",
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    version: "20250118.03",
  },
  {
    id: "intercom",
    name: "Intercom",
    emoji: "📞",
    status: "syncing",
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    version: "20250118.01",
  },
  {
    id: "zendesk",
    name: "Zendesk",
    emoji: "🎧",
    status: "error",
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    version: "20250117.05",
  },
];

// In-memory storage for sync events
export const SYNC_EVENTS: Partial<Record<ApplicationId, SyncEvent[]>> = {};
