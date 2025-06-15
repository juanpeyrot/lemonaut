import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      reporter: ["text", "html"],
      exclude: ["**/test/**", "**/types/**", "**/index.ts", "vitest.config.ts"],
    },
  },
});