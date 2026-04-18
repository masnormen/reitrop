import { pinoLogger as logger } from "hono-pino";
import pino from "pino";
import pinoPretty from "pino-pretty";

const stream = pinoPretty({
  colorize: true,
  colorizeObjects: true,
  messageKey: "message",
});

export const pinoInstance = pino(
  {
    level: "debug",
    messageKey: "message",
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => {
        return {
          level: label,
        };
      },
    },
  },
  stream,
);

export function pinoLogger() {
  return logger({
    pino: pinoInstance,
    http: {
      referRequestIdKey: "requestId",
      onResMessage: (c) => `[HTTP] ${c.req.method} ${c.req.path} -> ${c.res.status}`,
      onReqBindings: (c) => ({
        req: {
          method: c.req.method,
          url: c.req.path,
        },
      }),
      onResBindings: (c) => ({
        res: {
          status: c.res.status,
        },
      }),
      onResLevel: (c) => {
        if (c.res.status >= 500) return "error";
        if (c.res.status >= 400) return "warn";
        return "info";
      },
    },
  });
}
