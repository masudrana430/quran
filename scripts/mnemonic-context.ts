// Broad root membership does not make every contextual sense a familiar-language match.
// These families already have sense-specific treatment in the detailed word-aid profiles.
const ambiguousRoots = new Set([
  "Hll", "Edw", "$Er", "Hrm", "rHm", "mlk", "qwm", "slm", "nSr",
  "qlb", "rwH", "xlf", "ysr", "qrA", "Hbb", "rbw", "Swr", "frD",
  "dyn", "nZr", "Hsb", "wfy", "Amm", "mll", "n*r", "EZm", "swy",
  "Sdq", "skn", "xlw", "vmr", "Emr", "Amr", "twb", "nwr",
  "Hyy", "Hjj", "bny", "$bh", "*kr", "Slw", "Amn", "smE", "bSr",
  "kfr", "hdy", "nEm", "qdr", "Ezz", "xyr",
  "jnn", "nhr", "Zlm", "byt", "lqy", "brr", "qrb", "mwl", "b$r", "Drb",
  "Hdd", "gyr", "Ahl",
]);
type Morph = { root: string; lemma: string; tag: string };
export function rootHintAllowed(meta: Morph) {
  if (meta.root === "Alh") return meta.lemma === "{ll~ah" && meta.tag === "PN";
  return !ambiguousRoots.has(meta.root);
}
const textualVerses = new Set([
  "18:26", "20:5", "20:12", "20:13", "20:14", "20:46", "24:35", "25:59",
  "32:4", "33:43", "33:56", "35:41", "36:82", "38:75", "39:42",
  "39:67", "40:15", "41:11", "42:11", "48:10", "50:16", "50:38",
  "51:47", "52:48", "53:8", "53:9", "54:14", "55:27", "57:3", "57:4",
  // Keep these passages tied to their local text, without importing a different
  // sense from a same-lemma verse or depicting Allah's attributes as human ones.
  "58:7", "59:22", "59:23", "59:24", "62:1", "68:42", "69:17", "70:4",
  "74:31", "75:22", "75:23", "75:29", "76:9", "85:14", "85:15", "85:16",
  "87:1", "89:22", "92:20", "96:14",
  "99:5", "101:3", "108:1", "112:1", "112:2", "112:3", "112:4", "113:1",
  "114:1", "114:2", "114:3",
]);
const attributeLemmas = new Set([
  "Ealiym", "baSiyr", "samiyE", "r~aHiym", "r~aHoma`n", "Hakiym",
  "Eaziyz", "qadiyr", "qay~uwm", "Ealiy~", "ganiY~", "Haliym",
  "ra'uwf", "Hamiyd", "wa`siE", "xabiyr", "badiyE", "taw~aAb",
  "$aAkir", "gafuwr",
]);
export function textualMnemonicOnly(key: string, meta: Morph, meaning: string) {
  const verse = key.split(":").slice(0, 2).join(":");
  return textualVerses.has(verse) || ["33:53:36", "105:2:5", "111:1:4", "111:3:4"].includes(key) || attributeLemmas.has(meta.lemma) ||
    meta.root === "Hdd" ||
    ["huwa", "naHonu", ">anaA", ">anaA\""].includes(meta.lemma) ||
    (meta.root === "EZm" && /হাড়|হাড়|অস্থি/.test(meaning));
}
