import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readLibraryData } from "./library-data";
import { rewriteTricks } from "./refresh-word-tricks";
import { attachDetailedAids } from "../src/lib/detailed-aids";
import DetailedWordAid from "../src/components/DetailedWordAid";
import type { DetailedWordAid as Aid } from "../src/types/quran";
const library = readLibraryData();
const morph = JSON.parse(readFileSync("src/data/word-morphology.json", "utf8"));
const clarifications = JSON.parse(readFileSync("src/data/source-word-clarifications.json", "utf8"));
const ayah = (key: string) => library.surahs.flatMap((s) => s.ayahs).find((a) => a.verseKey === key)!;
const word = (key: string) => { const [s, a, p] = key.split(":"); return ayah(`${s}:${a}`).words.find((w) => w.position === +p)!; };

test("New contextual cues keep bones, people and deities separate from misleading broad-root anchors", () => {
  const bones = word("17:98:9");
  assert.match(bones.banglaMeaning, /হাড়/);
  assert.equal(bones.memoryTrickType, "context");
  assert.doesNotMatch(bones.memoryTrick, /আজিম|আজমত|মহত্ত্ব/);
  assert.doesNotMatch(word("18:15:2").memoryTrick, /কিয়াম|দাঁড়ানো/);
  assert.doesNotMatch(word("18:14:15").memoryTrick, /আল্লাহ.*নামটি আমাদের পরিচিত/);
  assert.equal(morph["17:98:9"].tag, "N");
});

test("Attribute and first-person learning cues stay in the actual text without human scenes or plural-group analogies", () => {
  for (const a of [ayah("20:5"), ayah("20:12"), ayah("24:35")])
    for (const w of a.words) {
      assert.equal(w.memoryTrickType, "context");
      assert.doesNotMatch(w.memoryTrick, /আঙুল|দুই দিক সমান|নিজের দিকে|একটি পুরুষকে/);
    }
  for (const s of library.surahs) for (const a of s.ayahs) {
    if (+a.verseKey.split(":")[0] < 17 || (a.verseKey.startsWith("17:") && a.ayahNumber < 72) || s.surah.number === 67) continue;
    for (const w of a.words) {
      if (["huwa", "naHonu", ">anaA", ">anaA\""].includes(morph[`${a.verseKey}:${w.position}`].lemma)) {
        assert.equal(w.memoryTrickType, "context");
        assert.doesNotMatch(w.memoryTrick, /দল হলে|আঙুল|একটি পুরুষকে/);
      }
    }
  }
});

test("A shared lemma alone cannot link differently classified words", () => {
  const original = library.surahs.find((s) => s.surah.number === 26)!;
  const copy = structuredClone(original);
  copy.ayahs = [structuredClone(ayah("26:22"))];
  copy.ayahs[0].words = copy.ayahs[0].words.slice(0, 2);
  const supplied = {
    "26:22:1": { root: "", lemma: "test-shared", tag: "N", stemArabic: copy.ayahs[0].words[0].arabic, aligned: true },
    "26:22:2": { root: "", lemma: "test-shared", tag: "ADJ", stemArabic: copy.ayahs[0].words[1].arabic, aligned: true },
  };
  rewriteTricks([copy], supplied);
  for (const w of copy.ayahs[0].words) assert.equal(w.memoryTrickType, "context");
});

test("Two word-gloss clarifications follow exact Zakaria wording and preserve original fingerprints in the UI", () => {
  const rendered = attachDetailedAids(library.surahs, clarifications.words as Record<string, Aid>);
  for (const [key, expected] of Object.entries(clarifications.words) as [string, Aid][]) {
    const [s, a, p] = key.split(":");
    const v = rendered.find((v) => v.surah.number === +s)!.ayahs.find((v) => v.ayahNumber === +a)!;
    const w = v.words.find((w) => w.position === +p)!;
    assert.equal(w.banglaMeaning, expected.sourceMeaning);
    assert.equal(w.detailedAid?.meaning, expected.meaning);
    assert.ok(v.banglaTranslation.includes(expected.meaning));
    assert.ok(expected.sources.some((source) => source.url.includes("translations=213")));
    const html = renderToStaticMarkup(React.createElement(DetailedWordAid, { word: w }));
    assert.ok(html.includes(expected.meaning));
    assert.ok(html.includes("মূল প্রদানকারীর শব্দার্থ সংরক্ষিত"));
    assert.ok(html.includes("translations=213"));
    const changed = structuredClone(clarifications.words);
    changed[key].sourceMeaning = "mismatched";
    const stale = attachDetailedAids([library.surahs.find((v) => v.surah.number === +s)!], changed as Record<string, Aid>);
    assert.equal(stale[0].ayahs.find((v) => v.ayahNumber === +a)!.words.find((w) => w.position === +p)!.detailedAid, undefined);
  }
  assert.equal(clarifications.review.fullyDetailedAyahsAdded, 0);
});
