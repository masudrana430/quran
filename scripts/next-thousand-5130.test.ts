import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { readLibraryData } from "./library-data";
import { attachDetailedAids } from "../src/lib/detailed-aids";
import type { DetailedWordAid } from "../src/types/quran";
const library = readLibraryData();
const progress = JSON.parse(readFileSync("src/data/progress.json", "utf8"));
const morph = JSON.parse(readFileSync("src/data/word-morphology.json", "utf8"));
const aids = JSON.parse(readFileSync("src/data/source-word-clarifications.json", "utf8"));
const ayahs = attachDetailedAids(library.surahs, aids.words as Record<string, DetailedWordAid>).flatMap((s) => s.ayahs);
const verse = (key: string) => ayahs.find((a) => a.verseKey === key)!;
const word = (key: string) => { const [s, a, p] = key.split(":"); return verse(`${s}:${a}`).words.find((w) => w.position === +p)!; };

test("The 4,130–5,130 request records 1,000 distinct ayahs and 10,065 new word positions", () => {
  const r = progress.contentRequestHistory.find((r: { previousCount: number; completedCount: number }) => r.previousCount === 4130 && r.completedCount === 5130);
  assert(r);
  assert.equal(r.addedCount, 1000);
  assert.equal(r.addedVerseKeys[0], "39:43");
  assert.equal(r.addedVerseKeys.at(-1), "57:25");
  assert.equal(new Set(r.addedVerseKeys).size, 1000);
  assert.deepEqual(r.batches.map((b: { added: string[] }) => b.added.length), [250, 250, 250, 250]);
  assert.deepEqual(r.batches.flatMap((b: { added: string[] }) => b.added), r.addedVerseKeys);
  assert.equal(r.wordCount, 10065);
  assert.equal(r.addedVerseKeys.reduce((n: number, k: string) => n + verse(k).words.length, 0), 10065);
  assert.equal(progress.detailedAidProgress.completedCount, 301);
});

test("Six contextual clarifications use exact Zakaria wording without changing provider word glosses", () => {
  for (const key of ["41:11:2", "42:16:15", "51:47:3", "54:14:2", "55:27:2", "57:4:10"]) {
    const w = word(key); const aid = w.detailedAid!;
    assert(aid);
    assert.equal(w.banglaMeaning, aid.sourceMeaning);
    assert.equal(w.memoryTrickType, "context");
    assert(w.memoryTrick.includes(aid.meaning));
    assert(w.memoryTrickSource!.includes("translations=213"));
    assert.equal(aid.urduMeaning, null);
    assert.equal(aid.steps.length, 3);
    assert.doesNotMatch(aid.connection, /আঙুল|মানুষের মতো|দল হলে/);
  }
  assert.equal(morph["51:47:3"].root, "Ayd");
  assert.equal(word("51:47:3").detailedAid!.meaning, "ক্ষমতা বলে");
  assert.equal(word("55:27:2").detailedAid!.meaning, "চেহারা");
  assert.equal(word("57:4:10").detailedAid!.meaning, "উঠেছেন");
  assert.equal(word("41:11:2").detailedAid!.meaning, "ইচ্ছে করলেন");
});

test("Attribute passages stay textual, while iron and keen sight cannot share a forced lexical cue", () => {
  for (const key of ["39:67", "41:11", "42:11", "48:10", "50:16", "50:38", "51:47", "52:48", "54:14", "55:27", "57:3", "57:4"])
    for (const w of verse(key).words) {
      assert.equal(w.memoryTrickType, "context");
      assert.doesNotMatch(w.memoryTrick, /নিজের দিকে আঙুল|একা থেকে দল|একটি পুরুষকে/);
    }
  const iron = word("57:25:13");
  assert.equal(iron.memoryTrickType, "familiar");
  assert.match(iron.memoryTrick, /আল-হাদীদ/);
  assert.doesNotMatch(iron.memoryTrick, /হুদুদ|সীমাসমূহ/);
  const sight = word("50:22:12");
  assert.equal(sight.memoryTrickType, "context");
  assert.doesNotMatch(sight.memoryTrick, /লোহা|হুদুদ/);
  assert.doesNotMatch(word("47:15:16").memoryTrick, /গাইর|নিজের বাইরে অন্য/);
});
