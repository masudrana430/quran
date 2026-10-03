export type QuranWord = {
  position: number;
  arabic: string;
  transliteration: string;
  banglaMeaning: string;
  memoryTrick: string;
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
