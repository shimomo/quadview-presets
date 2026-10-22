import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const CH = `UC${"x".repeat(22)}`;
const GOOD_VIDEOS = { name: "動画", items: [{ label: "一", video_id: "aaaaaaaaaaa" }] };
const GOOD_CHANNELS = {
  name: "会場",
  search: { channels: [{ id: CH, default: "西" }], strip: ["主催"], after: "\\bin\\b" },
  items: [{ label: "西", aliases: ["西"] }],
};

function run(files) {
  const dir = mkdtempSync(join(tmpdir(), "presets-"));
  for (const [name, json] of Object.entries(files)) {
    writeFileSync(join(dir, name), typeof json === "string" ? json : JSON.stringify(json));
  }
  const r = spawnSync(process.execPath, ["scripts/validate.mjs", dir], { encoding: "utf8" });
  return { code: r.status, out: r.stdout + r.stderr };
}

test("valid presets pass", () => {
  const r = run({ "v.json": GOOD_VIDEOS, "c.json": GOOD_CHANNELS });
  assert.equal(r.code, 0, r.out);
});

test("a default that is not a label fails, naming the file", () => {
  const bad = { ...GOOD_CHANNELS, search: { ...GOOD_CHANNELS.search, channels: [{ id: CH, default: "東" }] } };
  const r = run({ "ok.json": GOOD_VIDEOS, "bad-default.json": bad });
  assert.equal(r.code, 1);
  assert.match(r.out, /bad-default\.json/);
});

test("a regex that does not compile fails", () => {
  const bad = { ...GOOD_CHANNELS, search: { ...GOOD_CHANNELS.search, strip: ["("] } };
  const r = run({ "bad-regex.json": bad });
  assert.equal(r.code, 1);
  assert.match(r.out, /bad-regex\.json/);
});

test("a 12-character video id fails", () => {
  const r = run({ "bad-id.json": { name: "x", items: [{ label: "a", video_id: "aaaaaaaaaaaa" }] } });
  assert.equal(r.code, 1);
  assert.match(r.out, /bad-id\.json/);
});

test("broken JSON fails", () => {
  const r = run({ "broken.json": "{not json" });
  assert.equal(r.code, 1);
  assert.match(r.out, /broken\.json/);
});

const INDEX = (files) => files.map((file) => ({ name: file, file, kind: "videos", description: "" }));

test("an index naming every preset passes", () => {
  const r = run({ "v.json": GOOD_VIDEOS, "index.json": INDEX(["v.json"]) });
  assert.equal(r.code, 0, r.out);
});

test("an index naming a missing file fails", () => {
  const r = run({ "v.json": GOOD_VIDEOS, "index.json": INDEX(["v.json", "gone.json"]) });
  assert.equal(r.code, 1);
  assert.match(r.out, /gone\.json/);
});

test("a preset missing from the index fails", () => {
  const r = run({ "v.json": GOOD_VIDEOS, "c.json": GOOD_CHANNELS, "index.json": INDEX(["v.json"]) });
  assert.equal(r.code, 1);
  assert.match(r.out, /c\.json/);
});

test("an index whose kind differs from the preset fails", () => {
  const index = [{ name: "c", file: "c.json", kind: "videos", description: "" }];
  const r = run({ "c.json": GOOD_CHANNELS, "index.json": index });
  assert.equal(r.code, 1);
  assert.match(r.out, /c\.json/);
});
