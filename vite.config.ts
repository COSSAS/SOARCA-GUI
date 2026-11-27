import react from "@vitejs/plugin-react-swc";
import { execSync } from "child_process";
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import type { ServerOptions as HttpsServerOptions } from "node:https";
import path from "node:path";
import sbom from "rollup-plugin-sbom";
import { defineConfig, loadEnv, type Connect, type Plugin } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { createStoreApi, isStoreRoute } from "./src/mock/storeApi";
import type { Playbook, Variables } from "./src/types";

// Serves config/auth-config.json at runtime, like nginx does in production,
// so provider changes need no rebuild.
const authConfig = (): Plugin => {
  const serve: Connect.NextHandleFunction = (req, res, next) => {
    if (req.url?.split("?")[0] !== "/auth-config.json") return next();
    res.setHeader("Cache-Control", "no-store");
    const file = path.resolve("config/auth-config.json");
    if (!fs.existsSync(file)) {
      res.statusCode = 404;
      res.end();
      return;
    }
    res.setHeader("Content-Type", "application/json");
    res.end(fs.readFileSync(file));
  };
  return {
    name: "soarca-auth-config",
    configureServer: (server) => void server.middlewares.use(serve),
    configurePreviewServer: (server) => void server.middlewares.use(serve),
  };
};

/**
 * Answers the secret, variable and mapping routes that SOARCA does not have
 * yet (VITE_MOCK_STORE_API=true). Other /api requests still go to SOARCA.
 */
const mockStoreApi = (backendUrl: string, verifySsl: boolean): Plugin => {
  const loadPlaybookVariables = (id: string, authorization?: string) =>
    new Promise<Variables | null>((resolve) => {
      const url = new URL(
        `playbook/${encodeURIComponent(id)}`,
        `${backendUrl.replace(/\/$/, "")}/`,
      );
      const request = (url.protocol === "https:" ? https : http).get(
        url,
        {
          headers: authorization ? { Authorization: authorization } : {},
          rejectUnauthorized: verifySsl,
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            if (res.statusCode !== 200) return resolve(null);
            try {
              const playbook = JSON.parse(data) as Playbook;
              resolve(playbook.playbook_variables ?? {});
            } catch {
              resolve(null);
            }
          });
        },
      );
      request.on("error", () => resolve(null));
    });

  const store = createStoreApi({ loadPlaybookVariables });

  const readBody = (req: Connect.IncomingMessage) =>
    new Promise<unknown>((resolve, reject) => {
      let data = "";
      req.on("data", (chunk) => (data += chunk));
      req.on("error", reject);
      req.on("end", () => {
        try {
          resolve(data ? JSON.parse(data) : undefined);
        } catch (err) {
          reject(err);
        }
      });
    });

  const serve: Connect.NextHandleFunction = (req, res, next) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (!url.pathname.startsWith("/api/")) return next();
    const path = url.pathname.slice("/api".length);
    const method = req.method ?? "GET";
    const deleted = method === "DELETE" && /^\/playbook\/([^/]+)$/.exec(path);
    if (deleted)
      res.on("finish", () => {
        if (res.statusCode < 300)
          store.forgetPlaybook(decodeURIComponent(deleted[1]));
      });
    if (!isStoreRoute(path)) return next();
    const body = ["POST", "PUT", "PATCH"].includes(method)
      ? readBody(req)
      : Promise.resolve(undefined);
    void body
      .then((parsed) =>
        store.handle({
          method,
          path,
          query: url.searchParams,
          body: parsed,
          authorization: req.headers.authorization,
        }),
      )
      .then(async (answer) => {
        const reply = answer ?? {
          status: 404,
          body: {
            status: 404,
            "original-call": url.pathname,
            message: "Not found.",
          },
        };
        // A short delay makes loading states visible, as with a real backend.
        await new Promise((r) => setTimeout(r, 250));
        res.statusCode = reply.status;
        if (reply.body === undefined) return res.end();
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(reply.body));
      })
      .catch((err: unknown) => {
        console.error("Mock store API failed", err);
        if (res.headersSent) return res.end();
        const status = err instanceof SyntaxError ? 400 : 500;
        res.statusCode = status;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            status,
            "original-call": url.pathname,
            message:
              status === 400
                ? "The request body must be valid JSON."
                : "The mock store API failed.",
          }),
        );
      });
  };

  return {
    name: "soarca-mock-store-api",
    configureServer: (server) => void server.middlewares.use(serve),
  };
};

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
    plugins: [
      react(),
      tsconfigPaths(),
      sbom(),
      authConfig(),
      env.VITE_MOCK_STORE_API === "true" &&
        mockStoreApi(
          env.VITE_BACKEND_URL || "http://localhost:8080",
          env.VITE_VERIFY_SSL === "true",
        ),
    ],
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
