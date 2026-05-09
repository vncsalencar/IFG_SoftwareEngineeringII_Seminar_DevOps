import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      thresholds: {
        lines: 75,
        branches: 75,
        functions: 75,
        statements: 75,
      },
      exclude: [
        "coverage/**",
        "dist/**",
        "**/__tests__/**",
        "eslint.config.js",
        "src/main.tsx",
        "src/test-setup.ts",
        "src/types.ts",
        "**/*.config.ts",
      ],
    },
  },
});
