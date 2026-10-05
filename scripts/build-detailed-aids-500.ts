import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { readLibraryData } from "./library-data";
import { buildDetailedAids, segmentSnapshot } from "./build-detailed-aids";
import { nextProfile, nextMeaningPicture } from "../src/data/next-detailed-aid-profiles";
import type { Ayah, SurahData } from "../src/types/quran";
import type { WordMorph } from "./sync-morphology";

const START = "3:9";
const LIMIT = 500;
const API = "https://api.quran.com/api/v4";
const POLICY = "Lexical and grammar learning aids only; contextual meaning anchored to Zakaria 213. No independent tafsir/rulings, forced etymology, human analogy or imagined form for Allah.";

type ApiWord = {
  position: number;
  char_type_name: string;
  text_uthmani: string;
  translation: { text: string };
  transliteration?: { text: string };
};
type ApiVerse = {
  verse_key: string;
  text_uthmani: string;
  words: ApiWord[];
  translations?: { resource_id: number; text: string }[];
};

function plain(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/^['"\s]+|['"\s]+$/g, "");
}

export function selectNextFiveHundred(surahs: SurahData[]) {
  const all = surahs.flatMap((s) => s.ayahs);
  const start = all.findIndex((a) => a.verseKey === START);
  if (start < 0) throw new Error(`Missing detailed start ${START}`);
  const selected = all.slice(start, start + LIMIT);
  if (selected.length !== LIMIT) throw new Error(`Expected ${LIMIT} ayahs`);
  return selected;
}

async function fetchJson(url: string) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const text = await response.text();
  return { value: JSON.parse(text), hash: createHash("sha256").update(text).digest("hex") };
}

async function sourceInputs(selected: Ayah[]) {
  const wanted = new Set(selected.map((a) => a.verseKey));
  const chapters = [...new Set(selected.map((a) => Number(a.verseKey.split(":")[0])))];
  const bengali = new Map<string, ApiVerse>(), urdu = new Map<string, ApiVerse>();
  const sourceUrl = new Map<string, string>();
  const responses: { language: string; url: string; sha256: string }[] = [];
  for (const chapter of chapters) {
    for (const language of ["bn", "ur"] as const) {
      let page = 1, totalPages = 1;
      do {
        const url = `${API}/verses/by_chapter/${chapter}?language=${language}&words=true&fields=text_uthmani&word_fields=text_uthmani&translations=213&per_page=50&page=${page}`;
        const { value, hash } = await fetchJson(url);
        responses.push({ language, url, sha256: hash });
        for (const verse of value.verses as ApiVerse[])
          if (wanted.has(verse.verse_key)) {
            (language === "bn" ? bengali : urdu).set(verse.verse_key, verse);
            sourceUrl.set(`${language}:${verse.verse_key}`, url);
          }
        totalPages = value.pagination.total_pages;
        page++;
      } while (page <= totalPages);
    }
  }
  const urduGlosses: Record<string, { text: string; source: string; arabic: string }> = {};
  const verification: Record<string, { arabic: string; zakaria213: string; wordFields: string; wordCount: number; bengaliUrl: string; urduUrl: string }> = {};
  for (const ayah of selected) {
    const bn = bengali.get(ayah.verseKey), ur = urdu.get(ayah.verseKey);
    if (!bn || !ur) throw new Error(`Missing source verse ${ayah.verseKey}`);
    const bnWords = bn.words.filter((w) => w.char_type_name === "word");
    const urWords = ur.words.filter((w) => w.char_type_name === "word");
    const translation = bn.translations?.find((t) => t.resource_id === 213);
    if (bn.text_uthmani !== ayah.arabic || translation?.text !== ayah.banglaTranslation)
      throw new Error(`Arabic/Zakaria mismatch ${ayah.verseKey}`);
    if (bnWords.length !== ayah.words.length || urWords.length !== ayah.words.length)
      throw new Error(`Word count mismatch ${ayah.verseKey}`);
    for (const word of ayah.words) {
      const bw = bnWords[word.position - 1], uw = urWords[word.position - 1];
      if (bw.text_uthmani !== word.arabic || uw.text_uthmani !== word.arabic)
        throw new Error(`Word Arabic mismatch ${ayah.verseKey}:${word.position}`);
      if (plain(bw.translation.text) !== plain(word.banglaMeaning) || bw.transliteration?.text !== word.transliteration)
        throw new Error(`Word field mismatch ${ayah.verseKey}:${word.position}`);
      urduGlosses[`${ayah.verseKey}:${word.position}`] = {
        text: plain(uw.translation.text), source: sourceUrl.get(`ur:${ayah.verseKey}`)!, arabic: word.arabic,
      };
    }
    verification[ayah.verseKey] = {
      arabic: createHash("sha256").update(ayah.arabic).digest("hex"),
      zakaria213: createHash("sha256").update(ayah.banglaTranslation).digest("hex"),
      wordFields: createHash("sha256").update(JSON.stringify(bnWords.map((w) => [w.text_uthmani, plain(w.translation.text), w.transliteration?.text]))).digest("hex"),
      wordCount: ayah.words.length,
      bengaliUrl: sourceUrl.get(`bn:${ayah.verseKey}`)!,
      urduUrl: sourceUrl.get(`ur:${ayah.verseKey}`)!,
    };
  }
  return { urduGlosses, sourceVerification: { checkedAt: "2026-10-06", translationResource: 213, verseCount: selected.length, responses, verses: verification } };
}

