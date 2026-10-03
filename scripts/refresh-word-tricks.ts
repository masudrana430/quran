import { readFile, writeFile } from "node:fs/promises";
import type { SurahData, QuranWord } from "../src/types/quran";
import roots from "../src/data/mnemonic-anchors.json";
import lemmas from "../src/data/mnemonic-lemmas.json";
import morphology from "../src/data/word-morphology.json";
const SOURCE = "Dr. Abu Bakr Muhammad Zakaria (Quran.com resource 213)";
type Morph = {
  root: string;
  lemma: string;
  tag: string;
  stemArabic: string;
  aligned: boolean;
};
const morph = morphology as Record<string, Morph>;
const rootHints = roots as Record<string, string>,
  lemmaHints = lemmas as Record<string, string>;
const norm = (s: string) =>
  s.replace(/[\p{M}\p{Z}\sـ]/gu, "").replace(/ٱ/g, "ا");
const meaning = (s: string) =>
  s.replace(/<[^>]*>/g, "").replace(/^['"\s]+|['"\s]+$/g, "");
export function rewriteTricks(
  surahs: SurahData[],
  suppliedMorph: Record<string, Morph> = morph,
) {
  const morph = suppliedMorph;
  const families = new Map<
    string,
    { key: string; word: QuranWord; meta: Morph }[]
  >();
  for (const s of surahs)
    for (const a of s.ayahs)
      for (const w of a.words) {
        const key = `${a.verseKey}:${w.position}`,
          meta = morph[key];
        if (!meta?.aligned) continue;
        const family = families.get(meta.lemma) ?? [];
        family.push({ key, word: w, meta });
        families.set(meta.lemma, family);
      }
  const counts: Record<string, number> = {};
  for (const s of surahs)
    for (const a of s.ayahs) {
      delete a.memoryAid;
      for (const w of a.words) {
        const key = `${a.verseKey}:${w.position}`,
          meta = morph[key];
        let type = "context",
          hint = "",
          source = `https://quran.com/${s.surah.number}/${a.ayahNumber}`;
        if (
          meta?.aligned &&
          (lemmaHints[meta.lemma] || (meta.root && rootHints[meta.root]))
        ) {
          type = "familiar";
          hint = lemmaHints[meta.lemma] || rootHints[meta.root];
          hint += ` এই রূপে আয়াতের অর্থ: «${meaning(w.banglaMeaning)}»।`;
          source = `https://corpus.quran.com/wordmorphology.jsp?location=(${key})`;
        } else {
          const relative = meta?.aligned
            ? families
                .get(meta.lemma)
                ?.find((x) => norm(x.word.arabic) !== norm(w.arabic))
            : undefined;
          if (relative) {
            type = "family";
            hint = `একই আরবি শব্দের আরেক রূপ «${relative.word.arabic}» (${meaning(relative.word.banglaMeaning)})। তার সঙ্গে «${w.arabic}» (${meaning(w.banglaMeaning)}) মিলিয়ে রাখুন—যুক্ত অংশ বা ক্রিয়ার রূপ বদলালে পুরো অর্থও বদলায়।`;
            source = `https://corpus.quran.com/wordmorphology.jsp?location=(${key})`;
          } else {
            const partner = a.words
              .filter((x) => x.position !== w.position)
              .sort(
                (x, y) =>
                  Math.abs(x.position - w.position) -
                  Math.abs(y.position - w.position),
              )[0];
            hint = partner
              ? `আয়াতের কাছের শব্দজোড়া মনে রাখুন: «${w.arabic}» = ${meaning(w.banglaMeaning)}; «${partner.arabic}» = ${meaning(partner.banglaMeaning)}। এই জোড়ার মধ্যে «${w.arabic}»-কে ${meaning(w.banglaMeaning)}-এর সঙ্গে যুক্ত রাখুন।`
              : `আয়াতের স্বতন্ত্র শব্দ «${w.arabic}» = ${meaning(w.banglaMeaning)}। পরিচিত উচ্চারণ «${w.transliteration}»-এর সঙ্গে এই শব্দার্থ মিলিয়ে রাখুন।`;
          }
        }
        // Exact requested examples, carefully distinguished from speculative etymology.
        if (key === "67:1:4") {
          hint =
            "আমরা বলি “নিজ মুলুকে রাজা”। মুলুক মানে দেশ বা রাজত্ব; مُلْك-এর কর্তৃত্ব/রাজত্ব অর্থটি সেই পরিচিত কথার সঙ্গে মিলিয়ে রাখুন।";
          type = "familiar";
        }
        if (key === "67:2:5") {
          hint =
            "পরিচিত “বালা” বিপদ বা পরীক্ষা মনে করায়। لِيَبْلُوَكُمْ-এ পরীক্ষা করার ক্রিয়াটি ب ل و শব্দপরিবারের; لِ উদ্দেশ্য বোঝায়, كُمْ তোমাদের—এখানে অর্থ: তোমাদের পরীক্ষা করার জন্য।";
          type = "familiar";
        }
        w.memoryTrick = hint;
        w.memoryTrickType = type as "familiar" | "family" | "context";
        w.memoryTrickSource = source;
        counts[type] = (counts[type] ?? 0) + 1;
      }
    }
  return counts;
}
async function main() {
  const library = JSON.parse(
    await readFile("src/data/quran-library.json", "utf8"),
  ) as { surahs: SurahData[] };
  // Refresh only existing verses; no new ayahs are added by this correction.
  for (const s of library.surahs) {
    const translations = new Map<number, string>();
    for (
      let page = 1;
      page <= Math.ceil(Math.max(...s.ayahs.map((a) => a.ayahNumber)) / 50);
      page++
    ) {
      const url = `https://api.quran.com/api/v4/verses/by_chapter/${s.surah.number}?translations=213&per_page=50&page=${page}`;
      const r = await fetch(url, { signal: AbortSignal.timeout(45000) });
      if (!r.ok) throw new Error(`Translation source ${r.status}`);
      const data = (await r.json()) as {
        verses: {
          verse_number: number;
          translations: { resource_id: number; text: string }[];
        }[];
      };
      for (const v of data.verses) {
        const t = v.translations.find((t) => t.resource_id === 213);
        if (t?.text.trim()) translations.set(v.verse_number, t.text);
      }
    }
    for (const a of s.ayahs) {
      const t = translations.get(a.ayahNumber);
      if (!t) throw new Error(`Missing Zakaria translation ${a.verseKey}`);
      a.banglaTranslation = t;
      a.translationSource = SOURCE;
    }
    console.log(`Zakaria translations prepared: ${s.surah.number}`);
  }
  const counts = rewriteTricks(library.surahs);
  await writeFile(
    "src/data/quran-library.json",
    JSON.stringify(library, null, 2) + "\n",
  );
  const progress = JSON.parse(await readFile("src/data/progress.json", "utf8"));
  progress.sources.translation = SOURCE;
  progress.sources.morphology =
    "Quranic Arabic Corpus v0.4 · Kais Dukes · https://corpus.quran.com";
  progress.updatedAt = new Date().toISOString();
  progress.mnemonicCoverage = counts;
  progress.learningAids =
    "Relational word mnemonics: familiar Bangla/Urdu/Hindi words where dependable; sourced Arabic form families or verse-local word associations otherwise. No verse-level chunking panel.";
  await writeFile(
    "src/data/progress.json",
    JSON.stringify(progress, null, 2) + "\n",
  );
  console.log(counts);
}
if (process.argv[1]?.endsWith("refresh-word-tricks.ts"))
  main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
