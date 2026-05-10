export type QuranWord = {
  position: number;
  arabic: string;
  transliteration: string;
  banglaMeaning: string;
  memoryTrick: string;
  root?: string;
};

export type Ayah = {
  ayahNumber: number;
  verseKey: string;
  arabic: string;
  banglaTranslation: string;
  audio?: string;
  words: QuranWord[];
};

export type SurahInfo = {
  number: number;
  nameEnglish: string;
  nameBangla: string;
  nameArabic: string;
  versesCount: number;
};

export type SurahData = {
  surah: SurahInfo;
  ayahs: Ayah[];
};