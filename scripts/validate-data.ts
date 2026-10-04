import spellings from "../src/data/morphology-spellings.json";
import { readLibraryData } from "./library-data";
import { readFileSync } from "node:fs";
import type { SurahData, SurahInfo } from "../src/types/quran";
export function validate(
  catalog: SurahInfo[],
  surahs: SurahData[],
  progress: { completedCount: number; completedVerseKeys: string[] },
) {
  const errors: string[] = [];
  if (
    catalog.length !== 114 ||
    catalog.reduce((n, s) => n + s.versesCount, 0) !== 6236
  )
    errors.push("Invalid full Quran catalog");
  const seen = new Set<string>();
  for (const s of surahs) {
    const info = catalog.find((c) => c.number === s.surah.number);
    if (!info || info.versesCount !== s.surah.versesCount)
      errors.push(`Unknown chapter ${s.surah.number}`);
    if (s.ayahs.length > s.surah.versesCount)
      errors.push(`Too many verses ${s.surah.number}`);
    for (const a of s.ayahs) {
      if (seen.has(a.verseKey)) errors.push(`Duplicate ${a.verseKey}`);
      seen.add(a.verseKey);
      if (
        a.verseKey !== `${s.surah.number}:${a.ayahNumber}` ||
        a.ayahNumber < 1 ||
        a.ayahNumber > s.surah.versesCount
      )
        errors.push(`Invalid key ${a.verseKey}`);
      if (
        !a.arabic.trim() ||
        !a.banglaTranslation.trim() ||
        !a.translationSource?.trim() ||
        !a.words.length
      )
        errors.push(`Incomplete verse ${a.verseKey}`);
      if (!a.audio?.startsWith("https://verses.quran.com/"))
        errors.push(`Invalid audio ${a.verseKey}`);
      if (
        a.translationSource !==
        "Dr. Abu Bakr Muhammad Zakaria (Quran.com resource 213)"
      )
        errors.push(`Wrong translation edition ${a.verseKey}`);
      if (a.memoryAid)
        errors.push(`Removed verse-level aid returned ${a.verseKey}`);
      // Provider word text can retain LRM/RLM display controls (e.g. 27:26:8).
      // Ignore these display controls during comparison without rewriting source text.
      const normalize = (text: string) => text.replace(/[\p{M}\p{Z}\sـ\u200e\u200f]/gu, "");
      if (
        normalize(a.arabic) !== normalize(a.words.map((w) => w.arabic).join("")) &&
        normalize(a.arabic) !== normalize(a.words.map((w) => {
          const spelling = (spellings as Record<string, { corpus: string; provider: string }>)[`${a.verseKey}:${w.position}`];
          return spelling?.provider === w.arabic ? spelling.corpus : w.arabic;
        }).join(""))
      )
        errors.push(`Word/verse alignment mismatch ${a.verseKey}`);
      const positions = new Set<number>();
      for (const w of a.words) {
        if (positions.has(w.position))
          errors.push(`Duplicate word ${a.verseKey}:${w.position}`);
        positions.add(w.position);
        if (
          !w.arabic.trim() ||
          !w.banglaMeaning.trim() ||
          !w.transliteration.trim() ||
          !w.memoryTrick.trim() ||
          !w.memoryTrickType ||
          !w.memoryTrickSource
        )
          errors.push(`Incomplete word ${a.verseKey}:${w.position}`);
        if (w.root?.trim() && !w.rootSource?.trim())
          errors.push(`Unsourced root ${a.verseKey}:${w.position}`);
      }
    }
  }
  if (
    seen.size !== progress.completedCount ||
    seen.size !== progress.completedVerseKeys.length ||
    progress.completedVerseKeys.some((k) => !seen.has(k))
  )
    errors.push("Progress mismatch");
  return errors;
}
if (process.argv[1]?.endsWith("validate-data.ts")) {
  const catalog = JSON.parse(readFileSync("src/data/chapters.json", "utf8"));
  const library = readLibraryData();
  const progress = JSON.parse(readFileSync("src/data/progress.json", "utf8"));
  const errors = validate(catalog, library.surahs, progress);
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else
    console.log(
      `Validated ${progress.completedCount} distinct ayahs with Arabic, Bangla, sourced translation, learning aids and audio.`,
    );
}
