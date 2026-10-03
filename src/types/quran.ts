export type DetailedWordAid = {
  arabic: string;
  meaning: string;
  sourceMeaning: string;
  meaningNote: string | null;
  kind: "familiar" | "phrase" | "grammar" | "meaning";
  anchor: string;
  connection: string;
  steps: string[];
  parts: {
    arabic: string;
    meaning: string;
    role: "prefix" | "stem" | "suffix";
  }[];
  context: { arabic: string; meaning: string }[];
  urduMeaning: string | null;
  caution: string | null;
  sources: { label: string; url: string }[];
};
export type QuranWord = {
  position: number;
  arabic: string;
  transliteration: string;
  banglaMeaning: string;
  memoryTrick: string;
  memoryTrickType?: "familiar" | "family" | "context";
  memoryTrickSource?: string;
  detailedAid?: DetailedWordAid;
  root?: string;
  rootSource?: string;
  audio?: string;
};

export type Ayah = {
  ayahNumber: number;
  verseKey: string;
  arabic: string;
  banglaTranslation: string;
  audio?: string;
  words: QuranWord[];
  memoryAid?: string;
  pageNumber?: number;
  juzNumber?: number;
  translationSource?: string;
};

export type SurahInfo = {
  number: number;
  nameEnglish: string;
  nameBangla: string;
  nameArabic: string;
  versesCount: number;
  revelationPlace?: string;
  bismillahPre?: boolean;
};

export type SurahData = {
  surah: SurahInfo;
  ayahs: Ayah[];
};
