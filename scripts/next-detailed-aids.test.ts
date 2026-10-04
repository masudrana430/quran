import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { buildNextDetailedAids } from "./build-next-detailed-aids";
import { nextTwoHundred } from "./build-detailed-aids";
import { attachDetailedAids } from "../src/lib/detailed-aids";
const read = (s: string) =>
  JSON.parse(readFileSync(`src/data/${s}.json`, "utf8"));
const library = read("quran-library"),
  first = read("detailed-word-aids"),
  next = read("detailed-word-aids-next-200"),
  morph = read("word-morphology"),
  urdu = read("next-200-urdu-glosses"),
  segments = read("next-200-segments");
const selected = nextTwoHundred(library.surahs);
const keyFor = (lemma: string, verse?: string) =>
  Object.keys(next.words).find(
    (k) => morph[k].lemma === lemma && (!verse || k.startsWith(verse + ":")),
  )!;
test("The new detailed scope is exactly the next 200 ayahs and all 4,659 words", () => {
  assert.equal(selected.length, 200);
  assert.equal(selected[0].verseKey, "2:94");
  assert.equal(selected.at(-1)?.verseKey, "3:7");
  assert.deepEqual(
    next.review.verseKeys,
    selected.map((a) => a.verseKey),
  );
  assert.equal(next.review.wordCount, 4659);
  assert.equal(Object.keys(next.words).length, 4659);
  const keys = new Set(Object.keys(first.words));
  for (const k of Object.keys(next.words)) assert.ok(!keys.has(k));
  const combined = { ...first.words, ...next.words };
  const rendered = attachDetailedAids(library.surahs, combined);
  let untouched = 0,
    covered = 0;
  for (let i = 0; i < rendered.length; i++)
    for (let j = 0; j < rendered[i].ayahs.length; j++) {
      const a = rendered[i].ayahs[j],
        original = library.surahs[i].ayahs[j];
      const aided = a.words.some((w) => w.detailedAid);
      if (!aided) {
        untouched++;
        assert.deepEqual(a, original);
      } else {
        covered++;
        for (const w of a.words) {
          const { detailedAid, ...word } = w;
          assert.deepEqual(word, original.words[w.position - 1]);
          assert.deepEqual(
            detailedAid,
            combined[`${a.verseKey}:${w.position}`],
          );
        }
      }
    }
  assert.equal(covered, 300);
  assert.equal(untouched, library.surahs.flatMap((s: {ayahs: unknown[]})=>s.ayahs).length - 300);
  assert.equal(Object.keys(combined).length, 6252);
  assert.equal(next.review.nextVerseKey, "3:8");
});
test("Every next-batch word aligns with source Arabic, actual Urdu and verse-local context", () => {
  for (const a of selected)
    for (const w of a.words) {
      const key = `${a.verseKey}:${w.position}`,
        d = next.words[key];
      assert.equal(d.arabic, w.arabic);
      assert.equal(urdu[key].arabic, w.arabic);
      assert.equal(d.urduMeaning, urdu[key].text?.trim() || null);
      assert.ok(morph[key].aligned);
      assert.ok(segments[key].length);
      assert.equal(d.steps.length, 3);
      assert.ok(d.connection.includes(d.meaning));
      assert.ok(
        d.sources.some(
          (s: { url: string }) =>
            s.url ===
            `https://quran.com/${a.verseKey.replace(":", "/")}?translations=213`,
        ),
      );
      for (const c of d.context)
        assert.ok(a.words.some((v) => v.arabic === c.arabic));
      assert.doesNotMatch(d.steps.join(" "), /আজ পরে|আগামীকাল|এক সপ্তাহ পরে/);
    }
  assert.equal(next.review.urduGlossCount, 4630);
  assert.equal(next.review.urduUnavailableKeys.length, 29);
  for (const k of next.review.urduUnavailableKeys)
    assert.equal(next.words[k].urduMeaning, null);
});
test("Next-batch generation is deterministic and rejects altered source fingerprints", () => {
  assert.deepEqual(
    buildNextDetailedAids(library.surahs, morph, urdu, segments),
    next,
  );
  assert.throws(
    () =>
      buildNextDetailedAids(
        library.surahs,
        morph,
        { ...urdu, "2:94:1": { ...urdu["2:94:1"], arabic: "wrong" } },
        segments,
      ),
    /alignment/,
  );
});
test("The taklif example preserves the capacity qualification and active/passive forms", () => {
  const active = next.words["2:286:2"],
    passive = next.words["2:233:18"];
  assert.match(active.anchor, /তাকলিফ/);
  assert.match(active.steps[0], /সাধ্যের বাইরে/);
  assert.match(active.caution, /কোনো কষ্টই হবে না/);
  assert.match(passive.caution, /কর্মবাচ্য/);
  assert.match(active.meaning, /দায়িত্ব/);
});
test("Polysemous word families do not impose one root meaning on different ayahs", () => {
  for (const [lemma, pattern] of [
    ["hadoy", /কুরবানির/],
    ["diyn", /দীন/],
    ["dayon", /ঋণ/],
    ["nahaAr", /দিনের/],
    ["riyH", /বাতাস/],
    ["naSoraAniy~", /খ্রিষ্টান/],
    ["Eafow", /উদ্বৃত্ত/],
    ["yunZaru", /অবকাশ/],
    ["Haj~", /হজ/],
    ["mayosir", /জুয়া/],
    ["Hab~ap", /শস্যদানা/],
    [">aroHaAm", /গর্ভাশয়/],
  ] as const) {
    const key = keyFor(lemma);
    assert.ok(key, lemma);
    assert.match(next.words[key].anchor, pattern);
  }
  assert.match(next.words[keyFor("ba`$iru")].connection, /দাম্পত্য/);
});
test("Allah-related names and attributes use textual associations without human imagery or invented figurative meanings", () => {
  assert.match(next.words["2:253:20"].meaning, /রূহুল কুদুস/);
  assert.equal(next.words["2:253:21"].meaning, "কুদুস (পবিত্র)");
  const kursi = next.words["2:255:42"];
  assert.equal(kursi.meaning, "তাঁর কুরসী");
  assert.match(kursi.caution, /মানুষের সঙ্গে তুলনা/);
  assert.match(kursi.meaningNote, /যাকারিয়ার/);
  assert.equal(next.words["2:115:11"].meaning, "প্রাচুর্যময়");
  assert.equal(next.words["3:7:13"].meaning, "মুতাশাবিহ আয়াতসমূহ");
  for (const lemma of [
    "Ealiym",
    "samiyE",
    "baSiyr",
    "qay~uwm",
    "qadiyr",
    "wa`siE",
  ])
    for (const k of Object.keys(next.words).filter(
      (k) => morph[k].lemma === lemma,
    )) {
      assert.match(next.words[k].caution, /মানুষের সঙ্গে তুলনা/);
      assert.doesNotMatch(
        next.words[k].steps[0],
        /মানুষের ছবি|চেয়ার|দাঁড়িয়ে থাকা|কল্পনা করুন/,
      );
    }
});
