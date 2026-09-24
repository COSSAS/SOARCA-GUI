import react from "@vitejs/plugin-react-swc";
import { execSync } from "child_process";
import fs from "node:fs";
import type { ServerOptions as HttpsServerOptions } from "node:https";
import path from "node:path";
import sbom from "rollup-plugin-sbom";
import { defineConfig, loadEnv } from "vite";
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

const getHttpsOptions = (
  enabled: boolean,
  certFile?: string,
  keyFile?: string,
): HttpsServerOptions | undefined => {
  if (!enabled) {
    return undefined;
  }

  if (!certFile || !keyFile) {
    throw new Error(
      "VITE_HTTPS_CERT_FILE and VITE_HTTPS_KEY_FILE are required when VITE_ENABLE_HTTPS=true.",
    );
  }

  return {
    cert: fs.readFileSync(path.resolve(certFile)),
    key: fs.readFileSync(path.resolve(keyFile)),
  };
};

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  const https = getHttpsOptions(
    env.VITE_ENABLE_HTTPS === "true",
    env.VITE_HTTPS_CERT_FILE,
    env.VITE_HTTPS_KEY_FILE,
  );

  return {
    plugins: [react(), tsconfigPaths(), sbom()],
    define: {
      __APP_VERSION__: JSON.stringify(getAppVersion()),
    },
    server: {
      proxy: {
        "/api": {
          target: env.VITE_BACKEND_URL || "http://localhost:8080",
          secure: env.VITE_VERIFY_SSL === "true",
          rewrite: (requestPath) => requestPath.replace(/^\/api/, ""),
        },
      },
      host: true,
      port: Number(env.VITE_SERVER_PORT) || 5173,
      strictPort: true,
      https,
      watch: {
        usePolling:
          env.VITE_USE_POLLING === "true" || env.VITE_IS_DOCKER === "true",
      },
    },
    preview: {
      host: true,
      port: 4173,
      https,
    },
  };
});
