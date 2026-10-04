import assert from "node:assert/strict";
import test from "node:test";
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readLibraryData } from "./library-data";
import { extractMorphology } from "./sync-morphology";
import spellings from "../src/data/morphology-spellings.json";
import AboutPage from "../src/app/about/page";
import { attachDetailedAids } from "../src/lib/detailed-aids";
import type { DetailedWordAid } from "../src/types/quran";
import { rewriteTricks } from "./refresh-word-tricks";

const library = readLibraryData();
const catalog = JSON.parse(readFileSync("src/data/chapters.json", "utf8"));
const progress = JSON.parse(readFileSync("src/data/progress.json", "utf8"));
const verses = library.surahs.flatMap((s) => s.ayahs);
const verse = (key: string) => verses.find((v) => v.verseKey === key)!;

test("Final 106 additions complete all 114 surahs and exactly 6,236 canonical verse keys", () => {
  const canonical = catalog.flatMap((s: { number: number; versesCount: number }) => Array.from({ length: s.versesCount }, (_, i) => `${s.number}:${i + 1}`));
  assert.equal(library.surahs.length, 114);
  assert.equal(verses.length, 6236);
  assert.equal(new Set(verses.map((v) => v.verseKey)).size, 6236);
  assert.deepEqual(verses.map((v) => v.verseKey), canonical);
  assert.deepEqual(progress.completedVerseKeys, canonical);
  for (const s of library.surahs) assert.equal(s.ayahs.length, s.surah.versesCount);
  const request = progress.contentRequestHistory.find((r: { previousCount: number; completedCount: number }) => r.previousCount === 6130 && r.completedCount === 6236);
  assert(request);
  assert.equal(request.addedCount, 106);
  assert.equal(request.wordCount, 482);
  assert.equal(request.addedVerseKeys[0], "98:1");
  assert.equal(request.addedVerseKeys.at(-1), "114:6");
  assert.deepEqual(request.batches.flatMap((b: { added: string[] }) => b.added), request.addedVerseKeys);
  assert.equal(request.addedVerseKeys.reduce((n: number, key: string) => n + verse(key).words.length, 0), 482);
  assert.equal(request.fullyDetailedAyahsAdded, 0);
  assert.equal(progress.detailedAidProgress.completedCount, 300);
  assert.equal(progress.detailedAidProgress.nextVerseKey, "3:8");
});

test("108:1 spelling alignment permits only the documented position and exact source fingerprints", () => {
  const rows = "(108:1:1:1)\t<in~a\tACC\tSTEM|POS:ACC|LEM:<in~|SP:<in~\n(108:1:1:2)\tA^\tPRON\tSUFFIX|PRON:1P";
  const s = structuredClone(library.surahs.find((s) => s.surah.number === 108)!);
  s.ayahs = [structuredClone(verse("108:1"))];
  s.ayahs[0].words = [s.ayahs[0].words[0]];
  const w = s.ayahs[0].words[0];
  assert.equal(w.arabic, spellings["108:1:1"].provider);
  assert.equal(extractMorphology(rows, [s])["108:1:1"].alignmentSource, spellings["108:1:1"].source);
  w.arabic = "إِبَّآ";
  assert.throws(() => extractMorphology(rows, [s]), /Morphology\/text alignment/);
  w.arabic = spellings["108:1:1"].provider;
  s.ayahs[0].verseKey = "114:6";
  assert.throws(() => extractMorphology(rows.replaceAll("(108:1:", "(114:6:"), [s]), /Morphology\/text alignment/);
});

test("Final attribute cues stay textual and Lahab retains distinct name and flame meanings", () => {
  for (const key of ["99:5", "108:1", "112:1", "112:2", "112:3", "112:4", "113:1", "114:1", "114:2", "114:3"]) for (const w of verse(key).words) {
    assert.equal(w.memoryTrickType, "context");
    assert.doesNotMatch(w.memoryTrick, /আঙুল|একা থেকে দল|একই আরবি শব্দের আরেক রূপ/);
  }
  const name = verse("111:1").words[3];
  const flame = verse("111:3").words[3];
  assert.equal(name.arabic, flame.arabic);
  assert.equal(name.banglaMeaning, "লাহাবের");
  assert.equal(flame.banglaMeaning, "শিখা");
  assert.match(name.memoryTrick, /আবু লাহাব.*নাম/);
  assert.match(flame.memoryTrick, /আগুনের শিখা/);
  for (const w of [name, flame]) assert.match(w.memoryTrickSource!, /^https:\/\/corpus\.quran\.com\/wordmorphology/);
});

