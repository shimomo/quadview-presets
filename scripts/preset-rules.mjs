// The preset rules of QuadView, copied from shimomo/quadview site/logic.js
// (parsePreset and its helpers). Keep in step when QuadView's preset format changes.

// --- presets ----------------------------------------------------------------------------
// A preset is JSON someone wrote: a list of videos, or channels plus rules that sort their
// streams into items. It never holds data fetched from the YouTube API.

// Upload pages (50 each) a channel may ask to be read: 10 pages are 20 units a search.
export const MAX_PAGES = 10;
const VIDEO_ID_FORMAT = /^[\w-]{11}$/;
const CHANNEL_ID_FORMAT = /^UC[\w-]{22}$/;

class PresetError extends Error {}

const isObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
const isStringArray = (v) => Array.isArray(v) && v.every((s) => typeof s === "string");

function regex(source, where) {
  if (typeof source !== "string") throw new PresetError(`${where} は文字列にしてください`);
  try {
    return new RegExp(source, "iu");
  } catch {
    throw new PresetError(`${where} の正規表現が不正です: ${source}`);
  }
}

function parseSearch(search, labels) {
  if (!isObject(search)) throw new PresetError("search の形が違います");
  if (!Array.isArray(search.channels) || search.channels.length === 0) {
    throw new PresetError("search.channels がありません");
  }
  const channels = search.channels.map((ch) => {
    if (!isObject(ch) || !CHANNEL_ID_FORMAT.test(ch.id ?? "")) {
      throw new PresetError(`チャンネル ID が不正です: ${ch?.id}`);
    }
    if (ch.default != null && !labels.has(ch.default)) {
      throw new PresetError(`default が items にありません: ${ch.default}`);
    }
    if (ch.priority != null && !Number.isFinite(ch.priority)) {
      throw new PresetError(`priority は数にしてください: ${ch.id}`);
    }
    const pages = ch.pages ?? 1;
    if (!Number.isInteger(pages) || pages < 1 || pages > MAX_PAGES) {
      throw new PresetError(`pages は 1〜${MAX_PAGES} の整数にしてください: ${ch.id}`);
    }
    return { id: ch.id, default: ch.default ?? null, priority: ch.priority ?? 0, pages };
  });
  const exclude = search.exclude ?? [];
  if (!isStringArray(exclude)) throw new PresetError("search.exclude は文字列の配列にしてください");
  const strip = search.strip ?? [];
  if (!Array.isArray(strip)) throw new PresetError("search.strip は配列にしてください");
  const duplicates = search.duplicates ?? "first";
  if (duplicates !== "first" && duplicates !== "all") {
    throw new PresetError(`search.duplicates は first か all です: ${duplicates}`);
  }
  return {
    channels,
    exclude,
    strip: strip.map((s, i) => regex(s, `search.strip[${i}]`)),
    after: search.after == null ? null : regex(search.after, "search.after"),
    duplicates,
  };
}

export function parsePreset(json) {
  try {
    if (!isObject(json)) throw new PresetError("JSON のオブジェクトではありません");
    if (typeof json.name !== "string" || !json.name) throw new PresetError("name がありません");
    if (!Array.isArray(json.items)) throw new PresetError("items がありません");
    const kind = json.search == null ? "videos" : "channels";
    const items = json.items.map((item) => {
      if (!isObject(item) || typeof item.label !== "string" || !item.label) {
        throw new PresetError("label のない候補があります");
      }
      if (kind === "videos") {
        if (!VIDEO_ID_FORMAT.test(item.video_id ?? "")) {
          throw new PresetError(`動画 ID が不正です: ${item.label}`);
        }
        return { label: item.label, videoId: item.video_id, title: item.title ?? "" };
      }
      const aliases = item.aliases ?? [item.label];
      if (!isStringArray(aliases)) throw new PresetError(`aliases が不正です: ${item.label}`);
      if (item.auto != null && typeof item.auto !== "boolean") {
        throw new PresetError(`auto は true か false にしてください: ${item.label}`);
      }
      return { label: item.label, aliases, auto: item.auto ?? true };
    });
    if (json.timezone != null) {
      try {
        new Intl.DateTimeFormat("en-CA", { timeZone: json.timezone });
      } catch {
        throw new PresetError(`timezone が不正です: ${json.timezone}`);
      }
    }
    const preset = {
      name: json.name,
      kind,
      timezone: typeof json.timezone === "string" ? json.timezone : null,
      items,
    };
    if (kind === "channels") {
      preset.search = parseSearch(json.search, new Set(items.map((i) => i.label)));
    }
    return { ok: true, preset };
  } catch (e) {
    if (e instanceof PresetError) return { ok: false, error: e.message };
    throw e;
  }
}
