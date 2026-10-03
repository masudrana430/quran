import type { DetailedWordAid, SurahData } from "../types/quran";
export function attachDetailedAids(
  surahs: SurahData[],
  words: Record<string, DetailedWordAid>,
): SurahData[] {
  return surahs.map((s) => ({
    ...s,
    ayahs: s.ayahs.map((a) => ({
      ...a,
      words: a.words.map((w) => {
        const aid = words[`${a.verseKey}:${w.position}`];
        const original = w.banglaMeaning
          .replace(/<[^>]*>/g, "")
          .replace(/^['"\s]+|['"\s]+$/g, "");
        return aid && aid.arabic === w.arabic && aid.sourceMeaning === original
          ? { ...w, detailedAid: aid }
          : w;
      }),
    })),
  }));
}
