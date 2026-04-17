// oxlint-disable typescript/no-explicit-any
import type { Hono } from "hono";

export type ExtractEnv<T> = T extends Hono<infer Env, any, any> ? Env : never;
