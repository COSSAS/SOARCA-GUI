import react from "@vitejs/plugin-react-swc";
import { execSync } from "child_process";
import sbom from "rollup-plugin-sbom";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Get version from git describe --tags (tag name only, without hash/dirty suffix)
const getGitVersion = () => {
  try {
    // Try to get the most recent tag
    const tag = execSync("git describe --tags --abbrev=0", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"], // Suppress stderr
    }).trim();
    return tag;
  } catch {
    // If no tags exist, fall back to development
    return "development";
  }
};

export default defineConfig({
  plugins: [react(), tsconfigPaths(), sbom()],
  define: {
    __APP_VERSION__: JSON.stringify(getGitVersion()),
  },
  server: {
    host: true,
    port: 3000,
    strictPort: true, // Fail if port is already in use, as the docker container won't be able to use a different one
    watch: {
      usePolling: true,
    },
  },
  preview: {
    host: true,
    port: 3000,
  },
});
