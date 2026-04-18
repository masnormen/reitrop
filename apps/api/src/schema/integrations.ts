import { z } from "zod";

export const SyncStatus = z.enum(["synced", "syncing", "conflict", "error"]);
export type SyncStatus = z.infer<typeof SyncStatus>;

export const Integration = z.object({
  id: z.string(),
  name: z.string(),
  emoji: z.string(),
  status: SyncStatus,
  lastSyncedAt: z.string(),
  version: z.string(),
});
export type Integration = z.infer<typeof Integration>;
