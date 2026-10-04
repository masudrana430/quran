import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { readLibraryData } from "./library-data";
import { arabic, extractMorphology } from "./sync-morphology";
import spellings from "../src/data/morphology-spellings.json";
const library = readLibraryData();
const verses = library.surahs.flatMap((s) => s.ayahs);
const verse = (key: string) => verses.find((v) => v.verseKey === key)!;
const progress = JSON.parse(readFileSync("src/data/progress.json", "utf8"));
const morphology = JSON.parse(readFileSync("src/data/word-morphology.json", "utf8"));

test("The 5,130–6,130 request skips existing Al-Mulk and adds exactly 1,000 ayahs / 6,868 words", () => {
  const r = progress.contentRequestHistory.find((r: { previousCount: number; completedCount: number }) => r.previousCount === 5130 && r.completedCount === 6130);
  assert(r);
  assert.equal(r.addedCount, 1000);
  assert.equal(new Set(r.addedVerseKeys).size, 1000);
  assert.equal(r.addedVerseKeys[0], "57:26");
  assert.equal(r.addedVerseKeys.at(-1), "97:5");
  assert(!r.addedVerseKeys.some((k: string) => k.startsWith("67:")));
  assert.deepEqual(r.batches.map((b: { added: string[] }) => b.added.length), [250, 250, 250, 250]);
  assert.deepEqual(r.batches.flatMap((b: { added: string[] }) => b.added), r.addedVerseKeys);
  assert.equal(r.wordCount, 6868);
  assert.equal(r.addedVerseKeys.reduce((n: number, k: string) => n + verse(k).words.length, 0), 6868);
  assert.equal(progress.detailedAidProgress.completedCount, 300);
  assert.equal(r.fullyDetailedAyahsAdded, 0);
  for (const s of library.surahs.filter((s) => s.surah.number <= 97)) assert.equal(s.ayahs.length, s.surah.versesCount);
});

test("Extended Buckwalter signs decode as official Unicode in stems and detailed segmentation", () => {
  assert.equal(arabic("[;,.!-+%]"), "ۣۢۥۦ۪ۭۨ۫۬");
  assert.equal(arabic(">aliymN["), "أَلِيمٌۢ");
  const undecoded = /[A-Za-z\[\];,.!+%\-]/;
  for (const m of Object.values(morphology) as { stemArabic: string }[]) assert.doesNotMatch(m.stemArabic, undecoded);
  for (const file of ["detailed-word-aids", "detailed-word-aids-next-200"]) {
    const overlay = JSON.parse(readFileSync(`src/data/${file}.json`, "utf8"));
    for (const aid of Object.values(overlay.words) as { parts: { arabic: string }[] }[]) for (const part of aid.parts) assert.doesNotMatch(part.arabic, undecoded);
  }
});

test("New spelling exceptions are tied to exact source forms and locations", () => {
  const rows: Record<string, string> = {
    "70:1:2": "(70:1:2:1)\tsaA^}ilN[\tN\tSTEM|POS:N|ACT|PCPL|LEM:saA^}il|ROOT:sAl|M|INDEF|NOM",
    "80:25:1": "(80:25:1:1)\t>an~a\tACC\tSTEM|POS:ACC|LEM:>an~|SP:<in~\n(80:25:1:2)\tA\tPRON\tSUFFIX|PRON:1P",
    "82:1:2": "(82:1:2:1)\t{l\tDET\tPREFIX|Al+\n(82:1:2:2)\ts~amaA^'u\tN\tSTEM|POS:N|LEM:samaA^'|ROOT:smw|F|NOM",
  };
  for (const key of Object.keys(rows) as (keyof typeof spellings)[]) {
    const [s, a, p] = key.split(":");
    const copy = structuredClone(library.surahs.find((v) => v.surah.number === +s)!);
    copy.ayahs = [structuredClone(verse(`${s}:${a}`))];
    copy.ayahs[0].words = [copy.ayahs[0].words.find((w) => w.position === +p)!];
    const w = copy.ayahs[0].words[0];
    assert.equal(w.arabic, spellings[key].provider);
    assert.equal(extractMorphology(rows[key], [copy])[key].alignmentSource, spellings[key].source);
    w.arabic = w.arabic.replace(/[سأا]/, "ب");
    assert.throws(() => extractMorphology(rows[key], [copy]), /Morphology\/text alignment/);
    w.arabic = spellings[key].provider;
    copy.ayahs[0].verseKey = "114:6";
    const unreviewed = rows[key].replaceAll(`(${s}:${a}:`, "(114:6:");
    assert.throws(() => extractMorphology(unreviewed, [copy]), /Morphology\/text alignment/);
  }
});

test("New attribute passages keep local textual cues and the two gloss clarifications keep provider fingerprints", () => {
  for (const k of ["58:7", "59:22", "59:23", "59:24", "62:1", "68:42", "69:17", "70:4", "74:31", "75:22", "75:23", "75:29", "76:9", "85:14", "85:15", "85:16", "87:1", "89:22", "92:20", "96:14"]) for (const w of verse(k).words) {
    assert.equal(w.memoryTrickType, "context");
    assert.doesNotMatch(w.memoryTrick, /নিজের দিকে আঙুল|একা থেকে দল|একই আরবি শব্দের আরেক রূপ/);
  }
  const aids = JSON.parse(readFileSync("src/data/source-word-clarifications.json", "utf8"));
  for (const [key, meaning] of [["70:4:4", "আল্লাহর দিকে"], ["75:23:3", "তাকিয়ে থাকবে"]]) {
    const [s, a, p] = key.split(":"); const v = verse(`${s}:${a}`); const w = v.words.find((w) => w.position === +p)!;
    assert.equal(aids.words[key].meaning, meaning);
    assert.equal(w.banglaMeaning, aids.words[key].sourceMeaning);
    assert(v.banglaTranslation.includes(meaning));
    assert(w.memoryTrick.includes(meaning));
    assert(w.memoryTrickSource!.includes("translations=213"));
  }
  assert.equal(morphology["68:1:1"].root, "");
  assert.equal(verse("68:1").words[0].memoryTrickType, "context");
});
