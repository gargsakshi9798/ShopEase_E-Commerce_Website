/**
 * runAllSeeders.js — Run ALL 11 category seed files sequentially
 *
 * Usage:
 *   node server/seeders/runAllSeeders.js
 *
 * This script runs each seed file one by one.
 * Each seed deletes existing products for its category before inserting.
 * Total: 11 categories × 100 products = 1100 products
 */

const { execSync } = require("child_process");
const path = require("path");

const seeders = [
  "seedFashion.js",
  "seedElectronics.js",
  "seedMobiles.js",
  "seedHomeKitchen.js",
  "seedAppliances.js",
  "seedBeauty.js",
  "seedSports.js",
  "seedBooks.js",
  "seedToys.js",
  "seedGrocery.js",
  "seedAutomotive.js",
];

const dir = path.join(__dirname);

console.log("╔══════════════════════════════════════════════════╗");
console.log("║       ShopEase — Full Product Seed Runner        ║");
console.log("║  11 Categories × 100 Products = 1100 Total       ║");
console.log("╚══════════════════════════════════════════════════╝\n");

let success = 0;
let failed  = 0;

for (const file of seeders) {
  const filePath = path.join(dir, file);
  console.log(`\n▶ Running ${file}...`);
  console.log("─".repeat(50));
  try {
    execSync(`node "${filePath}"`, { stdio: "inherit" });
    console.log(`✅ ${file} — DONE`);
    success++;
  } catch (err) {
    console.error(`❌ ${file} — FAILED: ${err.message}`);
    failed++;
  }
}

console.log("\n╔══════════════════════════════════════════════════╗");
console.log(`║  ✅ Success: ${success}/11   ❌ Failed: ${failed}/11              ║`);
console.log("╚══════════════════════════════════════════════════╝");

if (failed > 0) {
  console.log("\n⚠️  Some seeders failed. Check errors above.");
  process.exit(1);
} else {
  console.log("\n🎉 All 1100 products seeded successfully!");
  process.exit(0);
}
