// oxlint-disable typescript/no-explicit-any
import { jsonContentRequired } from "stoker/openapi/helpers";
import z from "zod";

import {
  API_ERROR_CODES,
  API_ERROR_DICTIONARY,
  type ApiErrorCode,
  type ApiErrorDictionary,
} from "@/lib/error";

/**
 * @description Create a Zod response schema, wrapping a success response schema
 * @see {@link okRes} for the corresponding response object factory
 */
export const zOkRes = <TDataSchema extends z.ZodType>(dataSchema: TDataSchema) => {
  return z
    .object({
      ok: z.literal(true).describe("Whether the response indicates success"),
      data: dataSchema.describe("The response data"),
      message: z.literal("Success").describe("Human-readable status message of the response"),
      requestId: z.string().describe("Unique ID of the request"),
    })
    .describe("A successful response object");
};

/**
 * @description Create a success response object
 * @see {@link zOkRes} for the corresponding schema factory
 */
export const okRes = <TData extends string | Array<unknown> | Record<string, unknown>>(
  data: TData,
  requestId: string,
) => {
  return {
    ok: true as const,
    data: data,
    message: "Success" as const,
    requestId,
  } satisfies z.infer<ReturnType<typeof zOkRes>["shape"]>;
};

type ErrorSchemaReturnType<TErrorSchema extends z.ZodObject | undefined> =
  TErrorSchema extends z.ZodObject
    ? z.ZodObject<
        {
          ok: z.ZodLiteral<false>;
          requestId: z.ZodString;
        } & TErrorSchema["shape"],
        z.core.$strip
      >
    : z.ZodObject<
        {
          ok: z.ZodLiteral<false>;
          errorCode: z.ZodEnum<z.util.ToEnum<(typeof API_ERROR_CODES)[number]>>;
          message: z.ZodString;
          requestId: z.ZodString;
        },
        z.core.$strip
      >;

const _ErrorSchema = <TErrorSchema extends z.ZodObject | undefined>(
  errorSchema?: TErrorSchema,
): ErrorSchemaReturnType<TErrorSchema> =>
  z
    .object({
      ok: z.literal(false).describe("Whether the response indicates success"),
      ...(errorSchema != null
        ? errorSchema.shape
        : {
            errorCode: z.enum(API_ERROR_CODES).describe("Specific error code"),
            message: z.string().describe("Human-readable error message"),
          }),
      requestId: z.string().describe("Unique ID of the request"),
    })
    .describe("An error response object") as ErrorSchemaReturnType<TErrorSchema>;

export const ErrorSchema = _ErrorSchema();
export type ErrorSchema = z.infer<typeof ErrorSchema>;

type ErrorMessage<TErrorCode extends ApiErrorCode> = ApiErrorDictionary[TErrorCode] extends {
  message: infer M;
}
  ? M extends string
    ? z.ZodLiteral<M>
    : z.ZodString
  : z.ZodString;

export const createSchemaFromErrorCode = <TErrorCode extends ApiErrorCode>(
  errorCode: TErrorCode,
) => {
  // make the ternary typesafe (type-narrowing)
  return _ErrorSchema(
    z.object({
      errorCode: z.literal(errorCode).describe("Specific error code"),
      message: (
        (typeof API_ERROR_DICTIONARY[errorCode] === "function"
          ? z.string()
          : z.literal(API_ERROR_DICTIONARY[errorCode].message)) as ErrorMessage<TErrorCode>
      ).describe("Human-readable error message"),
    }),
  );
};

export const errorContent = <TErrorCode extends ApiErrorCode[]>(_errors: TErrorCode) => {
  const errors = Array.from(new Set([..._errors, "INTERNAL_SERVER_ERROR"])) as TErrorCode;

  const responses = {} as {
    [statusCode: number]: ReturnType<typeof jsonContentRequired>;
  };

  for (const errCode of errors) {
    const errDef = API_ERROR_DICTIONARY[errCode];
    const error = typeof errDef === "function" ? errDef({ message: "" }) : errDef;
    responses[error.status] = jsonContentRequired(createSchemaFromErrorCode(errCode), errCode);
  }

  return responses as {
    [ErrorCode in TErrorCode[number] as ErrorCode extends ApiErrorCode
      ? ApiErrorDictionary[ErrorCode] extends {
          status: infer Status;
        }
        ? Status extends number
          ? Status
          : never
        : ApiErrorDictionary[ErrorCode] extends (args: any) => {
              status: infer S;
            }
          ? S extends number
            ? S
            : never
          : never
      : never]: ReturnType<
      typeof jsonContentRequired<ReturnType<typeof createSchemaFromErrorCode<ErrorCode>>>
    >;
  };
};
