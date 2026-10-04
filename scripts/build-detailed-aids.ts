import { readFile, writeFile } from "node:fs/promises";
import type { SurahData, DetailedWordAid } from "../src/types/quran";
import { arabic, extractMorphology, type WordMorph } from "./sync-morphology";
import {
  rootProfiles,
  lemmaProfiles,
  rootPictures,
  type AidProfile,
} from "../src/data/detailed-aid-profiles";
import {
  specializedProfiles,
  wordOverrides,
} from "../src/data/detailed-aid-overrides";

export type Segment = { form: string; tag: string; features: string };
type UrduGloss = { text: string | null; source: string; arabic: string };
const plain = (s: string) =>
  s.replace(/<[^>]*>/g, "").replace(/^['"\s]+|['"\s]+$/g, "");
const clarifications: Record<string, { meaning: string; note: string }> = {
  "2:26:39": {
    meaning: "অবাধ্য ফাসিকদেরকে",
    note: "فَاسِق অবাধ্য বা আনুগত্যের সীমা লঙ্ঘনকারী। মূল শব্দার্থের স্বত্বত্যাগ কথাটি এ অর্থ বোঝায় না; এখানে ফাসিক অর্থটি মনে রাখুন।",
  },
  "1:7:6": {
    meaning: "যাদের ওপর ক্রোধ/গযব এসেছে",
    note: "غَضَب ক্রোধ; مَغْضُوب ক্রোধপ্রাপ্ত। লানত/অভিশাপের রূপের সঙ্গে এক না করে এ অর্থটি মনে রাখুন।",
  },
  "2:49:12": {
    meaning: "তোমাদের নারীদের",
    note: "نِسَاء নারীরা, كُمْ তোমাদের। যাকারিয়ার পূর্ণ অনুবাদেও এখানে নারীদের বলা হয়েছে।",
  },
  "2:60:11": {
    meaning: "দুই (عَشْرَةَ-সহ এখানে বারো)",
    note: "এখানে সংখ্যাটি দুই শব্দে: اثْنَتَا + عَشْرَةَ = বারো। শুধু প্রথম শব্দকে স্বতন্ত্রভাবে বারো ভাববেন না।",
  },
  "2:83:12": {
    meaning: "এবং সম্পর্কের অধিকারী (পরের শব্দসহ: নিকট আত্মীয়)",
    note: "وَ এবং; ذِي সম্পর্কের অধিকারী। ذِي الْقُرْبَى একসঙ্গে নিকট আত্মীয়ের সম্পর্ক বোঝায়; শুধু এবং বললে মূল অংশটি শেখা হয় না।",
  },
};
const dictionarySources = new Set([
  "https://www.rekhtadictionary.com/meaning-of-rahmat",
  "https://rekhtadictionary.com/meaning-of-maalik",
  "https://www.rekhtadictionary.com/meaning-of-kitaab",
  "https://www.rekhtadictionary.com/meaning-of-iimaan-6",
  "https://rekhtadictionary.com/meaning-of-qalb",
  "https://www.rekhtadictionary.com/meaning-of-hidaayat",
  "https://rekhtadictionary.com/meaning-of-ilm",
  "https://www.rekhtadictionary.com/meaning-of-zulmat",
  "https://www.rekhtadictionary.com/meaning-of-zaalim",
  "https://www.rekhtadictionary.com/meaning-of-takliif",
  "https://www.rekhtadictionary.com/meaning-of-qabz?lang=ur",
]);
export function firstHundred(surahs: SurahData[]) {
  const keys = [
    ...Array.from({ length: 7 }, (_, i) => `1:${i + 1}`),
    ...Array.from({ length: 93 }, (_, i) => `2:${i + 1}`),
  ];
  const all = new Map(
    surahs.flatMap((s) => s.ayahs).map((a) => [a.verseKey, a]),
  );
  return keys.map((key) => {
    const ayah = all.get(key);
    if (!ayah) throw new Error(`Missing first-100 ayah ${key}`);
    return ayah;
  });
}
export function nextTwoHundred(surahs: SurahData[]) {
  const keys = [
    ...Array.from({ length: 193 }, (_, i) => `2:${i + 94}`),
    ...Array.from({ length: 7 }, (_, i) => `3:${i + 1}`),
  ];
  const all = new Map(
    surahs.flatMap((s) => s.ayahs).map((a) => [a.verseKey, a]),
  );
  return keys.map((key) => {
    const ayah = all.get(key);
    if (!ayah) throw new Error(`Missing next-200 ayah ${key}`);
    return ayah;
  });
}
export function segmentSnapshot(
  text: string,
  surahs: SurahData[],
  selected = firstHundred(surahs),
) {
  // Check source/word alignment before using any segmentation annotation.
  extractMorphology(text, [{ surah: surahs[0].surah, ayahs: selected }]);
  const wanted = new Set(
    selected.flatMap((a) => a.words.map((w) => `${a.verseKey}:${w.position}`)),
  );
  const result: Record<string, Segment[]> = {};
  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith("(")) continue;
    const [location, form, tag, features] = line.split("\t");
    const key = location.slice(1, -1).split(":").slice(0, 3).join(":");
    if (wanted.has(key)) (result[key] ??= []).push({ form, tag, features });
  }
  return result;
}
const pronouns: Record<string, string> = {
  "1S": "আমি/আমার",
  "1P": "আমরা/আমাদের",
  "2MS": "তুমি/তোমার",
  "2FS": "তুমি/তোমার",
  "2D": "তোমরা দুজন/তোমাদের দুজনের",
  "2MP": "তোমরা/তোমাদের",
  "2FP": "তোমরা/তোমাদের",
  "3MS": "তিনি/সে/তা বা তার",
  "3FS": "সে/তা বা তার",
  "3D": "তারা দুজন/তাদের দুজনের",
  "3MD": "তারা দুজন/তাদের দুজনের",
  "3FD": "তারা দুজন/তাদের দুজনের",
  "3MP": "তারা/তাদের",
  "3FP": "তারা/তাদের",
};
export function explainParts(segments: Segment[], expanded = false) {
  return segments.map((s) => {
    let meaning = "শব্দের প্রধান অংশ";
    if (s.features.startsWith("PREFIX")) {
      if (s.features.includes("Al+")) meaning = "নির্দিষ্ট পরিচয়ের অংশ";
      else if (s.features.includes("bi+"))
        meaning = "দ্বারা/সঙ্গে/তে—প্রসঙ্গ অনুযায়ী";
      else if (s.features.includes("ka+")) meaning = "মতো/সদৃশ";
      else if (s.features.includes("ya+")) meaning = "হে—ডাকার অংশ";
      else if (s.features.includes("A:INTG+")) meaning = "কি—প্রশ্নের অংশ";
      else if (s.features.includes("l:EMPH+"))
        meaning = "নিশ্চয়/অবশ্যই—জোর দেওয়ার অংশ";
      else if (expanded && s.features.includes("l:PRP+"))
        meaning = "যাতে/উদ্দেশ্যে—কাজের উদ্দেশ্য";
      else if (expanded && s.features.includes("l:IMPV+"))
        meaning = "যেন করে/করুক—নির্দেশের অংশ";
      else if (expanded && s.features.includes("sa+"))
        meaning = "করবে—ভবিষ্যতের অংশ";
      else if (s.features.includes("l:P+"))
        meaning = "জন্য/কে/সম্পর্কে—প্রসঙ্গ অনুযায়ী";
      else if (s.features.startsWith("PREFIX|w:"))
        meaning =
          s.tag === "CONJ"
            ? "এবং—সংযোগের অংশ"
            : "অবস্থা/বক্তব্যের সংযোগ; বর্তমান অর্থে মিলিয়ে নিন";
      else if (s.features.startsWith("PREFIX|f:"))
        meaning = "অতঃপর/ফলে/তাই—প্রসঙ্গ অনুযায়ী সংযোগ";
      else meaning = "যুক্ত অব্যয়; পুরো শব্দার্থে এর সম্পর্ক দেখুন";
    } else if (s.features.startsWith("SUFFIX")) {
      const person = s.features.match(/PRON:([^|]+)/)?.[1];
      meaning =
        person && pronouns[person]
          ? `যুক্ত সর্বনাম/ক্রিয়ার ব্যক্তিসূচক অংশ: ${pronouns[person]}—সম্পূর্ণ শব্দার্থে সম্পর্ক মিলিয়ে নিন`
          : "যুক্ত শেষাংশ; পুরো শব্দের রূপে এর সম্পর্ক দেখুন";
    }
    return {
      arabic: arabic(s.form),
      meaning,
      role: s.features.startsWith("PREFIX")
        ? ("prefix" as const)
        : s.features.startsWith("SUFFIX")
          ? ("suffix" as const)
          : ("stem" as const),
    };
  });
}
export function buildDetailedAids(
  surahs: SurahData[],
  morphology: Record<string, WordMorph>,
  urdu: Record<string, UrduGloss>,
  snapshots: Record<string, Segment[]>,
  options: {
    selected?: ReturnType<typeof firstHundred>;
    profileForWord?: (
      key: string,
      meta: WordMorph,
      meaning: string,
    ) => AidProfile | undefined;
    clarifications?: Record<string, { meaning: string; note: string }>;
    nextVerseKey?: string;
    fallbackPictures?: boolean;
    expandedParts?: boolean;
    fallbackPicture?: (
      key: string,
      meta: WordMorph,
      meaning: string,
    ) => string | undefined;
  } = {},
) {
  const selected = options.selected ?? firstHundred(surahs);
  const words: Record<string, DetailedWordAid> = {};
  const kinds: Record<string, number> = {};
  for (const ayah of selected)
    for (const word of ayah.words) {
      const key = `${ayah.verseKey}:${word.position}`,
        meta = morphology[key],
        segments = snapshots[key],
        u = urdu[key];
      const stem = segments?.find((s) => s.features.includes("STEM"));
      if (!meta?.aligned || !stem || !u)
        throw new Error(`Missing sourced detail inputs ${key}`);
      if (u.arabic !== word.arabic)
        throw new Error(`Urdu/text alignment ${key}`);
      const lemma = stem.features.match(/LEM:([^|]+)/)?.[1] ?? stem.form;
      const root = stem.features.match(/ROOT:([^|]+)/)?.[1] ?? "";
      if (lemma !== meta.lemma || root !== meta.root)
        throw new Error(`Morphology mismatch ${key}`);
      const sourceMeaning = plain(word.banglaMeaning),
        clarification = options.clarifications?.[key] ?? clarifications[key];
      const mean = clarification?.meaning ?? sourceMeaning;
      let profile: AidProfile | undefined = options.profileForWord
        ? options.profileForWord(key, meta, mean)
        : wordOverrides[key] ||
          specializedProfiles[meta.lemma] ||
          lemmaProfiles[meta.lemma] ||
          rootProfiles[meta.root];
      if (!profile) {
        profile = {
          kind: "meaning",
          anchor: u.text
            ? `বাংলা অর্থ ↔ উর্দু ${plain(u.text)}`
            : `বাংলা অর্থ: ${mean}`,
          explanation: u.text
            ? `এই জায়গায় উর্দুর «${plain(u.text)}» এবং বাংলার «${mean}» একই আরবি শব্দের অর্থ ধরতে সাহায্য করে। এটি অর্থের তুলনা; ধ্বনি মিলে যাওয়া বা একই উৎসের শব্দ হওয়ার দাবি নয়।`
            : `এখানে বাংলার «${mean}» এবং আয়াতের পাশের শব্দ দিয়ে সম্পর্ক রাখুন। নির্ভরযোগ্য পরিচিত শব্দের মিল না থাকলে মিল বানানোর প্রয়োজন নেই।`,
          picture:
            options.fallbackPicture?.(key, meta, mean) ??
            (options.fallbackPictures === false
              ? undefined
              : rootPictures[meta.root]) ??
            `আয়াতের এই জায়গায় «${mean}» কথাটি কী সম্পর্ক বলছে ভাবুন; নিচের কাছের শব্দগুলো দিয়ে অর্থটি নির্দিষ্ট করুন।`,
        };
      }
      const parts = explainParts(segments, options.expandedParts);
      const formNote =
        parts.length > 1
          ? `শব্দটির ${parts
              .filter((p) => p.role !== "stem")
              .map((p) => `«${p.arabic}» (${p.meaning})`)
              .join(
                "; ",
              )} অংশও অর্থ বহন করছে। তাই শুধু পরিচিত সূত্রটি নয়, পুরো «${word.arabic}» = «${mean}» মনে রাখুন।`
          : meta.tag === "V"
            ? `এটি ${stem.features.includes("|IMPV") ? "আদেশের" : stem.features.includes("|PERF") ? "সম্পন্ন কাজের" : "অসম্পূর্ণ/বর্তমান বা ভবিষ্যৎ কাজের"} ক্রিয়ার রূপ। এখানে কে কী করছে তা «${mean}» শব্দার্থ থেকে ধরুন; শুধু একটি নামের অর্থ বসাবেন না।`
            : `এখানে পুরো রূপটি «${word.arabic}» (${word.transliteration}) = «${mean}»। একই পরিবারের অন্য রূপের সঙ্গে এই নির্দিষ্ট রূপ ও অর্থ আলাদা করে রাখুন।`;
      const i = ayah.words.indexOf(word),
        start = Math.max(0, Math.min(i - 1, ayah.words.length - 3));
      const contextWords = ayah.words.slice(start, start + 3);
      const context = contextWords.map((w) => ({
        arabic: w.arabic,
        meaning:
          options.clarifications?.[`${ayah.verseKey}:${w.position}`]?.meaning ??
          clarifications[`${ayah.verseKey}:${w.position}`]?.meaning ??
          plain(w.banglaMeaning),
      }));
      const connection =
        profile.explanation + ` এই আয়াতে সম্পূর্ণ শব্দের অর্থ: «${mean}»।`;
      const sources = [
        {
          label: "আরবি রূপ ও শব্দের সম্পর্ক",
          url: `https://corpus.quran.com/wordmorphology.jsp?location=(${key})`,
        },
      ];
      if (u.text)
        sources.push({ label: "উর্দু শব্দার্থ: Quran.com", url: u.source });
      if (profile.dictionary) {
        if (!dictionarySources.has(profile.dictionary))
          throw new Error(`Unreviewed dictionary URL ${key}`);
        sources.push({
          label: "পরিচিত শব্দ: Rekhta Dictionary",
          url: profile.dictionary,
        });
      }
      words[key] = {
        arabic: word.arabic,
        meaning: mean,
        sourceMeaning,
        meaningNote: clarification?.note ?? null,
        kind: profile.kind,
        anchor: profile.anchor,
        connection,
        steps: [
          `«${word.arabic}» শুনলে আগে «${profile.anchor}» সূত্রটি মনে আনুন। ${profile.picture}`,
          formNote,
          `পাশের «${contextWords.map((w) => w.arabic).join(" ")}» অংশে শব্দটি কোথায় আছে দেখুন। নীচের প্রতিটি শব্দের অর্থ আলাদা করে মিলিয়ে এই শব্দের সম্পর্কটি রাখুন; পুরো আয়াতের বক্তব্য যাকারিয়ার অনুবাদে পড়ুন।`,
        ],
        parts,
        context,
        urduMeaning: u.text ? plain(u.text) : null,
        caution: profile.caution ?? null,
        sources,
      };
      kinds[profile.kind] = (kinds[profile.kind] ?? 0) + 1;
    }
  return {
    review: {
      version: 1,
      verseKeys: selected.map((a) => a.verseKey),
      ayahCount: selected.length,
      wordCount: Object.keys(words).length,
      coverage: kinds,
      urduGlossCount: Object.values(urdu).filter((u) => u.text).length,
      urduUnavailableKeys: Object.entries(urdu)
        .filter(([, u]) => !u.text)
        .map(([k]) => k),
      nextVerseKey: options.nextVerseKey ?? "2:94",
      method:
        "Authored Bangla/Urdu associations, source-aligned Urdu glosses and Corpus segmentation. Meaning analogies are distinguished from familiar words. Not a scholarly certification.",
    },
    words,
  };
}
async function main() {
  const library = JSON.parse(
    await readFile("src/data/quran-library.json", "utf8"),
  );
  const morphology = JSON.parse(
    await readFile("src/data/word-morphology.json", "utf8"),
  );
  const urdu = JSON.parse(
    await readFile("src/data/first-100-urdu-glosses.json", "utf8"),
  );
  const sourcePath = process.argv
    .find((a) => a.startsWith("--corpus="))
    ?.slice(9);
  const snapshots = sourcePath
    ? segmentSnapshot(await readFile(sourcePath, "utf8"), library.surahs)
    : JSON.parse(await readFile("src/data/first-100-segments.json", "utf8"));
  const details = buildDetailedAids(
    library.surahs,
    morphology,
    urdu,
    snapshots,
  );
  await writeFile(
    "src/data/first-100-segments.json",
    JSON.stringify(snapshots, null, 2) + "\n",
  );
  await writeFile(
    "src/data/detailed-word-aids.json",
    JSON.stringify(details, null, 2) + "\n",
  );
  console.log(details.review);
}
if (process.argv[1]?.endsWith("build-detailed-aids.ts"))
  main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
