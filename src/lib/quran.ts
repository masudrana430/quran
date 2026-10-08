import library from "@/data/quran-library";
import chapters from "@/data/chapters.json";
import progress from "@/data/progress.json";
import detailed from "@/data/detailed-word-aids.json";
import nextDetailed from "@/data/detailed-word-aids-next-200.json";
import continuation from "@/data/detailed-word-aids-continuation.json";
import detailedFiveHundred from "@/data/detailed-word-aids-500.json";
import detailedFiveHundredSecond from "@/data/detailed-word-aids-500-second.json";
import detailedFiveHundredThird from "@/data/detailed-word-aids-500-third.json";
import detailedFiveHundredFourth from "@/data/detailed-word-aids-500-fourth.json";
import detailedFiveHundredFifth from "@/data/detailed-word-aids-500-fifth.json";
import clarifications from "@/data/source-word-clarifications.json";
import { attachDetailedAids } from "./detailed-aids";
import type { DetailedWordAid, SurahData, SurahInfo } from "@/types/quran";
export const catalog = chapters as SurahInfo[];
export const surahs = attachDetailedAids(
  library.surahs as SurahData[],
  { ...detailed.words, ...nextDetailed.words, ...continuation.words, ...detailedFiveHundred.words, ...detailedFiveHundredSecond.words, ...detailedFiveHundredThird.words, ...detailedFiveHundredFourth.words, ...detailedFiveHundredFifth.words, ...clarifications.words } as Record<
    string,
    DetailedWordAid
  >,
);
export const detailedProgress = {
  ayahCount: detailed.review.ayahCount + nextDetailed.review.ayahCount + continuation.review.ayahCount + detailedFiveHundred.review.ayahCount + detailedFiveHundredSecond.review.ayahCount + detailedFiveHundredThird.review.ayahCount + detailedFiveHundredFourth.review.ayahCount + detailedFiveHundredFifth.review.ayahCount,
  wordCount: detailed.review.wordCount + nextDetailed.review.wordCount + continuation.review.wordCount + detailedFiveHundred.review.wordCount + detailedFiveHundredSecond.review.wordCount + detailedFiveHundredThird.review.wordCount + detailedFiveHundredFourth.review.wordCount + detailedFiveHundredFifth.review.wordCount,
  nextVerseKey: detailedFiveHundredFifth.review.nextVerseKey,
};
export const contentProgress = progress;
export function getSurahByNumber(value: string | number): SurahData | null {
  if (!/^[1-9]\d{0,2}$/.test(String(value))) return null;
  return surahs.find((s) => s.surah.number === Number(value)) ?? null;
}
export function getCatalogEntry(value: string) {
  return catalog.find((s) => String(s.number) === value);
}
export const directory = catalog.map((s) => ({
  ...s,
  availableAyahs:
    surahs.find((a) => a.surah.number === s.number)?.ayahs.length ?? 0,
}));
export const searchIndex = surahs.flatMap((s) =>
  s.ayahs.map((a) => ({
    verseKey: a.verseKey,
    arabic: a.arabic,
    translation: a.banglaTranslation,
    name: s.surah.nameEnglish,
  })),
);
