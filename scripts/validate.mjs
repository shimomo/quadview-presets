// Checks that every preset in a directory is one QuadView accepts.
// Usage: node scripts/validate.mjs [dir=presets]
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { parsePreset } from "./preset-rules.mjs";

const dir = process.argv[2] ?? "presets";
const files = readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "index.json");
let failed = 0;
const kinds = new Map();
for (const file of files.sort()) {
  let result;
  try {
    result = parsePreset(JSON.parse(readFileSync(join(dir, file), "utf8")));
  } catch (e) {
    result = { ok: false, error: `JSON を読めません: ${e.message}` };
  }
  if (result.ok) {
    kinds.set(file, result.preset.kind);
    console.log(`ok   ${file} (${result.preset.kind}, ${result.preset.items.length} items)`);
  } else {
    failed++;
    console.error(`FAIL ${file}: ${result.error}`);
  }
}
// index.json lists every preset (name, file, kind, description); the README is made from it.
const fail = (message) => {
  failed++;
  console.error(`FAIL index.json: ${message}`);
};
if (existsSync(join(dir, "index.json"))) {
  let index = null;
  try {
    index = JSON.parse(readFileSync(join(dir, "index.json"), "utf8"));
  } catch (e) {
    fail(`JSON を読めません: ${e.message}`);
  }
  if (index !== null && !Array.isArray(index)) fail("配列ではありません");
  if (Array.isArray(index)) {
    const listed = new Set();
    for (const entry of index) {
      if (typeof entry?.name !== "string" || typeof entry?.description !== "string") {
        fail(`name と description が要ります: ${JSON.stringify(entry)}`);
        continue;
      }
      listed.add(entry.file);
      if (!files.includes(entry.file)) fail(`ありません: ${entry.file}`);
      else if (kinds.has(entry.file) && kinds.get(entry.file) !== entry.kind) {
        fail(`kind が違います: ${entry.file} は ${kinds.get(entry.file)}`);
      }
    }
    for (const file of files) if (!listed.has(file)) fail(`載っていません: ${file}`);
  }
}
process.exit(failed ? 1 : 0);
