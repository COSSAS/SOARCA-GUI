import react from "@vitejs/plugin-react-swc";
import { execSync } from "child_process";
import sbom from "rollup-plugin-sbom";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Resolve the app version.
 */
const getAppVersion = (): string => {
  // Explicit env var (ideal for CI and Docker builds)
  if (process.env.VITE_APP_VERSION) {
    return process.env.VITE_APP_VERSION;
  }

  // Git tag (works locally; fails in Docker where .git is excluded)
  try {
    const tag = execSync("git describe --tags --abbrev=0", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
    if (tag) return tag;
  } catch {
    // .git not available — continue to fallback
  }
  // Fallback for local development without .git or CI/CD environment
  return "development";
};

export default defineConfig({
  plugins: [react(), tsconfigPaths(), sbom()],
  define: {
    __APP_VERSION__: JSON.stringify(getAppVersion()),
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_BACKEND_URL || "http://localhost:8080",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    host: true,
    port: Number(process.env.VITE_SERVER_PORT) || 5173,
    strictPort: true, // Fail if port is already in use, as the docker container won't be able to use a different one
    watch: {
      usePolling: true,
    },
  },
  preview: {
    host: true,
    port: 4173,
  },
});
