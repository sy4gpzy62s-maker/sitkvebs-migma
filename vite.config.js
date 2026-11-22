import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// base "./" ამუშავებს საიტს GitHub Pages-ზეც და Vercel-ზეც
export default defineConfig({ base: "./", plugins: [react()] });
