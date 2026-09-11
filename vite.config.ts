import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5200,
  },
  build: {
    target: "esnext",
    // Vite 8 minifies with Oxc by default (esbuild was dropped from Vite's
    // dependency tree). Do not set `minify: "esbuild"` — it is deprecated and
    // would require adding esbuild as an explicit devDependency.
    chunkSizeWarningLimit: 1200,
  },
});