test("Completed coverage displays the current status without claiming all detailed aids are finished", () => {
  const html = renderToStaticMarkup(React.createElement(AboutPage));
  assert.match(html, /৬,২৩৬/);
  assert.match(html, /সব ১১৪টি সূরার আয়াত যোগ হয়েছে/);
  assert.match(html, /প্রথম ৩০০ আয়াতে/);
  assert.match(html, /শব্দের বিস্তারিত সহায়িকা ও উৎস পর্যালোচনার কাজ চলমান/);
  assert.doesNotMatch(html, /পরবর্তী ৩০০ আয়াত যোগ|মনে রাখার অনুশীলন/);
});

test("The final review clarifies an incorrect interrogative gloss and keeps failure distinct from religious misguidance", () => {
  const details = JSON.parse(readFileSync("src/data/source-word-clarifications.json", "utf8"));
  const original = verse("101:3").words[2];
  const rendered = attachDetailedAids(library.surahs, details.words as Record<string, DetailedWordAid>);
  const w = rendered.find((s) => s.surah.number === 101)!.ayahs[2].words[2];
  assert.equal(original.banglaMeaning, "মহাপ্রলয়");
  assert.equal(w.banglaMeaning, original.banglaMeaning);
  assert.equal(w.detailedAid!.meaning, "কী");
  assert.match(w.detailedAid!.meaningNote!, /প্রশ্নবাচক/);
  assert(verse("101:2").banglaTranslation.includes("কী"));
  for (const w of verse("101:3").words) {
    assert.equal(w.memoryTrickType, "context");
    assert.doesNotMatch(w.memoryTrick, /মহাপ্রলয়/);
  }
  const failure = verse("105:2").words[4];
  assert.equal(failure.banglaMeaning, "নিষ্ফলতার");
  assert.equal(failure.memoryTrickType, "context");
  assert.doesNotMatch(failure.memoryTrick, /দালালাত|পথ হারানো/);
  const copy = structuredClone(library.surahs.find((s) => s.surah.number === 101)!);
  copy.ayahs = [structuredClone(verse("101:3"))];
  for (const w of copy.ayahs[0].words) w.memoryTrick = "";
  rewriteTricks([copy]);
  assert.deepEqual(copy.ayahs[0], verse("101:3"));
});

test("An exhausted CLI import is a non-destructive no-op, with no verse, audio or morphology requests", () => {
  const fixture = mkdtempSync(join(tmpdir(), "quran-complete-"));
  try {
    const data = join(fixture, "src/data");
    cpSync("src/data/quran-surahs", join(data, "quran-surahs"), { recursive: true });
    for (const file of ["quran-library.json", "progress.json", "surah-mulk.json"]) cpSync(`src/data/${file}`, join(data, file));
    const files = ["quran-library.json", "progress.json", "surah-mulk.json", ...readdirSync(join(data, "quran-surahs")).map((f) => `quran-surahs/${f}`)];
    const hashes = () => files.map((f) => createHash("sha256").update(readFileSync(join(data, f))).digest("hex"));
    const before = hashes();
    const chapters = library.surahs.map(({ surah: s }) => ({ id: s.number, name_simple: s.nameEnglish, name_arabic: s.nameArabic, translated_name: { name: s.nameBangla }, verses_count: s.versesCount, revelation_place: s.revelationPlace, bismillah_pre: s.bismillahPre }));
    const mockFile = join(fixture, "mock-source.mjs");
    writeFileSync(mockFile, `globalThis.fetch = async (url) => { if (url !== "https://api.quran.com/api/v4/chapters?language=bn") throw new Error("Unexpected source request: " + url); return new Response(${JSON.stringify(JSON.stringify({ chapters }))}, {status:200}); };`);
    const child = spawnSync(process.execPath, ["--import", pathToFileURL(resolve("node_modules/tsx/dist/loader.mjs")).href, "--import", pathToFileURL(mockFile).href, resolve("scripts/import-batch.ts"), "--limit=300"], { cwd: fixture, encoding: "utf8", timeout: 30000 });
    assert.equal(child.status, 0, child.stderr);
    assert.match(child.stdout, /All 6,236 ayahs are already available/);
    assert.deepEqual(hashes(), before);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
