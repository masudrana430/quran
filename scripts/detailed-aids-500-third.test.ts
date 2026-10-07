import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readLibraryData } from "./library-data";
import { selectNextFiveHundred } from "./build-detailed-aids-500";
import { attachDetailedAids } from "../src/lib/detailed-aids";
import type { DetailedWordAid } from "../src/types/quran";

const read = (name: string) => JSON.parse(readFileSync(`src/data/${name}.json`, "utf8"));
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const plain = (value: string) => value.replace(/<[^>]*>/g, "").replace(/^['"\s]+|['"\s]+$/g, "");
const library = readLibraryData();
const selected = selectNextFiveHundred(library.surahs, "9:67");
const overlay = read("detailed-word-aids-500-third");
const segments = read("detailed-500-third-segments");
const urdu = read("detailed-500-third-urdu-glosses");
const verification = read("detailed-500-third-source-verification");
const morphology = read("word-morphology");

test("Third detailed batch is exactly 500 canonical ayahs from 9:67 through 14:51", () => {
  assert.equal(selected.length, 500);
  assert.equal(selected[0].verseKey, "9:67");
  assert.equal(selected.at(-1)?.verseKey, "14:51");
  assert.deepEqual(overlay.review.verseKeys, selected.map((ayah) => ayah.verseKey));
  assert.equal(overlay.review.ayahCount, 500);
  assert.equal(overlay.review.wordCount, 8456);
  assert.equal(Object.keys(overlay.words).length, 8456);
  assert.equal(overlay.review.nextVerseKey, "14:52");
});

test("Every third-batch word is source-verified, Corpus-aligned and attached", () => {
  const renderedAyahs = attachDetailedAids(library.surahs, overlay.words as Record<string, DetailedWordAid>).flatMap((surah) => surah.ayahs);
  for (const ayah of selected) {
    const source = verification.verses[ayah.verseKey];
    assert.equal(source.arabic, hash(ayah.arabic));
    assert.equal(source.zakaria213, hash(ayah.banglaTranslation));
    assert.equal(source.wordFields, hash(JSON.stringify(ayah.words.map((word) => [word.arabic, plain(word.banglaMeaning), word.transliteration]))));
    const result = renderedAyahs.find((item) => item.verseKey === ayah.verseKey)!;
    for (const word of ayah.words) {
      const key = `${ayah.verseKey}:${word.position}`, aid = overlay.words[key];
      assert.equal(aid.arabic, word.arabic);
      assert.equal(aid.sourceMeaning, plain(word.banglaMeaning));
      assert.equal(aid.urduMeaning, urdu[key].text || null);
      assert.ok(morphology[key].aligned, key);
      assert.ok(segments[key]?.some((part: { features: string }) => part.features.includes("STEM")), key);
      assert.equal(aid.steps.length, 3);
      assert.ok(aid.sources.some((source: { url: string }) => source.url.includes(`location=(${key})`)));
      assert.ok(aid.sources.some((source: { url: string }) => source.url === `https://quran.com/${ayah.verseKey.replace(":", "/")}?translations=213`));
      assert.deepEqual(result.words[word.position - 1].detailedAid, aid);
    }
  }
});

test("Third batch is distinct, avoids forced etymology and preserves prior overlays", () => {
  const earlier = ["detailed-word-aids", "detailed-word-aids-next-200", "detailed-word-aids-continuation", "detailed-word-aids-500", "detailed-word-aids-500-second"];
  const current = new Set(Object.keys(overlay.words));
  for (const name of earlier) for (const key of Object.keys(read(name).words)) assert.ok(!current.has(key), key);
  assert.equal(hash(readFileSync("src/data/detailed-word-aids-500.json", "utf8")), "5f587164ed09e87bcf753ddc1fe9b5a10ca18a8508034dbed3a4e3792a98e86f");
  assert.equal(hash(readFileSync("src/data/detailed-word-aids-500-second.json", "utf8")), "f478d88fa14f38868d2cfef2a4a59a707b85f65db2231900df6fa4f1a4bb5ac8");
  for (const ayah of selected) for (const word of ayah.words) {
    const aid = overlay.words[`${ayah.verseKey}:${word.position}`];
    if (aid.kind === "meaning" && aid.anchor.startsWith("বাংলা অর্থ ↔ উর্দু"))
      assert.match(aid.connection, /অর্থের তুলনা; ধ্বনি মিলে যাওয়া বা একই উৎসের শব্দ হওয়ার দাবি নয়/);
    if (/(আল্লাহ|রব|তিনি)/.test(ayah.banglaTranslation))
      assert.match(aid.steps[0], /কোনো মানবীয় দৃশ্য বা আকৃতি কল্পনা করবেন না/);
  }
});

test("Detailed progress advances to 1,801 ayahs and 33,475 words", () => {
  const progress = read("progress").detailedAidProgress;
  assert.equal(progress.completedCount, 1801);
  assert.equal(progress.wordCount, 33475);
  assert.equal(progress.nextVerseKey, "14:52");
  assert.equal(new Set(progress.completedVerseKeys).size, 1801);
  assert.equal(progress.lastReview.scope, "9:67–14:51");
  assert.equal(progress.lastReview.sourceVerification, "src/data/detailed-500-third-source-verification.json");
});
