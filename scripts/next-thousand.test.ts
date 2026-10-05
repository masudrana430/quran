import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { readLibraryData } from "./library-data";
import { validate } from "./validate-data";
import { rootHintAllowed } from "./mnemonic-context";
const library = readLibraryData();
const catalog = JSON.parse(readFileSync("src/data/chapters.json", "utf8"));
const progress = JSON.parse(readFileSync("src/data/progress.json", "utf8"));
const ayahs = library.surahs.flatMap((s) => s.ayahs);
const verse = (key: string) => ayahs.find((a) => a.verseKey === key)!;

test("Direction markers in exact source text do not hide altered Arabic letters or a missing sajdah sign", () => {
  const original = verse("27:26");
  assert.match(original.words.at(-1)!.arabic, /\u200f/);
  const copy = structuredClone(library.surahs.find((s) => s.surah.number === 27)!);
  copy.ayahs = [structuredClone(original)];
  const p = { completedCount: 1, completedVerseKeys: ["27:26"] };
  assert.deepEqual(validate(catalog, [copy], p), []);
  copy.ayahs[0].words[0].arabic += "\u200e";
  assert.deepEqual(validate(catalog, [copy], p), []);
  copy.ayahs[0].words[0].arabic += "ب";
  assert(validate(catalog, [copy], p).includes("Word/verse alignment mismatch 27:26"));
  copy.ayahs = [structuredClone(original)];
  copy.ayahs[0].words.at(-1)!.arabic = copy.ayahs[0].words.at(-1)!.arabic.replace("۩", "");
  assert(validate(catalog, [copy], p).includes("Word/verse alignment mismatch 27:26"));
});

test("The 3,130–4,130 request records 1,000 unique canonical additions in four 250-ayah batches", () => {
  const request = progress.contentRequestHistory.find((r: { previousCount: number; completedCount: number }) => r.previousCount === 3130 && r.completedCount === 4130);
  assert(request);
  assert.equal(request.previousCount, 3130);
  assert.equal(request.addedCount, 1000);
  assert.equal(request.completedCount, 4130);
  assert.equal(request.wordCount, 11570);
  assert.equal(request.addedVerseKeys[0], "26:169");
  assert.equal(request.addedVerseKeys.at(-1), "39:42");
  assert.equal(new Set(request.addedVerseKeys).size, 1000);
  assert.deepEqual(request.batches.map((b: { added: string[] }) => b.added.length), [250, 250, 250, 250]);
  assert.deepEqual(request.batches.flatMap((b: { added: string[] }) => b.added), request.addedVerseKeys);
  assert.equal(progress.detailedAidProgress.completedCount, 301);
});

test("Attribute passages and salawat keep textual meanings instead of prayer or human-image cues", () => {
  for (const key of ["32:4", "33:43", "33:56", "35:41", "36:82", "38:75", "39:42"])
    for (const w of verse(key).words) {
      assert.equal(w.memoryTrickType, "context");
      assert.doesNotMatch(w.memoryTrick, /নিজের দিকে আঙুল|একা থেকে দল|দুই দিক সমান/);
    }
  for (const root of ["Hyy", "Hjj", "bny", "$bh", "*kr", "Slw", "Amn", "smE", "bSr", "kfr", "hdy", "nEm", "qdr", "Ezz", "xyr", "jnn", "nhr", "Zlm", "byt", "lqy", "brr", "qrb", "mwl", "b$r", "Drb"])
    assert.equal(rootHintAllowed({ root, lemma: "unreviewed", tag: "V" }), false);
  assert.equal(verse("33:53").words.find((w) => w.position === 36)!.memoryTrickType, "context");
  for (const [key, position, incorrect] of [
    ["34:13", 10, /কুদরত|ক্ষমতা/],
    ["39:6", 12, /নেয়ামত|অনুগ্রহ/],
    ["27:35", 4, /হেদায়েত|পথনির্দেশ/],
  ] as const)
    assert.doesNotMatch(verse(key).words.find((w) => w.position === position)!.memoryTrick, incorrect);
});

test("Reviewed male-noun correction cannot teach remembrance from broad root membership", () => {
  const w = verse("26:165").words.find((w) => w.position === 2)!;
  assert.equal(w.banglaMeaning, "পুরুষদের (নিকট)");
  assert.equal(w.memoryTrickType, "context");
  assert.doesNotMatch(w.memoryTrick, /যিকির|স্মরণ/);
  assert.match(w.memoryTrick, /ٱلذُّكْرَانَ/);
});
