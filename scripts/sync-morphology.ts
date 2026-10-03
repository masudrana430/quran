import { writeFile } from "node:fs/promises";
import type { SurahData } from "../src/types/quran";
export type WordMorph = {
  root: string;
  lemma: string;
  tag: string;
  stemArabic: string;
  aligned: boolean;
};
const MIRROR =
  "https://raw.githubusercontent.com/taziksh/quran-frequencies/main/data/quranic-corpus-morphology-0.4.txt";
const keys = "'|>&<}AbptvjHxd*rzs$SDTZEgfqklmnhwYyFNKaui~o`{";
const values = [
  "ء",
  "آ",
  "أ",
  "ؤ",
  "إ",
  "ئ",
  "ا",
  "ب",
  "ة",
  "ت",
  "ث",
  "ج",
  "ح",
  "خ",
  "د",
  "ذ",
  "ر",
  "ز",
  "س",
  "ش",
  "ص",
  "ض",
  "ط",
  "ظ",
  "ع",
  "غ",
  "ف",
  "ق",
  "ك",
  "ل",
  "م",
  "ن",
  "ه",
  "و",
  "ى",
  "ي",
  "ً",
  "ٌ",
  "ٍ",
  "َ",
  "ُ",
  "ِ",
  "ّ",
  "ْ",
  "ٰ",
  "ٱ",
];
const chars: Record<string, string> = {
  ...Object.fromEntries([...keys].map((c, i) => [c, values[i]])),
  "^": "ٓ",
  "@": "۟",
  "#": "ٔ",
  ":": "ۜ",
  _: "ـ",
  '"': "۠",
};
const arabic = (text: string) => [...text].map((c) => chars[c] ?? c).join("");
// Orthographic-only comparison ignores recitation signs, elongation and hamza glyph conventions.
const normalize = (text: string) =>
  text
    .replace(/ٱ/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/[^\u0621-\u064A]/g, "")
    .replace(/[ـء]/g, "");
export function extractMorphology(
  text: string,
  surahs: SurahData[],
): Record<string, WordMorph> {
  const wanted = new Map<string, string>(
    surahs.flatMap((s) =>
      s.ayahs.flatMap((a) =>
        a.words.map((w) => [`${a.verseKey}:${w.position}`, w.arabic] as const),
      ),
    ),
  );
  const rows = new Map<
    string,
    { form: string; tag: string; features: string }[]
  >();
  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith("(")) continue;
    const [location, form, tag, features] = line.split("\t");
    const key = location.slice(1, -1).split(":").slice(0, 3).join(":");
    if (!wanted.has(key)) continue;
    const list = rows.get(key) ?? [];
    list.push({ form, tag, features });
    rows.set(key, list);
  }
  const result: Record<string, WordMorph> = {};
  for (const [key, word] of wanted) {
    const segments = rows.get(key);
    const stem = segments?.find((s) => s.features.includes("STEM"));
    if (!segments || !stem) throw new Error(`Morphology missing ${key}`);
    if (
      normalize(arabic(segments.map((s) => s.form).join(""))) !==
      normalize(word)
    )
      throw new Error(`Morphology/text alignment ${key}`);
    result[key] = {
      root: stem.features.match(/ROOT:([^|]+)/)?.[1] ?? "",
      lemma: stem.features.match(/LEM:([^|]+)/)?.[1] ?? stem.form,
      tag: stem.tag,
      stemArabic: arabic(stem.form),
      aligned: true,
    };
  }
  return result;
}
export async function prepareMorphology(surahs: SurahData[]) {
  const r = await fetch(MIRROR, { signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error(`Morphology source ${r.status}`);
  const text = await r.text();
  if (!text.includes("Copyright (C) 2011 Kais Dukes"))
    throw new Error("Unexpected morphology source");
  const result = extractMorphology(text, surahs);
  const notice =
    text.split("LOCATION")[0] +
    "\nDerived word-level annotation subset. Source: https://corpus.quran.com/download/\nVerbatim download mirror: " +
    MIRROR +
    "\nUsed for relational memory cues, not as replacement Quran text.\n";
  return { result, notice };
}
export async function saveMorphology(
  prepared: Awaited<ReturnType<typeof prepareMorphology>>,
) {
  await writeFile(
    "src/data/word-morphology.json",
    JSON.stringify(prepared.result, null, 2) + "\n",
  );
  await writeFile("src/data/MORPHOLOGY-NOTICE.txt", prepared.notice);
}
