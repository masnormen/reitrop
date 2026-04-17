import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import dns from "dns";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

import "./src/env";

dns.setDefaultResultOrder("ipv4first");

export default defineConfig({
  server: {
    port: 3000,
  },
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    // oxlint-disable-next-line node/no-process-env
    __BUILD_SHA__: JSON.stringify(process.env.VITE_BUILD_SHA || "dev"),
  },
  resolve: {
    tsconfigPaths: true
  },
  plugins: [
    tanstackStart(),
    nitro(),
    viteReact(),
    babel({
      presets: [reactCompilerPreset()],
    }),
    tailwindcss(),
  ],
});
