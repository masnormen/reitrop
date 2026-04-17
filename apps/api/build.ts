import * as esbuild from "esbuild";

// import packageJson from "./package.json";
// const externalDeps = Object.keys(packageJson.dependencies).filter(
//   (dep) => !dep.startsWith("@repo/"), // Replace @repo with your workspace prefix
// );

await esbuild.build({
  entryPoints: ["./src/index.ts"],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: "dist/index.js",
  // external: externalDeps,
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
});
