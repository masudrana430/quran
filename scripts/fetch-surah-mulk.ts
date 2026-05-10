import { writeFile } from "node:fs/promises";

type ApiWord = {
  position: number;
  char_type_name: string;
  text_uthmani?: string;
  text_indopak?: string;
  transliteration?: {
    text?: string;
  };
  translation?: {
    text?: string;
  };
};

type ApiVerse = {
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  words?: ApiWord[];
};

type ApiResponse = {
  verses: ApiVerse[];
};

const SURAH_NUMBER = 67;

const url =
  `https://api.quran.com/api/v4/verses/by_chapter/${SURAH_NUMBER}` +
  "?language=bn&words=true&fields=text_uthmani&per_page=30";

async function main() {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Surah Mulk: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as ApiResponse;

  const surahMulk = {
    surah: {
      number: 67,
      nameEnglish: "Al-Mulk",
      nameBangla: "আল-মুলক",
      nameArabic: "الملك",
      versesCount: 30,
    },
    ayahs: data.verses.map((ayah) => ({
      ayahNumber: ayah.verse_number,
      verseKey: ayah.verse_key,
      arabic: ayah.text_uthmani,
      banglaTranslation: "",
      audio: `/audio/surah-mulk/67-${ayah.verse_number}.mp3`,
      words: (ayah.words ?? [])
        .filter((word) => word.char_type_name === "word")
        .map((word) => ({
          position: word.position,
          arabic: word.text_uthmani ?? word.text_indopak ?? "",
          transliteration: word.transliteration?.text ?? "",
          banglaMeaning: word.translation?.text ?? "",
          memoryTrick: "",
          root: "",
        })),
    })),
  };

  await writeFile(
    "src/data/surah-mulk.json",
    JSON.stringify(surahMulk, null, 2),
    "utf8"
  );

  console.log("Done: src/data/surah-mulk.json created");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});