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
const selected = selectNextFiveHundred(library.surahs, "6:13");
const overlay = read("detailed-word-aids-500-second");
const segments = read("detailed-500-second-segments");
const urdu = read("detailed-500-second-urdu-glosses");
const verification = read("detailed-500-second-source-verification");
const morphology = read("word-morphology");

test("Second detailed batch is exactly 500 canonical ayahs from 6:13 through 9:66", () => {
  assert.equal(selected.length, 500);
  assert.equal(selected[0].verseKey, "6:13");
  assert.equal(selected.at(-1)?.verseKey, "9:66");
  assert.deepEqual(overlay.review.verseKeys, selected.map((ayah) => ayah.verseKey));
  assert.equal(overlay.review.ayahCount, 500);
  assert.equal(overlay.review.wordCount, 8662);
  assert.equal(Object.keys(overlay.words).length, 8662);
  assert.equal(overlay.review.nextVerseKey, "9:67");
});

test("Every second-batch word is source-verified, Corpus-aligned and attached to the reader", () => {
  const rendered = attachDetailedAids(library.surahs, overlay.words as Record<string, DetailedWordAid>);
  const renderedAyahs = rendered.flatMap((surah) => surah.ayahs);
  for (const ayah of selected) {
    const source = verification.verses[ayah.verseKey];
    assert.equal(source.arabic, hash(ayah.arabic));
    assert.equal(source.zakaria213, hash(ayah.banglaTranslation));
    assert.equal(source.wordFields, hash(JSON.stringify(ayah.words.map((word) => [word.arabic, plain(word.banglaMeaning), word.transliteration]))));
    const result = renderedAyahs.find((item) => item.verseKey === ayah.verseKey)!;
    for (const word of ayah.words) {
      const key = `${ayah.verseKey}:${word.position}`;
      const aid = overlay.words[key];
      assert.equal(aid.arabic, word.arabic);
      assert.equal(aid.sourceMeaning, plain(word.banglaMeaning));
      assert.equal(urdu[key].arabic, word.arabic);
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

test("Second batch does not overlap earlier detailed overlays or force etymology", () => {
  const earlierNames = ["detailed-word-aids", "detailed-word-aids-next-200", "detailed-word-aids-continuation", "detailed-word-aids-500"];
  const current = new Set(Object.keys(overlay.words));
  for (const name of earlierNames)
    for (const key of Object.keys(read(name).words)) assert.ok(!current.has(key), key);
  assert.equal(hash(readFileSync("src/data/detailed-word-aids-500.json", "utf8")), "5f587164ed09e87bcf753ddc1fe9b5a10ca18a8508034dbed3a4e3792a98e86f");
  for (const ayah of selected)
    for (const word of ayah.words) {
      const aid = overlay.words[`${ayah.verseKey}:${word.position}`];
      if (aid.kind === "meaning" && aid.anchor.startsWith("বাংলা অর্থ ↔ উর্দু"))
        assert.match(aid.connection, /অর্থের তুলনা; ধ্বনি মিলে যাওয়া বা একই উৎসের শব্দ হওয়ার দাবি নয়/);
      if (/(আল্লাহ|রব|তিনি)/.test(ayah.banglaTranslation))
        assert.match(aid.steps[0], /কোনো মানবীয় দৃশ্য বা আকৃতি কল্পনা করবেন না/);
    }
});

test("Detailed progress includes the later continuation without changing this batch", () => {
  const progress = read("progress").detailedAidProgress;
  assert.equal(progress.completedCount, 2801);
  assert.equal(progress.wordCount, 45049);
  assert.equal(progress.nextVerseKey, "24:11");
  assert.equal(new Set(progress.completedVerseKeys).size, 2801);
});
