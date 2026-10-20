import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served from https://katie0014.github.io/Planda/
export default defineConfig({
  base: "/Planda/",
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:8787" } },
});
