import { readLibraryData } from "./library-data";
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { rewriteTricks } from "./refresh-word-tricks";
import type { SurahData } from "../src/types/quran";

const library = readLibraryData();
const progress = JSON.parse(readFileSync("src/data/progress.json", "utf8"));
const morph = JSON.parse(readFileSync("src/data/word-morphology.json", "utf8"));

test("Batch mnemonic generation preserves verified existing verses while generating missing cues", () => {
  const copy: SurahData[] = structuredClone(library.surahs);
  const first = copy[0].ayahs[0];
  first.words[0].memoryTrick = "Previously reviewed word association";
  const before = structuredClone(first);
  const addedKey = progress.lastBatch.added[0];
  const added = copy.flatMap((s) => s.ayahs).find((a) => a.verseKey === addedKey)!;
  added.words[0].memoryTrick = "";
  const preserve = new Set<string>(progress.completedVerseKeys.filter((key: string) => !progress.lastBatch.added.includes(key)));
  const counts = rewriteTricks(copy, morph, preserve);
  assert.deepEqual(first, before);
  assert.ok(added.words[0].memoryTrick.length > 0);
  assert.equal(Object.values(counts).reduce((n, c) => n + c, 0), copy.flatMap((s) => s.ayahs).reduce((n, a) => n + a.words.length, 0));
});

test("Detailed progress matches both source overlays and stays separate from imported coverage", () => {
  const overlays = ["detailed-word-aids", "detailed-word-aids-next-200", "detailed-word-aids-continuation", "detailed-word-aids-500", "detailed-word-aids-500-second", "detailed-word-aids-500-third"].map((name) => JSON.parse(readFileSync(`src/data/${name}.json`, "utf8")));
  assert.deepEqual(progress.detailedAidProgress.completedVerseKeys, overlays.flatMap((o) => o.review.verseKeys));
  assert.equal(progress.detailedAidProgress.completedCount, 1801);
  assert.equal(progress.detailedAidProgress.wordCount, overlays.reduce((n, o) => n + Object.keys(o.words).length, 0));
  assert.equal(progress.detailedAidProgress.nextVerseKey, "14:52");
  assert.equal(progress.detailedAidProgress.targetLastVerseKey, "114:6");
  assert.ok(progress.completedCount > progress.detailedAidProgress.completedCount);
});
