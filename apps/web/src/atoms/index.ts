import { atomWithStorage } from "jotai/utils";

export const SESSION_JWT_STORAGE_KEY = "session";
export const sessionJwtAtom = atomWithStorage<string | null>(SESSION_JWT_STORAGE_KEY, null);
