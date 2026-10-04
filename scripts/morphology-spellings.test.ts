import assert from "node:assert/strict";
import test from "node:test";
import spellings from "../src/data/morphology-spellings.json";
import { extractMorphology } from "./sync-morphology";
import { readLibraryData } from "./library-data";

const corpus = "(11:13:3:1)\t{fotaraY`\tV\tSTEM|POS:V|PERF|(VIII)|LEM:{fotaraY`|ROOT:fry|3MS\n(11:13:3:2)\thu\tPRON\tSUFFIX|PRON:3MS";
test("Documented spelling alignment retains strict rejection of altered letters and unreviewed locations", () => {
  const base = structuredClone(readLibraryData().surahs[0]);
  const ayah = structuredClone(base.ayahs[0]);
  const word = structuredClone(ayah.words[0]);
  word.position = 3;
  word.arabic = spellings["11:13:3"].provider;
  ayah.verseKey = "11:13";
  ayah.words = [word];
  base.ayahs = [ayah];
  const result = extractMorphology(corpus, [base]);
  assert.equal(result["11:13:3"].root, "fry");
  assert.equal(result["11:13:3"].alignmentSource, spellings["11:13:3"].source);
  word.arabic = "افتربه";
  assert.throws(() => extractMorphology(corpus, [base]), /Morphology\/text alignment/);
  word.arabic = spellings["11:13:3"].provider;
  ayah.verseKey = "11:13x";
  assert.throws(() => extractMorphology(corpus.replaceAll("11:13:3", "11:13x:3"), [base]), /Morphology\/text alignment/);
  ayah.verseKey = "11:13";
  word.arabic = "افتراله";
  assert.throws(() => extractMorphology(corpus, [base]), /Morphology\/text alignment/);
});
