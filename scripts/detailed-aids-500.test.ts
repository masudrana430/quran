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
const selected = selectNextFiveHundred(library.surahs);
const overlay = read("detailed-word-aids-500");
const segments = read("detailed-500-segments");
const urdu = read("detailed-500-urdu-glosses");
const verification = read("detailed-500-source-verification");
const morphology = read("word-morphology");

test("Detailed batch is exactly the next 500 canonical ayahs and all 10,090 words", () => {
  assert.equal(selected.length, 500);
  assert.equal(selected[0].verseKey, "3:9");
  assert.equal(selected.at(-1)?.verseKey, "6:12");
  assert.deepEqual(overlay.review.verseKeys, selected.map((ayah) => ayah.verseKey));
  assert.equal(overlay.review.ayahCount, 500);
  assert.equal(overlay.review.wordCount, 10090);
  assert.equal(Object.keys(overlay.words).length, 10090);
  assert.equal(overlay.review.nextVerseKey, "6:13");
});

test("Every word retains its source fingerprint, aligned Corpus position and concrete verse context", () => {
  const rendered = attachDetailedAids(library.surahs, overlay.words as Record<string, DetailedWordAid>);
  for (const ayah of selected) {
    const result = rendered.flatMap((surah) => surah.ayahs).find((item) => item.verseKey === ayah.verseKey)!;
    const source = verification.verses[ayah.verseKey];
    assert.equal(source.arabic, hash(ayah.arabic));
    assert.equal(source.zakaria213, hash(ayah.banglaTranslation));
    assert.equal(source.wordFields, hash(JSON.stringify(ayah.words.map((word) => [word.arabic, plain(word.banglaMeaning), word.transliteration]))));
    assert.equal(source.wordCount, ayah.words.length);
    const page = Math.ceil(ayah.ayahNumber / 50);
    assert.match(source.bengaliUrl, new RegExp(`language=bn.*page=${page}$`));
    assert.match(source.urduUrl, new RegExp(`language=ur.*page=${page}$`));
    for (const word of ayah.words) {
      const key = `${ayah.verseKey}:${word.position}`, aid = overlay.words[key];
      assert.equal(aid.arabic, word.arabic);
      assert.equal(aid.sourceMeaning, plain(word.banglaMeaning));
      assert.equal(urdu[key].arabic, word.arabic);
      assert.equal(aid.urduMeaning, urdu[key].text || null);
      assert.ok(morphology[key].aligned, key);
      assert.ok(segments[key]?.some((part: { features: string }) => part.features.includes("STEM")), key);
      assert.equal(aid.steps.length, 3);
      assert.ok(aid.context.some((near: { arabic: string }) => near.arabic === word.arabic));
      assert.ok(aid.sources.some((source: { url: string }) => source.url.includes(`location=(${key})`)));
      assert.ok(aid.sources.some((source: { url: string }) => source.url === `https://quran.com/${ayah.verseKey.replace(":", "/")}?translations=213`));
      assert.deepEqual(result.words[word.position - 1].detailedAid, aid);
    }
  }
});

test("Meaning comparisons never claim sound-based etymology and divine-context verses use no-imagery guards", () => {
  for (const ayah of selected)
    for (const word of ayah.words) {
      const aid = overlay.words[`${ayah.verseKey}:${word.position}`];
      if (aid.kind === "meaning" && aid.anchor.startsWith("বাংলা অর্থ ↔ উর্দু"))
        assert.match(aid.connection, /অর্থের তুলনা; ধ্বনি মিলে যাওয়া বা একই উৎসের শব্দ হওয়ার দাবি নয়/);
      if (/(আল্লাহ|রব|তিনি)/.test(ayah.banglaTranslation)) {
        assert.match(aid.steps[0], /কোনো মানবীয় দৃশ্য বা আকৃতি কল্পনা করবেন না/);
        assert.match(aid.caution, /মানুষের সঙ্গে তুলনা বা কল্পিত আকৃতি ব্যবহার করবেন না/);
      }
    }
});

test("Progress records imported and detailed coverage separately without overlapping earlier overlays", () => {
  const progress = read("progress").detailedAidProgress;
  assert.equal(progress.completedCount, 1801);
  assert.equal(progress.wordCount, 33475);
  assert.equal(progress.nextVerseKey, "14:52");
  assert.equal(progress.targetCanonicalAyahs, 6236);
  assert.equal(progress.targetLastVerseKey, "114:6");
  const earlier = ["detailed-word-aids", "detailed-word-aids-next-200", "detailed-word-aids-continuation"].flatMap((name) => Object.keys(read(name).words));
  const current = new Set(Object.keys(overlay.words));
  for (const key of earlier) assert.ok(!current.has(key), key);
  assert.equal(new Set(progress.completedVerseKeys).size, progress.completedCount);
});

test("Earlier continuation overlay is byte-identical to PR 12", () => {
  assert.equal(hash(readFileSync("src/data/detailed-word-aids-continuation.json", "utf8")), "16b2741ad5abfe919c2b3b326d45b7306f7c4d9a7a83ed1fc258add835183c5f");
});
