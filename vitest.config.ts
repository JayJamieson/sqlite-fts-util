import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    dir: "./src",
    testTimeout: 30000,
  },
});
