import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    // The app bundles export/report libraries; raise warning threshold to avoid false failure signals.
    chunkSizeWarningLimit: 1500
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
