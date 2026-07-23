import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    // Force re-bundle deps on every dev server start — prevents stale cache
    force: true,
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  server: {
    port: 3000,
    // Disable browser-side HMR overlay (we handle errors in ErrorBoundary)
    hmr: { overlay: true },
    // Force no-cache headers in dev so browser never serves stale files
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma":        "no-cache",
      "Expires":       "0",
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
    // Watch all source files including data files
    watch: {
      usePolling: false,
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  // Ensure build output has content-hashed filenames — no stale prod cache
  build: {
    rollupOptions: {
      output: {
        entryFileNames:  "assets/[name]-[hash].js",
        chunkFileNames:  "assets/[name]-[hash].js",
        assetFileNames:  "assets/[name]-[hash][extname]",
      },
    },
  },
});
