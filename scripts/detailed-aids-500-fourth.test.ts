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
const selected = selectNextFiveHundred(library.surahs, "14:52");
const overlay = read("detailed-word-aids-500-fourth");
const segments = read("detailed-500-fourth-segments");
const urdu = read("detailed-500-fourth-urdu-glosses");
const verification = read("detailed-500-fourth-source-verification");
const morphology = read("word-morphology");

test("Fourth detailed batch is exactly 500 canonical ayahs from 14:52 through 19:51", () => {
  assert.equal(selected.length, 500);
  assert.equal(selected[0].verseKey, "14:52");
  assert.equal(selected.at(-1)?.verseKey, "19:51");
  assert.deepEqual(overlay.review.verseKeys, selected.map((ayah) => ayah.verseKey));
  assert.equal(overlay.review.ayahCount, 500);
  assert.equal(overlay.review.wordCount, 6168);
  assert.equal(Object.keys(overlay.words).length, 6168);
  assert.equal(overlay.review.nextVerseKey, "19:52");
});

test("Every fourth-batch word is source-verified, Corpus-aligned and attached", () => {
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

test("Fourth batch is distinct, avoids forced etymology and preserves prior overlays", () => {
  const earlier = ["detailed-word-aids", "detailed-word-aids-next-200", "detailed-word-aids-continuation", "detailed-word-aids-500", "detailed-word-aids-500-second", "detailed-word-aids-500-third"];
  const current = new Set(Object.keys(overlay.words));
  for (const name of earlier) for (const key of Object.keys(read(name).words)) assert.ok(!current.has(key), key);
  assert.equal(hash(readFileSync("src/data/detailed-word-aids-500-third.json", "utf8")), "c66e17e76288c58dba49cb2235d62a36b169a6964517e9eeec0972108135270c");
  for (const ayah of selected) for (const word of ayah.words) {
    const aid = overlay.words[`${ayah.verseKey}:${word.position}`];
    if (aid.kind === "meaning" && aid.anchor.startsWith("বাংলা অর্থ ↔ উর্দু"))
      assert.match(aid.connection, /অর্থের তুলনা; ধ্বনি মিলে যাওয়া বা একই উৎসের শব্দ হওয়ার দাবি নয়/);
    if (/(আল্লাহ|রব|তিনি)/.test(ayah.banglaTranslation))
      assert.match(aid.steps[0], /কোনো মানবীয় দৃশ্য বা আকৃতি কল্পনা করবেন না/);
  }
});

test("Detailed progress advances to 2,301 ayahs and 39,643 words", () => {
  const progress = read("progress").detailedAidProgress;
  assert.equal(progress.completedCount, 2301);
  assert.equal(progress.wordCount, 39643);
  assert.equal(progress.nextVerseKey, "19:52");
  assert.equal(new Set(progress.completedVerseKeys).size, 2301);
  assert.equal(progress.lastReview.scope, "14:52–19:51");
  assert.equal(progress.lastReview.sourceVerification, "src/data/detailed-500-fourth-source-verification.json");
});
