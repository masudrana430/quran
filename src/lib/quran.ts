import library from "@/data/quran-library.json";
import chapters from "@/data/chapters.json";
import progress from "@/data/progress.json";
import type { SurahData, SurahInfo } from "@/types/quran";
export const catalog = chapters as SurahInfo[];
export const surahs = library.surahs as SurahData[];
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
