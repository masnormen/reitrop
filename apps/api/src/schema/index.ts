import { z } from "zod";

export const User = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  role: z.string(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type User = z.infer<typeof User>;

export const Session = z.object({
  id: z.string(),
  user: User,
  createdAt: z.string(),
  expiresAt: z.string(),
});
export type Session = z.infer<typeof Session>;
