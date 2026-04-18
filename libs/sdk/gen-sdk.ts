import { createClient } from "@hey-api/openapi-ts";
import { kebabCase } from "es-toolkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { env } from "./env";

/**
 * __dirname compat for ES modules
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Start generation
 */

const OPENAPI_URL = env.OPENAPI_URL;
const LOCAL_OPENAPI_PATH = path.join(__dirname, "openapi.json");

// Read from local file if no URL is provided

const input = await (async () => {
  if (!OPENAPI_URL) {
    if (fs.existsSync(LOCAL_OPENAPI_PATH)) {
      console.log("Using local openapi.json file");
      return fs.readFileSync(LOCAL_OPENAPI_PATH, "utf-8");
    }
    throw new Error("No OPENAPI_URL provided and no local openapi.json file found!");
  }

  return OPENAPI_URL;
})();

const isWatch = process.argv.includes("--watch") || process.argv.includes("-w");

const genSdk = async () => {
  return createClient({
    logs: {
      file: false,
    },
    input: {
      path: input,
      watch: isWatch ? 20 * 1000 : false,
    },
    output: {
      path: `${__dirname}/src`,
      clean: true,
      postProcess: ["oxfmt", "oxlint"],
      fileName: {
        name: (name) => kebabCase(name),
      },
      indexFile: false,
    },
    plugins: [
      { name: "@hey-api/typescript", enums: false },
      {
        name: "@hey-api/sdk",
        operations: {
          strategy: "byTags",
          containerName: (name) => `${name}Service`,
          methods: "static",
        },
        validator: {
          request: true,
        },
        client: true,
      },
      { name: "@hey-api/client-axios", baseUrl: false },
      { name: "zod" },
      {
        name: "@tanstack/react-query",
        queryKeys: {
          tags: true,
        },
      },
    ],
  });
};

let attempts = 0;
const maxAttempts = 5;

for (let i = 0; i < maxAttempts; i++) {
  try {
    setTimeout(async () => {
      await genSdk();

      // Save to local file if input was from URL
      if (OPENAPI_URL) {
        const res = await fetch(OPENAPI_URL);
        const spec = await res.text();
        console.log(`Saving OpenAPI spec to ${LOCAL_OPENAPI_PATH}`);
        fs.writeFileSync(LOCAL_OPENAPI_PATH, spec, "utf-8");
      }
    }, 3000);
    break; // Exit the loop if successful
  } catch {
    attempts++;
    if (attempts >= maxAttempts) {
      console.error("Max retry attempts reached. Could not fetch OpenAPI spec");
      process.exit(1);
    } else {
      console.warn(
        `Failed to fetch OpenAPI spec. Retrying in 2 seconds... (${attempts}/${maxAttempts})`,
      );
    }
  }
}
