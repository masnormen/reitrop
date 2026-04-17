// oxlint-disable typescript/no-explicit-any
import type { OpenAPIHono } from "@hono/zod-openapi";
import type { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import { HTTPException } from "hono/http-exception";

import type { BaseAppEnv } from "@/app/v1.factory";

import { HttpStatusCodes } from "@/lib/status-code";

/**
 * Defines the properties required to construct a new ApiError.
 */
interface ApiErrorProps {
  /**
   * HTTP status code associated with the error.
   * @example 404
   */
  status: ContentfulStatusCode;
  /**
   * A unique error code string that identifies the error type.
   * @example "NOT_FOUND"
   */
  code: string;
  /**
   * A human-readable message describing the error.
   * @example "The requested resource was not found."
   */
  message: string;
  /**
   * An optional cause for the error, which can be any value.
   */
  cause?: unknown;
}

/**
 * Base ApiError class.
 * It extends the native Error class and adds custom properties for status and code.
 * This class is not exported directly but used as the foundation.
 */
class ApiErrorBase extends HTTPException implements ApiErrorProps {
  public readonly code: string;

  /**
   * Creates an instance of ApiError.
   * @param {ApiErrorProps} props - The properties of the API error.
   */
  constructor({ status, code, message, cause }: ApiErrorProps) {
    super(status, { message, cause });
    this.code = code;
    // Maintains the correct prototype chain for 'instanceof' checks.
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = "ApiError";
  }

  toResponseJSON(requestId: string) {
    return {
      ok: false as const,
      errorCode: this.code,
      message: this.message,
      requestId,
    };
  }
}

export type ApiErrorDefinitionFn<P = any> = (payload: P) => Readonly<{
  status: ContentfulStatusCode;
  message: string;
}>;
type ApiErrorDefinition =
  | Readonly<{ status: ContentfulStatusCode; message: string }>
  | ApiErrorDefinitionFn;
type ApiErrorDictionaryType = Readonly<Record<string, ApiErrorDefinition>>;

// --- DICTIONARY-BASED FACTORY IMPLEMENTATION ---

type StaticApiErrorFactory<T extends ApiErrorDictionaryType> = {
  [K in keyof T]: T[K] extends (payload: infer P) => object
    ? (payload: P) => ApiErrorBase // If it's a function, create a method with the same signature.
    : ApiErrorBase; // If it's an object, create a property of type ApiError.
};

function buildTypedApiError<T extends ApiErrorDictionaryType>(
  BaseClass: new (props: ApiErrorProps) => ApiErrorBase,
  definitions: T,
) {
  const factory = {} as any;

  for (const code in definitions) {
    if (Object.hasOwn(definitions, code)) {
      const definition = definitions[code]!;

      if (typeof definition === "function") {
        // For function definitions, create a method on the factory.
        factory[code] = (payload: any) =>
          new BaseClass({
            ...definition(payload),
            code,
          });
      } else {
        // For object definitions, use a getter. This ensures a new Error instance
        // (with a fresh stack trace) is created each time the property is accessed.
        Object.defineProperty(factory, code, {
          get: () =>
            new BaseClass({
              ...definition,
              code,
            }),
          enumerable: true,
        });
      }
    }
  }

  // Merge the static factory methods onto the base class constructor.
  return Object.assign(BaseClass, factory) as (new (props: ApiErrorProps) => ApiErrorBase) &
    StaticApiErrorFactory<T>;
}

// --- USER-DEFINED ERROR DICTIONARY ---

/**
 * Example error dictionary.
 * The `as const` assertion is important for inferring the exact keys and types.
 * The `satisfies` keyword ensures the dictionary conforms to the expected structure.
 */
export const API_ERROR_DICTIONARY = {
  MALFORMED_INPUT: ({ message }: { message: string }) => ({
    status: HttpStatusCodes.BAD_REQUEST,
    message,
  }),
  NOT_FOUND: {
    status: HttpStatusCodes.NOT_FOUND,
    message: "Requested resource was not found.",
  },
  UNAUTHORIZED: ({ message }: { message?: string } = {}) => ({
    status: HttpStatusCodes.UNAUTHORIZED,
    message: message ?? "Missing user session. Please log in!",
  }),
  FORBIDDEN: {
    status: HttpStatusCodes.FORBIDDEN,
    message: "You do not have enough permission to perform this action.",
  },
  INTERNAL_SERVER_ERROR: {
    status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
    message: "Something went wrong. Please try again later.",
  },
  UNSPECIFIED_ERROR: {
    status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
    message: "An unspecified error occurred.",
  },
} as const satisfies ApiErrorDictionaryType;
export type ApiErrorDictionary = typeof API_ERROR_DICTIONARY;
export type ApiErrorCode = keyof typeof API_ERROR_DICTIONARY;

export const API_ERROR_CODES = Object.keys(API_ERROR_DICTIONARY) as ApiErrorCode[];

// --- FINAL EXPORT ---

/**
 * A single constant that can be used for both `new ApiError(...)`
 * and `ApiError.CODE` with full, inferred type safety.
 */
export const ApiError = buildTypedApiError(ApiErrorBase, API_ERROR_DICTIONARY);
export type ApiError = typeof ApiError;

export const setupCatchError = <TApp extends OpenAPIHono<any>>(app: TApp) => {
  (app as unknown as Hono<BaseAppEnv>).notFound((c) => {
    const error404 = ApiError.NOT_FOUND;
    return c.json(error404.toResponseJSON(c.var.requestId), error404.status);
  });

  (app as unknown as Hono<BaseAppEnv>).onError((error, c) => {
    if (error instanceof ApiError) {
      return c.json(error.toResponseJSON(c.var.requestId), error.status);
    }

    if (error instanceof HTTPException) {
      c.var.logger.error(error.message);

      const errorUnspecified = new ApiError({
        status: error.status,
        code: "UNSPECIFIED_HTTP_EXCEPTION",
        message: error.message || "HTTP Exception occurred",
      });
      return c.json(errorUnspecified.toResponseJSON(c.var.requestId), errorUnspecified.status);
    }

    c.var.logger.error(error.message);

    const error500 = ApiError.INTERNAL_SERVER_ERROR;
    return c.json(error500.toResponseJSON(c.var.requestId), error500.status);
  });
};
