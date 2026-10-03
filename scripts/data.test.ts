import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { validate } from "./validate-data";
const catalog = JSON.parse(readFileSync("src/data/chapters.json", "utf8"));
const library = JSON.parse(readFileSync("src/data/quran-library.json", "utf8"));
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
  assert.ok(progress.lastBatch.added.length <= 300);
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
