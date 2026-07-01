import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" -> relative asset paths, so the build works at a root domain
// (divvy.pages.dev) AND under a subpath (albertngo1.github.io/divvy/) unchanged.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
