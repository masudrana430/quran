import surahMulkJson from "@/data/surah-mulk.json";
import type { SurahData } from "@/types/quran";

const surahMulk = surahMulkJson as SurahData;

const surahs: Record<number, SurahData> = {
  67: surahMulk,
};

export function getSurahByNumber(
  surahNumber: string | number
): SurahData | null {
  return surahs[Number(surahNumber)] ?? null;
}