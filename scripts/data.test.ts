import { readLibraryData } from "./library-data";
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { validate } from "./validate-data";
const catalog = JSON.parse(readFileSync("src/data/chapters.json", "utf8"));
const library = readLibraryData();
const progress = JSON.parse(readFileSync("src/data/progress.json", "utf8"));
test("Published data has no missing text, unsourced roots, broken local audio or duplicate ayahs", () => {
  assert.deepEqual(validate(catalog, library.surahs, progress), []);
});
test("Validator detects the original empty-Arabic-word regression", () => {
  const copy = structuredClone(library);
  copy.surahs[0].ayahs[0].words[0].arabic = "";
  assert.ok(
    validate(catalog, copy.surahs, progress).some((e) =>
      e.includes("Incomplete word"),
    ),
  );
});
test("Validator rejects duplicate verses, fabricated root attribution and mismatched progress", () => {
  const copy = structuredClone(library);
  copy.surahs[0].ayahs.push(copy.surahs[0].ayahs[0]);
  copy.surahs[0].ayahs[0].words[0].root = "ب ر ك";
  const errors = validate(catalog, copy.surahs, {
    ...progress,
    completedCount: 0,
  });
  assert.ok(errors.some((e) => e.includes("Duplicate")));
  assert.ok(errors.some((e) => e.includes("Unsourced root")));
  assert.ok(errors.includes("Progress mismatch"));
});
test("Latest batch respects quota and canonical verse ordering, separate from repair work", () => {
  const limit = progress.lastBatch.requestedLimit ?? 300;
  assert.ok(
    limit >= 1 && limit <= (progress.lastBatch.mode === "one-off" ? 500 : 300),
  );
  assert.ok(progress.lastBatch.added.length <= limit);
  assert.equal(
    new Set(progress.lastBatch.added).size,
    progress.lastBatch.added.length,
  );
  const canonical = catalog.flatMap(
    (s: { number: number; versesCount: number }) =>
      Array.from({ length: s.versesCount }, (_, i) => `${s.number}:${i + 1}`),
  );
  const indices = progress.lastBatch.added.map((key: string) =>
    canonical.indexOf(key),
  );
  assert.ok(
    indices.every(
      (n: number, i: number) => n >= 0 && (!i || n > indices[i - 1]),
    ),
  );
});

const morphology = JSON.parse(
  readFileSync("src/data/word-morphology.json", "utf8"),
);
test("All published ayahs use Zakaria and word-level relational cues without the removed panel", () => {
  let count = 0;
  for (const surah of library.surahs)
    for (const ayah of surah.ayahs) {
      assert.ok(ayah.translationSource);
      assert.match(ayah.translationSource, /Zakaria.*213/);
      assert.equal(ayah.memoryAid, undefined);
      for (const word of ayah.words) {
        count++;
        assert.ok(word.memoryTrickType);
        assert.ok(word.memoryTrickSource);
        assert.ok(
          ["familiar", "family", "context"].includes(word.memoryTrickType),
        );
        assert.match(
          word.memoryTrickSource,
          /^https:\/\/(corpus\.quran\.com|quran\.com)\//,
        );
        assert.equal(
          morphology[`${ayah.verseKey}:${word.position}`].aligned,
          true,
        );
      }
    }
  assert.equal(count, Object.keys(morphology).length);
  assert.equal(
    count,
    Object.values(progress.mnemonicCoverage).reduce(
      (sum: number, n) => sum + Number(n),
      0,
    ),
  );
  const mulk = library.surahs.find(
    (s: { surah: { number: number } }) => s.surah.number === 67,
  );
  assert.ok(mulk);
  assert.match(mulk.ayahs[0].words[3].memoryTrick, /নিজ মুলুকে রাজা/);
  assert.match(mulk.ayahs[1].words[4].memoryTrick, /বালা/);
  assert.equal(morphology["67:2:5"].root, "blw");
});
test("Validator rejects an old translation and a reintroduced verse-level memory panel", () => {
  const copy = structuredClone(library);
  copy.surahs[0].ayahs[0].translationSource = "Taisirul Quran";
  copy.surahs[0].ayahs[0].memoryAid = "obsolete chunking";
  const errors = validate(catalog, copy.surahs, progress);
  assert.ok(errors.some((e) => /translation/i.test(e)));
  assert.ok(errors.some((e) => /Removed verse-level aid/i.test(e)));
});

test("Familiar-phrase cues do not conflate shay with shaa or tawalla with wali", () => {
  let things = 0,
    turns = 0;
  for (const surah of library.surahs)
    for (const ayah of surah.ayahs)
      for (const word of ayah.words) {
        const lemma = morphology[`${ayah.verseKey}:${word.position}`].lemma;
        if (lemma === "$aYo'") {
          things++;
          assert.doesNotMatch(word.memoryTrick, /ইনশাআল্লাহ/);
        }
        if (lemma === "tawal~aY`") {
          turns++;
          assert.doesNotMatch(word.memoryTrick, /পরিচিত “ওলি”/);
        }
      }
  assert.ok(things > 0 && turns > 0);
});
