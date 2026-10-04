import { readFile, writeFile } from "node:fs/promises";
import {
  buildDetailedAids,
  nextTwoHundred,
  segmentSnapshot,
} from "./build-detailed-aids";
import {
  nextProfile,
  nextClarifications,
  nextMeaningPicture,
} from "../src/data/next-detailed-aid-profiles";
import type { SurahData } from "../src/types/quran";
import type { WordMorph } from "./sync-morphology";
export function buildNextDetailedAids(
  surahs: SurahData[],
  morphology: Record<string, WordMorph>,
  urdu: Parameters<typeof buildDetailedAids>[2],
  segments: Parameters<typeof buildDetailedAids>[3],
) {
  const details = buildDetailedAids(surahs, morphology, urdu, segments, {
    selected: nextTwoHundred(surahs),
    profileForWord: nextProfile,
    clarifications: nextClarifications,
    nextVerseKey: "3:8",
    fallbackPictures: false,
    expandedParts: true,
    fallbackPicture: nextMeaningPicture,
  });
  for (const [key, w] of Object.entries(details.words)) {
    const [chapter, verse] = key.split(":");
    w.sources.push({
      label: "পূর্ণ বাংলা অনুবাদ: ড. আবু বকর মুহাম্মাদ যাকারিয়া",
      url: `https://quran.com/${chapter}/${verse}?translations=213`,
    });
  }
  return {
    ...details,
    review: {
      ...details.review,
      scope: "2:94–2:286; 3:1–3:7",
      policy:
        "Word-learning only; Zakaria 213 full translation retained. No invented tafsir, anthropomorphic imagery for Allah, or inferred religious rulings. Dictionaries support language usage only.",
    },
  };
}
async function main() {
  const read = async (p: string) =>
    JSON.parse(await readFile(`src/data/${p}.json`, "utf8"));
  const library = await read("quran-library"),
    morph = await read("word-morphology"),
    urdu = await read("next-200-urdu-glosses");
  const path = process.argv.find((a) => a.startsWith("--corpus="))?.slice(9);
  const segments = path
    ? segmentSnapshot(
        await readFile(path, "utf8"),
        library.surahs,
        nextTwoHundred(library.surahs),
      )
    : await read("next-200-segments");
  const details = buildNextDetailedAids(library.surahs, morph, urdu, segments);
  await writeFile(
    "src/data/next-200-segments.json",
    JSON.stringify(segments, null, 2) + "\n",
  );
  await writeFile(
    "src/data/detailed-word-aids-next-200.json",
    JSON.stringify(details) + "\n",
  );
  console.log({ ...details.review, verseKeys: undefined });
}
if (process.argv[1]?.endsWith("build-next-detailed-aids.ts"))
  main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
