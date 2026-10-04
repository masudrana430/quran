import { readLibraryData } from "./library-data";
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { attachDetailedAids } from "../src/lib/detailed-aids";
import {
  buildDetailedAids,
  explainParts,
  firstHundred,
} from "./build-detailed-aids";
import DetailedWordAid from "../src/components/DetailedWordAid";
const read = (path: string) =>
  JSON.parse(readFileSync(`src/data/${path}.json`, "utf8"));
const library = readLibraryData(),
  details = read("detailed-word-aids"),
  morphology = read("word-morphology"),
  urdu = read("first-100-urdu-glosses"),
  segments = read("first-100-segments");
const rendered = attachDetailedAids(library.surahs, details.words);
test("Exactly the requested first 100 ayahs have details; all other ayahs retain their original word content", () => {
  const selected = firstHundred(library.surahs),
    expected = new Set(selected.map((a) => a.verseKey));
  assert.equal(selected.length, 100);
  assert.equal(selected[0].verseKey, "1:1");
  assert.equal(selected.at(-1)?.verseKey, "2:93");
  assert.deepEqual(
    details.review.verseKeys,
    selected.map((a) => a.verseKey),
  );
  let covered = 0,
    remaining = 0;
  for (const s of rendered)
    for (const a of s.ayahs) {
      const original = library.surahs
        .find(
          (x: { surah: { number: number } }) =>
            x.surah.number === s.surah.number,
        )
        ?.ayahs.find((x: { verseKey: string }) => x.verseKey === a.verseKey);
      assert.ok(original);
      if (!expected.has(a.verseKey)) {
        remaining++;
        assert.deepEqual(a, original);
      } else
        for (const w of a.words) {
          covered++;
          assert.ok(w.detailedAid);
          const { detailedAid, ...unchanged } = w;
          assert.deepEqual(
            unchanged,
            original.words.find(
              (x: { position: number }) => x.position === w.position,
            ),
          );
          assert.ok(detailedAid?.steps.length === 3);
        }
    }
  assert.equal(covered, 1593);
  assert.equal(remaining, library.surahs.flatMap((s: {ayahs: unknown[]})=>s.ayahs).length - 100);
  assert.equal(Object.keys(details.words).length, covered);
  assert.equal(
    library.surahs.flatMap((s: { ayahs: unknown[] }) => s.ayahs).length,
    read("progress").completedCount,
  );
});
test("Every detailed cue has the correct source fingerprint, morphology, source links and actual nearby words", () => {
  for (const a of firstHundred(library.surahs))
    for (const w of a.words) {
      const key = `${a.verseKey}:${w.position}`,
        aid = details.words[key];
      assert.equal(aid.arabic, w.arabic);
      assert.equal(urdu[key].arabic, w.arabic);
      assert.equal(morphology[key].aligned, true);
      assert.ok(
        aid.anchor.trim() &&
          aid.connection.length > 70 &&
          aid.steps.every((s: string) => s.length > 30),
      );
      assert.ok(
        aid.sources.some(
          (s: { url: string }) =>
            s.url ===
            `https://corpus.quran.com/wordmorphology.jsp?location=(${key})`,
        ),
      );
      assert.ok(
        aid.context.some((c: { arabic: string }) => c.arabic === w.arabic),
      );
      assert.ok(
        aid.context.every((c: { arabic: string }) =>
          a.words.some((word) => word.arabic === c.arabic),
        ),
      );
      assert.equal(aid.urduMeaning, urdu[key].text);
      assert.ok(
        aid.parts.length > 0 && segments[key].length === aid.parts.length,
      );
    }
});
test("The detail generator reproduces the authored snapshot and blocks misaligned input", () => {
  assert.deepEqual(
    buildDetailedAids(library.surahs, morphology, urdu, segments),
    details,
  );
  const wrong = structuredClone(urdu);
  wrong["1:1:1"].arabic = "غير";
  assert.throws(
    () => buildDetailedAids(library.surahs, morphology, wrong, segments),
    /Urdu\/text alignment/,
  );
  const corrupted = structuredClone(segments);
  corrupted["1:1:1"][1].features = corrupted["1:1:1"][1].features.replace(
    "ROOT:smw",
    "ROOT:mlk",
  );
  assert.throws(
    () => buildDetailedAids(library.surahs, morphology, urdu, corrupted),
    /Morphology mismatch/,
  );
});
test("Similar-looking words and polysemous forms keep their different meanings", () => {
  assert.match(details.words["1:2:4"].anchor, /আলম/);
  assert.match(details.words["1:2:4"].caution, /জ্ঞানী/);
  assert.match(details.words["2:26:4"].anchor, /হায়া/);
  assert.match(details.words["2:49:11"].anchor, /হায়াত/);
  assert.match(details.words["2:68:15"].caution, /ফরজ/);
  assert.match(details.words["1:7:6"].meaning, /ক্রোধ/);
  assert.doesNotMatch(details.words["1:7:6"].meaning, /অভিশপ্ত/);
  assert.equal(details.words["2:49:12"].meaning, "তোমাদের নারীদের");
  assert.match(details.words["2:60:11"].meaning, /দুই/);
  assert.match(details.words["2:83:12"].meaning, /সম্পর্ক/);
  assert.match(details.words["2:26:11"].connection, /যাকারিয়ার/);
});
test("Empty provider Urdu glosses remain explicitly unavailable rather than invented", () => {
  assert.equal(details.review.urduGlossCount, 1588);
  assert.equal(details.review.urduUnavailableKeys.length, 5);
  for (const key of details.review.urduUnavailableKeys) {
    assert.equal(details.words[key].urduMeaning, null);
    assert.ok(
      !details.words[key].sources.some((s: { label: string }) =>
        s.label.startsWith("উর্দু শব্দার্থ"),
      ),
    );
  }
});
test("Morphological components distinguish a conjunction and an emphatic lam", () => {
  assert.match(
    explainParts([{ form: "wa", tag: "CONJ", features: "PREFIX|w:CONJ+" }])[0]
      .meaning,
    /এবং/,
  );
  assert.match(
    explainParts([{ form: "la", tag: "EMPH", features: "PREFIX|l:EMPH+" }])[0]
      .meaning,
    /নিশ্চয়/,
  );
});
test("Detailed UI renders the Urdu direction, all three explanations and sources without the removed verse practice panel", () => {
  const word = rendered[0].ayahs[0].words[0];
  const html = renderToStaticMarkup(
    React.createElement(DetailedWordAid, { word }),
  );
  assert.match(html, /সংক্ষেপে মনে রাখুন/);
  assert.match(html, /কীভাবে মনে রাখবেন/);
  assert.match(html, /lang="ur" dir="rtl"/);
  assert.match(html, /বিসমিল্লাহ/);
  assert.match(html, /যুক্ত ছোট অংশগুলো/);
  assert.match(html, /corpus\.quran\.com/);
  assert.doesNotMatch(
    html,
    /মনে রাখার অনুশীলন|এটি শেখার কৌশল, অনুবাদ বা তাফসীর নয়/,
  );
});
test("A stale detailed source fingerprint is not attached to a different word", () => {
  const wrong = structuredClone(details.words);
  wrong["1:1:1"].sourceMeaning = "different";
  assert.equal(
    attachDetailedAids(library.surahs, wrong)[0].ayahs[0].words[0].detailedAid,
    undefined,
  );
});
