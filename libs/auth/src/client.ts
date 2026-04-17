/**
 * Re-exports symbols that appear in the inferred type of `createAuthClient` so declaration emit
 * (TS2883 / “cannot be named without a reference …”) can serialize `.d.ts` output for this package.
 *
 * **Temporary:** remove when better-auth’s published types no longer force consumers to anchor these
 * names (see issues below).
 *
 * @see https://github.com/better-auth/better-auth/issues/4250
 * @see https://github.com/better-auth/better-auth/issues/8623
 */
export type { AuthQueryAtom, InferSignUpEmailCtx, InferUserUpdateCtx } from "better-auth/client";
export type { FieldAttributeToObject } from "better-auth/db";

import type { BetterAuthClientOptions } from "better-auth";

import { adminClient } from "better-auth/client/plugins";
import { createAuthClient as createClient } from "better-auth/react";

export interface AuthClientOptions extends Omit<BetterAuthClientOptions, "baseURL"> {
  baseUrl: string;
}

export const createAuthClient = ({ ...opts }: AuthClientOptions) => {
  return createClient({
    plugins: [adminClient()],
    ...opts,
    baseURL: opts.baseUrl,
  });
};
