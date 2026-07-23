/**
 * clear-cache.js
 *
 * Removes all Vite / browser-cacheable artifacts so the next
 * `npm run dev` starts completely fresh:
 *
 *   node_modules/.vite/          — Vite dependency pre-bundle cache
 *   node_modules/.cache/         — any other tooling cache
 *   dist/                        — previous production build
 *
 * Usage:
 *   node scripts/clear-cache.js          (standalone)
 *   npm run cache:clear                  (via npm script)
 *   npm run dev:clean                    (clear + restart dev server)
 */

import { rmSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, ".."); // project root (client/)

const targets = [
  resolve(root, "node_modules", ".vite"),
  resolve(root, "node_modules", ".cache"),
  resolve(root, "dist"),
];

let cleared = 0;

for (const target of targets) {
  if (existsSync(target)) {
    try {
      rmSync(target, { recursive: true, force: true });
      console.log(`✅  Cleared: ${target.replace(root, ".")}`);
      cleared++;
    } catch (err) {
      console.error(`❌  Failed to clear ${target}: ${err.message}`);
    }
  } else {
    console.log(`⏭   Not found (skipped): ${target.replace(root, ".")}`);
  }
}

console.log(`\n🧹  Cache clear complete — ${cleared} director${cleared === 1 ? "y" : "ies"} removed.`);
console.log("🚀  Run  npm run dev  to start fresh.\n");
