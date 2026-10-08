import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import preserved from "./continuation-preservation-hashes.json";
import { readLibraryData } from "./library-data";
import { attachDetailedAids } from "../src/lib/detailed-aids";
import type { DetailedWordAid } from "../src/types/quran";
const read = (name: string) => JSON.parse(readFileSync(`src/data/${name}.json`, "utf8"));
const overlay = read("detailed-word-aids-continuation"), library = readLibraryData();
const ayah = library.surahs.find(s => s.surah.number === 3)!.ayahs[7];
test("Continuation covers the next complete verse, with guarded fingerprints and actual context", () => {
  assert.deepEqual(overlay.review.verseKeys, ["3:8"]);
  assert.equal(overlay.review.wordCount, ayah.words.length);
  assert.equal(overlay.review.nextVerseKey, "3:9");
  const rendered = attachDetailedAids(library.surahs, overlay.words as Record<string, DetailedWordAid>);
  const result = rendered.find(s => s.surah.number === 3)!.ayahs[7];
  for (const w of ayah.words) {
    const key = `3:8:${w.position}`, aid = overlay.words[key];
    assert.equal(aid.arabic, w.arabic);
    assert.equal(aid.sourceMeaning, w.banglaMeaning);
    assert.deepEqual(result.words[w.position - 1].detailedAid, aid);
    assert.equal(aid.steps.length, 3);
    assert.ok(read("continuation-segments")[key].length);
    assert.ok(read("word-morphology")[key].aligned);
    assert.ok(aid.sources.some((s: {url: string}) => s.url.includes(`location=(${key})`)));
    for (const context of aid.context) assert.ok(ayah.words.some(w => w.arabic === context.arabic && w.banglaMeaning === context.meaning));
    const stale = structuredClone(library.surahs);
    stale.find(s => s.surah.number === 3)!.ayahs[7].words[w.position - 1].arabic += "x";
    assert.equal(attachDetailedAids(stale, overlay.words).find(s => s.surah.number === 3)!.ayahs[7].words[w.position - 1].detailedAid, undefined);
  }
});
test("The request retains negative scope, distinguishes divine name from verb, and sources familiar terms", () => {
  assert.match(overlay.words["3:8:3"].connection, /لَا تُزِغْ/);
  assert.match(overlay.words["3:8:15"].connection, /আগের শব্দ অনুরোধের ক্রিয়া/);
  assert.match(overlay.words["3:8:15"].connection, /মানুষের দান বা কল্পিত দৃশ্য দিয়ে তুলনা করবেন না/);
  for (const position of [7, 12]) assert.ok(overlay.words[`3:8:${position}`].sources.some((s: {url: string}) => s.url.includes("rekhtadictionary.com")));
});
test("All previously published source verses, morphology, snapshots and full detailed overlays remain byte identical", () => {
  for (const [path, hash] of Object.entries(preserved))
    assert.equal(createHash("sha256").update(readFileSync(path)).digest("hex"), hash, path);
});

test("Reviewed source snapshot matches Arabic, Zakaria 213 and separately attributed word fields", () => {
  const source = read("continuation-source-3-8").verse;
  assert.equal(source.text_uthmani, ayah.arabic);
  assert.equal(source.translations[0].resource_id, 213);
  assert.equal(source.translations[0].text, ayah.banglaTranslation);
  const words = source.words.filter((w: {char_type_name: string}) => w.char_type_name === "word");
  assert.equal(words.length, ayah.words.length);
  for (const word of ayah.words) {
    const original = words[word.position - 1];
    assert.equal(original.text_uthmani, word.arabic);
    assert.equal(original.translation.text, word.banglaMeaning);
    assert.equal(original.transliteration.text, word.transliteration);
  }
  assert.equal(createHash("sha256").update(readFileSync("src/data/continuation-source-3-8.json")).digest("hex"), overlay.review.sourceResponseSha256);
});
