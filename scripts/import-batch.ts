import { readFile, writeFile, rename } from "node:fs/promises";
import type { Ayah, SurahData, SurahInfo } from "../src/types/quran";
import { validate } from "./validate-data";
const API = "https://api.quran.com/api/v4";
const EDITION = "Taisirul Quran · Tawheed Publication (Quran.com resource 161)";
type ApiWord = {
  position: number;
  char_type_name: string;
  text_uthmani: string;
  audio_url?: string;
  translation: { text: string; language_name: string };
  transliteration: { text: string };
};
type ApiVerse = {
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  page_number: number;
  juz_number: number;
  words: ApiWord[];
  translations: { resource_id: number; text: string }[];
};
type ApiChapter = {
  id: number;
  name_simple: string;
  name_arabic: string;
  translated_name: { name: string };
  verses_count: number;
  revelation_place: string;
  bismillah_pre: boolean;
};
type Library = { surahs: SurahData[] };
async function get<T>(path: string): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${API}${path}`, {
        signal: AbortSignal.timeout(45000),
      });
      if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
      return (await res.json()) as T;
    } catch (error) {
      if (attempt === 2) throw error;
    }
  }
  throw new Error("Source unavailable");
}
async function readLibrary(): Promise<Library> {
  try {
    return JSON.parse(await readFile("src/data/quran-library.json", "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      return { surahs: [] };
    throw error;
  }
}
async function atomic(path: string, data: unknown) {
  await writeFile(`${path}.tmp`, JSON.stringify(data, null, 2) + "\n");
  await rename(`${path}.tmp`, path);
}
function mapVerse(v: ApiVerse, audio?: string): Ayah {
  const translation = v.translations.find((t) => t.resource_id === 161)?.text;
  if (!translation?.trim() || !v.text_uthmani?.trim())
    throw new Error(`Missing verse text ${v.verse_key}`);
  const words = v.words
    .filter((w) => w.char_type_name === "word")
    .map((w) => {
      if (
        !w.text_uthmani?.trim() ||
        !w.translation?.text?.trim() ||
        !w.transliteration?.text?.trim() ||
        w.translation.language_name !== "bengali"
      )
        throw new Error(
          `Missing sourced word data ${v.verse_key}:${w.position}`,
        );
      return {
        position: w.position,
        arabic: w.text_uthmani,
        banglaMeaning: w.translation.text,
        transliteration: w.transliteration.text,
        memoryTrick: `“${w.text_uthmani}” শব্দটি দেখে “${w.translation.text}” অর্থটি বলুন। এরপর অর্থ ঢেকে আবার মনে করুন; আয়াতের আগের ও পরের শব্দের সঙ্গে মিলিয়ে পড়ুন।`,
        ...(w.audio_url
          ? { audio: `https://audio.qurancdn.com/${w.audio_url}` }
          : {}),
      };
    });
  if (!words.length) throw new Error(`No words ${v.verse_key}`);
  const chunks = Array.from({ length: Math.ceil(words.length / 3) }, (_, i) =>
    words
      .slice(i * 3, i * 3 + 3)
      .map((w) => w.arabic)
      .join(" "),
  );
  return {
    ayahNumber: v.verse_number,
    verseKey: v.verse_key,
    arabic: v.text_uthmani,
    banglaTranslation: translation,
    translationSource: EDITION,
    pageNumber: v.page_number,
    juzNumber: v.juz_number,
    words,
    ...(audio ? { audio } : {}),
    memoryAid: `আয়াতটি ${chunks.length}টি ছোট অংশে অনুশীলন করুন: ${chunks.join(" | ")}। প্রতিটি অংশ অডিও শুনে পড়ুন, তারপর না দেখে বলুন। অংশগুলো ক্রমানুসারে জুড়ে পুরো আয়াত পড়ুন। আজ পরে, আগামীকাল এবং এক সপ্তাহ পরে আবার অনুশীলন করুন।`,
  };
}
async function main() {
  const limit = Number(
    process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 300,
  );
  if (!Number.isInteger(limit) || limit < 1 || limit > 300)
    throw new Error("Batch limit must be 1–300");
  const repair = process.argv.includes("--repair-mulk");
  const [{ chapters }, library] = await Promise.all([
    get<{ chapters: ApiChapter[] }>("/chapters?language=bn"),
    readLibrary(),
  ]);
  if (
    chapters.length !== 114 ||
    chapters.reduce((n, c) => n + c.verses_count, 0) !== 6236
  )
    throw new Error("Invalid catalog");
  const catalog: SurahInfo[] = chapters.map((c) => ({
    number: c.id,
    nameEnglish: c.name_simple,
    nameBangla: c.translated_name.name,
    nameArabic: c.name_arabic,
    versesCount: c.verses_count,
    revelationPlace: c.revelation_place,
    bismillahPre: c.bismillah_pre,
  }));
  const before = new Set(
    library.surahs.flatMap((s) => s.ayahs.map((a) => a.verseKey)),
  );
  const added: string[] = [],
    repaired: string[] = [];
  const selected = catalog.filter(
    (c) =>
      (library.surahs.find((s) => s.surah.number === c.number)?.ayahs.length ??
        0) < c.versesCount,
  );
  selected.sort((a, b) =>
    repair && (a.number === 67 || b.number === 67)
      ? a.number === 67
        ? -1
        : 1
      : a.number - b.number,
  );
  for (const info of selected) {
    const isRepair = repair && info.number === 67;
    if (!isRepair && added.length >= limit) break;
    let surah = library.surahs.find((s) => s.surah.number === info.number);
    if (!surah) {
      surah = { surah: info, ayahs: [] };
      library.surahs.push(surah);
    }
    const existing = new Set(surah.ayahs.map((a) => a.ayahNumber));
    const wanted = Array.from({ length: info.versesCount }, (_, i) => i + 1)
      .filter((n) => !existing.has(n))
      .slice(0, isRepair ? info.versesCount : limit - added.length);
    const pages = [...new Set(wanted.map((n) => Math.ceil(n / 50)))];
    for (const page of pages) {
      const [{ verses }, { audio_files }] = await Promise.all([
        get<{ verses: ApiVerse[] }>(
          `/verses/by_chapter/${info.number}?language=bn&words=true&fields=text_uthmani&word_fields=text_uthmani&translations=161&per_page=50&page=${page}`,
        ),
        get<{ audio_files: { verse_key: string; url: string }[] }>(
          `/recitations/7/by_chapter/${info.number}?per_page=50&page=${page}`,
        ),
      ]);
      for (const n of wanted.filter((n) => Math.ceil(n / 50) === page)) {
        const v = verses.find((v) => v.verse_number === n);
        if (!v || v.verse_key !== `${info.number}:${n}`)
          throw new Error(`Source missing ${info.number}:${n}`);
        const audio = audio_files.find((a) => a.verse_key === v.verse_key)?.url;
        surah.ayahs.push(
          mapVerse(v, audio ? `https://verses.quran.com/${audio}` : undefined),
        );
        (isRepair ? repaired : added).push(v.verse_key);
      }
      console.log(`Prepared ${info.number}, page ${page}`);
    }
    surah.ayahs.sort((a, b) => a.ayahNumber - b.ayahNumber);
  }
  library.surahs.sort((a, b) => a.surah.number - b.surah.number);
  const keys = library.surahs.flatMap((s) => s.ayahs.map((a) => a.verseKey));
  if (
    new Set(keys).size !== keys.length ||
    [...before].some((k) => !keys.includes(k))
  )
    throw new Error("Duplicate or lost ayahs");
  const integrity = validate(catalog, library.surahs, {
    completedCount: keys.length,
    completedVerseKeys: keys,
  });
  if (integrity.length) throw new Error(integrity.join("\n"));
  await atomic("src/data/chapters.json", catalog);
  await atomic("src/data/quran-library.json", library);
  await atomic("src/data/progress.json", {
    updatedAt: new Date().toISOString(),
    totalAyahs: 6236,
    completedCount: keys.length,
    completedVerseKeys: keys,
    lastBatch: { added, repaired },
    sources: {
      provider: "Quran.com / Quran Foundation",
      api: API,
      translation: EDITION,
      wordTranslation: "Quran.com Bengali word translations (API language=bn)",
      reciter: "Mishary Rashid Alafasy (Quran.com recitation 7)",
    },
    learningAids:
      "Generated text-linked retrieval practice and chunking. Learning aids, not translation, tafsir, tajwid instruction or verified etymology.",
    originalDraft:
      "src/data/surah-mulk.json retained unchanged. Unsourced roots are not published in the new reader.",
  });
  console.log(
    `Added ${added.length}; repaired ${repaired.length}; total ${keys.length}`,
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