async function main() {
  const library = readLibraryData(), selected = selectNextFiveHundred(library.surahs);
  const morphology = JSON.parse(await readFile("src/data/word-morphology.json", "utf8")) as Record<string, WordMorph>;
  const corpusPath = process.argv.find((a) => a.startsWith("--corpus="))?.slice(9);
  if (!corpusPath) throw new Error("Pass --corpus=<Quranic Arabic Corpus v0.4 text>");
  const corpus = await readFile(corpusPath, "utf8");
  const segments = segmentSnapshot(corpus, library.surahs, selected);
  const { urduGlosses, sourceVerification } = await sourceInputs(selected);
  const nextVerseKey = "6:13";
  const details = buildDetailedAids(library.surahs, morphology, urduGlosses, segments, {
    selected, profileForWord: nextProfile, nextVerseKey, fallbackPictures: false,
    expandedParts: true, fallbackPicture: nextMeaningPicture,
  });
  for (const [key, word] of Object.entries(details.words)) {
    const [chapter, verse] = key.split(":");
    word.sources.push({ label: "পূর্ণ বাংলা অনুবাদ: ড. আবু বকর মুহাম্মাদ যাকারিয়া", url: `https://quran.com/${chapter}/${verse}?translations=213` });
  }
  for (const ayah of selected) {
    if (!/(আল্লাহ|রব|তিনি)/.test(ayah.banglaTranslation)) continue;
    for (const sourceWord of ayah.words) {
      const word = details.words[`${ayah.verseKey}:${sourceWord.position}`];
      word.steps[0] = `«${sourceWord.arabic}» শুনলে «${word.anchor}» সূত্রটি মনে আনুন। শব্দটির লেখা ও বর্তমান «${word.meaning}» অর্থ মিলিয়ে পাশের শব্দের সম্পর্ক দেখুন; কোনো মানবীয় দৃশ্য বা আকৃতি কল্পনা করবেন না।`;
      word.caution = [word.caution, "এই আয়াতে আল্লাহর নাম, সিফাত বা কাজের প্রসঙ্গ থাকতে পারে; মানুষের সঙ্গে তুলনা বা কল্পিত আকৃতি ব্যবহার করবেন না। শব্দের সহায়িকা কোনো নিজস্ব তাফসীর যোগ করছে না।"].filter(Boolean).join(" ");
    }
  }
  Object.assign(details.review, { scope: "3:9–6:12", translationResource: 213, sourceVerification: "src/data/detailed-500-source-verification.json", policy: POLICY });
  await Promise.all([
    writeFile("src/data/detailed-word-aids-500.json", JSON.stringify(details) + "\n"),
    writeFile("src/data/detailed-500-segments.json", JSON.stringify(segments) + "\n"),
    writeFile("src/data/detailed-500-urdu-glosses.json", JSON.stringify(urduGlosses) + "\n"),
    writeFile("src/data/detailed-500-source-verification.json", JSON.stringify(sourceVerification, null, 2) + "\n"),
  ]);
  const progressPath = "src/data/progress.json";
  const progress = JSON.parse(await readFile(progressPath, "utf8"));
  const state = progress.detailedAidProgress;
  const verseKeys = selected.map((ayah) => ayah.verseKey);
  if (state.nextVerseKey === START) {
    state.completedVerseKeys.push(...verseKeys);
    state.completedCount += selected.length;
    state.wordCount += Object.keys(details.words).length;
    state.nextVerseKey = nextVerseKey;
    state.targetCanonicalAyahs = 6236;
    state.targetLastVerseKey = "114:6";
    state.sources.push(
      "src/data/detailed-word-aids-500.json",
      "src/data/detailed-500-segments.json",
      "src/data/detailed-500-urdu-glosses.json",
      "src/data/detailed-500-source-verification.json",
    );
    state.lastReview = {
      ayahCount: selected.length,
      wordCount: Object.keys(details.words).length,
      verseKeys,
      nextVerseKey,
      translationResource: 213,
      scope: "3:9–6:12",
      verifiedAt: "2026-10-06",
      sourceVerification: "src/data/detailed-500-source-verification.json",
      policy: POLICY,
    };
    await writeFile(progressPath, JSON.stringify(progress, null, 2) + "\n");
  } else if (
    state.nextVerseKey !== nextVerseKey ||
    !verseKeys.every((key: string) => state.completedVerseKeys.includes(key))
  ) throw new Error(`Unexpected detailed progress ${state.nextVerseKey}`);
  console.log({ ...details.review, verseKeys: undefined });
}

if (process.argv[1]?.endsWith("build-detailed-aids-500.ts")) main().catch((error) => { console.error(error); process.exitCode = 1; });
