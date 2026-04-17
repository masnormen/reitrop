// oxlint-disable node/no-process-env
const isProduction = process.env.NODE_ENV === "production";
const isCi = process.env.CI !== undefined;

if (!isCi && !isProduction) {
  try {
    require("husky").default();
  } catch (e) {
    // @ts-ignore
    if (e.code !== "MODULE_NOT_FOUND") throw e;
  }
}
