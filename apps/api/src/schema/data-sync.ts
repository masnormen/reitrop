import { z } from "zod";

export const ChangeType = z.enum(["ADD", "UPDATE", "DELETE"]);

export const SyncChange = z.object({
  id: z.string(),
  field_name: z.string(),
  change_type: ChangeType,
  current_value: z.string().optional(),
  new_value: z.string().optional(),
});

export const SyncApproval = z.object({
  application_name: z.string(),
  changes: z.array(SyncChange),
});

export const SyncData = z.object({
  sync_approval: SyncApproval,
  metadata: z.record(z.string(), z.unknown()),
});

export const SyncResponse = z.object({
  code: z.string(),
  message: z.string(),
  data: SyncData,
});

export const SyncErrorResponse = z.object({
  code: z.string(),
  message: z.string(),
  error: z.string(),
});
