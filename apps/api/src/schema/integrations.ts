import { z } from "zod";

export const ApplicationId = z.enum([
  "salesforce",
  "hubspot",
  "stripe",
  "slack",
  "zendesk",
  "intercom",
]);
export type ApplicationId = z.infer<typeof ApplicationId>;

export const SyncStatus = z.enum(["synced", "syncing", "conflict", "error"]);
export type SyncStatus = z.infer<typeof SyncStatus>;

export const Integration = z.object({
  id: ApplicationId,
  name: z.string(),
  emoji: z.string(),
  status: SyncStatus,
  lastSyncedAt: z.string(),
  version: z.string(),
});
export type Integration = z.infer<typeof Integration>;

export const ChangeType = z.enum(["ADD", "UPDATE", "DELETE"]);
export type ChangeType = z.infer<typeof ChangeType>;

// START External

export const SyncChange = z.object({
  id: z.string(),
  field_name: z.string(),
  change_type: ChangeType,
  current_value: z.string().optional(),
  new_value: z.string().optional(),
});
export type SyncChange = z.infer<typeof SyncChange>;

export const SyncApproval = z.object({
  application_name: z.string(),
  changes: z.array(SyncChange),
});
export type SyncApproval = z.infer<typeof SyncApproval>;
export const SyncData = z.object({
  sync_approval: SyncApproval,
  metadata: z.record(z.string(), z.unknown()),
});
export type SyncData = z.infer<typeof SyncData>;
// END External

export const ConnectionStatus = z.enum(["connected", "disconnected", "pending", "error"]);
export type ConnectionStatus = z.infer<typeof ConnectionStatus>;

export const SyncEventStatus = z.enum(["pending", "accepted", "discarded", "failed"]);
export type SyncEventStatus = z.infer<typeof SyncEventStatus>;

export const SyncAction = z.object({
  syncChange: SyncChange,
  action: z.enum(["accept", "discard"]),
});
export type SyncAction = z.infer<typeof SyncAction>;

export const SyncEvent = z.object({
  version: z.string(),
  applicationId: ApplicationId,
  createdAt: z.string(),
  createdBy: z.string(),
  actions: z.array(SyncAction),
});
export type SyncEvent = z.infer<typeof SyncEvent>;
