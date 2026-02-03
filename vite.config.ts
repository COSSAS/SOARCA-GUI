import react from "@vitejs/plugin-react-swc";
import sbom from "rollup-plugin-sbom";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths(), sbom()],
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
