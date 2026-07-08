/**
 * printful-sync.ts
 * ----------------
 * Pulls sync variants from your Printful store and writes the
 * SKU → sync_variant_id map into src/config/merch.config.ts.
 *
 * Run after creating the 3 products (6 colorways) in the Printful
 * dashboard. Matching works two ways:
 *   1. Best: set each variant's SKU in Printful to our SKU scheme
 *      (KC-SHORTS-BLK-M etc.) — exact match.
 *   2. Fallback: fuzzy match on variant name (product keyword + color + size).
 *
 * Usage:  npm run printful:sync
 * Env:    PRINTFUL_API_KEY, PRINTFUL_STORE_ID (in .env.local)
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const BASE = "https://api.printful.com";
const CONFIG_PATH = resolve(__dirname, "../src/config/merch.config.ts");

const KEYWORDS: Record<string, string[]> = {
  SHORTS: ["short"],
  CROP: ["crop"],
  SWEATS: ["sweatpant", "jogger", "fleece pant"],
};
const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

async function pf(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
      ...(process.env.PRINTFUL_STORE_ID ? { "X-PF-Store-Id": process.env.PRINTFUL_STORE_ID } : {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Printful ${path}: ${JSON.stringify(json?.error ?? json)}`);
  return json.result;
}

function inferSku(variantName: string): string | null {
  const n = variantName.toLowerCase();
  const code = Object.keys(KEYWORDS).find((c) => KEYWORDS[c].some((k) => n.includes(k)));
  if (!code) return null;
  const color = n.includes("white") ? "WHT" : n.includes("black") ? "BLK" : null;
  if (!color) return null;
  // Sizes usually appear at the end after a slash or space: "... / M"
  const size = SIZES.slice()
    .sort((a, b) => b.length - a.length)
    .find((s) => new RegExp(`[\\s/]${s}$`, "i").test(variantName.trim()));
  if (!size) return null;
  return `KC-${code}-${color}-${size.toUpperCase()}`;
}

async function main() {
  if (!process.env.PRINTFUL_API_KEY) {
    console.error("Set PRINTFUL_API_KEY (and PRINTFUL_STORE_ID) in your environment / .env.local");
    process.exit(1);
  }

  const products: { id: number; name: string }[] = await pf("/store/products?limit=100");
  console.log(`Found ${products.length} sync products in store.`);

  const map: Record<string, number> = {};
  for (const p of products) {
    const detail = await pf(`/store/products/${p.id}`);
    for (const v of detail.sync_variants) {
      // Prefer explicit SKU set in Printful, fall back to name inference
      const sku = v.sku && v.sku.startsWith("KC-") ? v.sku : inferSku(v.name ?? "");
      if (sku) {
        map[sku] = v.id;
        console.log(`  ${sku}  →  ${v.id}   (${v.name})`);
      }
    }
  }

  if (Object.keys(map).length === 0) {
    console.error("\nNo variants matched. Either set SKUs in Printful (KC-SHORTS-BLK-M style) or check product names contain 'shorts' / 'crop' / 'sweatpants' plus Black/White.");
    process.exit(1);
  }

  const config = readFileSync(CONFIG_PATH, "utf8");
  const generated = Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([sku, id]) => `  "${sku}": ${id},`)
    .join("\n");

  const updated = config.replace(
    /\/\/ BEGIN GENERATED[\s\S]*?\/\/ END GENERATED/,
    `// BEGIN GENERATED — do not edit by hand, run: npm run printful:sync\n${generated}\n  // END GENERATED`
  );
  writeFileSync(CONFIG_PATH, updated);
  console.log(`\n✅ Wrote ${Object.keys(map).length} variant mappings to merch.config.ts`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
