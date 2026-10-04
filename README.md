# Bangla Quran learning website

A Next.js 16 / React 19 application for reading Quran Arabic, exploring Bengali word meanings, listening to recitation and practicing memorization.

## Current content

**5,130 distinct ayahs** are available: all of surahs 1–56, Al-Hadid 57:1–25, and all 30 Al-Mulk ayahs. The latest explicitly requested addition imports **1,000 new ayahs**, 39:43–57:25, in four non-destructive 250-ayah one-off batches. All previous 4,130 verse objects, detailed overlays, source snapshots and archived Al-Mulk remain unchanged. The daily quota remains 300. The catalog lists all 114 surahs and marks unavailable or partial content.

The original `src/data/surah-mulk.json` is retained unchanged as an archive. `src/data/quran-library.json` is now a manifest of compact per-surah JSON files in `src/data/quran-surahs/`; the generated `quran-library.ts` provides static imports to the reader. `scripts/library-data.ts` supports both the original monolithic format and the new manifest, and all import/validation/detail scripts use this shared reader. Source verse objects are preserved exactly across migration. Original unsourced roots are not published.

## Features

- Search the surah catalog and available Arabic/Bangla verse text.
- Word-by-word study mode, full-verse reading mode, Arabic font size and translation visibility.
- Per-verse and per-word audio; playing another clip pauses the first.
- Bookmarks, last-read position and self-reported practice progress stored in the browser.
- Copy and share an ayah, jump to an ayah, paginated reading.
- Relational word tricks using familiar words, corpus-backed form families, and verse-local word associations.
- Responsive layouts, keyboard access, source attribution and explicit content availability.

## Sources and content boundaries

- Arabic verse and word text, Bengali word meanings, and transliteration: Quran.com / Quran Foundation v4 API.
- Bengali verse translation: **Dr. Abu Bakr Muhammad Zakaria**, resource **213**, selected from the provider's translation catalog. Original translation strings are stored intact. The reader removes markup and footnote markers for plain-text display; consult the provider for full notes.
- Verse audio: **Mishary Rashid Alafasy**, recitation **7**, using the URLs returned by the provider. Word audio is also supplied by the API.
- Memorization aids: relational word associations. These are learning aids, **not translation, tafsir, tajwid instruction, or verified etymology**. No invented Arabic roots or religious interpretations are added.
- Source API: https://api.quran.com/api/v4
- Field reference: https://api-docs.quran.foundation/docs/api/field-reference/

Content availability checks validate structure and alignment, not an independent scholarly review of translation or pronunciation. Audio needs an internet connection. Browser data does not sync across devices.

## Run locally

Requires Node 20.9+ (Node 24 used for development).

```sh
npm ci
npm run dev
```

Production:

```sh
npm run validate:data
npm test
npm run lint
npm run build
npm start
```

## Daily 300-ayah batches

```sh
npm run import:batch -- --limit=300
npm run validate:data
npm test
npm run lint
npm run build
```

The importer selects the next missing verses in canonical order. It requests **word_fields=text_uthmani** explicitly, validates required fields, keeps existing verse objects, obtains API audio URLs, and records completed verse keys in `src/data/progress.json`. It never overwrites the archived Al-Mulk notes. The retired `fetch-mulk` command fails safely rather than erasing content.

In a proxy-controlled environment with Node 24+, use `NODE_USE_ENV_PROXY=1` when invoking the importer. A batch must complete all required source requests before any content is written. Failed requests exit unsuccessfully; do not claim those verses were added. The daily importer defaults to and caps at 300 new ayahs. An explicitly requested one-off batch can use `npm run import:batch -- --limit=500 --one-off` (maximum 500); this does not change the daily quota. The progress record includes the requested limit and batch mode. Only the initial repair used `--repair-mulk`, separately from the new-ayah quota.

The scheduled ChatGPT task begins October 4, 2026, around 09:00 Asia/Dhaka. It targets 300 ayahs per run, reports actual completion and blockers, and delivers changes through pull requests. Scheduling does not automatically merge or deploy the site. Future runs must inspect the latest content branch/open pull request as well as main so unmerged work is not duplicated. After 6,236 ayahs are populated, continue content verification and website fixes instead of adding duplicates.

## Relational mnemonic correction

All 70,079 word occurrences in the current 5,130 ayahs have relational cues. Familiar-language anchors are curated; Arabic form/lemma matches are annotated in Quranic Arabic Corpus v0.4. When no dependable familiar match exists, use a same-lemma form comparison or a concrete verse-local word pair. Never invent shared etymology from similar sounds. The verse-level chunking panel has been removed. Full Bangla translation is now exclusively Dr. Abu Bakr Muhammad Zakaria (213); Bengali word glosses remain separately attributed to Quran.com. Preserve the provider translation including footnotes in the stored data.

Three exact position-specific spelling differences are documented in `morphology-spellings.json` with primary Corpus links. Source text is preserved, and the normal alignment check is still required everywhere else. The questioned segmentation of 12:39:1 / 12:41:1 is not used to teach possessive-pronoun grammar. Regression tests reject altered consonants and unreviewed locations.

The derived morphology subset and its original copyright/terms notice are stored in `src/data/word-morphology.json` and `src/data/MORPHOLOGY-NOTICE.txt`. The importer prepares and checks position/text alignment against the corpus before generating cues. Core hints in `mnemonic-anchors.json` and exact-lemma overrides in `mnemonic-lemmas.json` must be reviewed carefully.

The latest 1,000-ayah scope keeps attribute passages textual and adds guarded treatment for iron/keen sight, changing/other, and family/eligibility senses. The exact-position **57:25:13** cue uses the familiar surah name Al-Hadid for iron; it does not apply iron to **50:22:12**. Nine targeted word-gloss clarifications are in `source-word-clarifications.json`: the previous three remain unchanged, and six new positions (**41:11:2**, **42:16:15**, **51:47:3**, **54:14:2**, **55:27:2**, **57:4:10**) follow exact wording from Zakaria's full translations, retain original provider fingerprints, and supply source links. Original Arabic and provider word glosses are not rewritten. These partial clarifications do not increase fully detailed coverage, which remains **300 ayahs / 6,252 words**. Stored direction controls remain intact; alignment ignores LRM/RLM display markers in addition to existing spacing/diacritic normalization, with tests rejecting changed letters or a missing sajdah sign.

## Detailed aids for the first 100 ayahs

Al-Fatihah 1–7 and Al-Baqarah 1–93 now have detailed aids for all **1,593 word occurrences**. Each aid explains a carefully selected familiar Bangla/Urdu word, familiar Arabic phrase, grammar relation, or concrete meaning association; these categories do not imply that every Arabic word has a Bangla/Urdu cognate. The reader shows three word-specific memory explanations, real corpus prefix/stem/suffix segmentation where available, nearby words from the actual ayah, and source links. Five missing Urdu provider glosses remain unavailable rather than invented.

The separate `detailed-word-aids.json` overlay retains the original source gloss fingerprint. Five educational gloss clarifications distinguish wrath, women, the two-word number twelve, the possessive phrase for relatives, and disobedient fasiks; original provider data and Zakaria's full translations remain intact. Existing verse content is preserved outside the overlay. Future imports cannot overwrite these detailed aids; mismatched source fingerprints are not attached silently.

Authored profiles and exceptions are in `detailed-aid-profiles.ts` and `detailed-aid-overrides.ts`. Quran.com Urdu glosses and Quranic Arabic Corpus v0.4 segments for this scope are cached in `first-100-urdu-glosses.json` and `first-100-segments.json`. Rebuild offline with `npm run build:detailed-aids`, then run `npm test`. The subset retains the original corpus attribution and terms in `MORPHOLOGY-NOTICE.txt`. Structural/source checks are not an independent scholarly review.

The first detailed batch ends at **2:93**; the next batch below continues from **2:94**, separately from adding new ayahs.

## Detailed aids for the next 200 ayahs

The second detailed batch covers **Al-Baqarah 2:94–286 and Ali Imran 3:1–7**, exactly **200 ayahs / 4,659 word occurrences**. Together with the unchanged first batch, **300 ayahs / 6,252 words** now have detailed aids. The remaining 4,830 ayahs retain their original word content; this is an aid-improvement batch, not a new-ayah import.

New curated associations include taklif, aman, amanat, nikah, talaq, qard, hifazat, mashwara, and others. Context exceptions distinguish hady/guidance, dayn/din, nahar/river, rih/ruh, wombs/mercy, charity/truthfulness, temporary postponement/looking, and other polysemous forms. Meaning scenes and grammatical relationships are used where familiar-language matches are unreliable.

The requested religious boundary is implemented as word learning anchored to Zakaria 213, without new tafsir, religious rulings, human comparisons or imagined forms for Allah's names, attributes and actions. Educational clarifications preserve the original source gloss: security at 2:125, abundance at 2:115, Kursi at 2:255, and the mutashabih terminology at 3:7. Dictionaries support language usage only. This is not a claim of certification by a Salafi scholar.

Source snapshots are `next-200-urdu-glosses.json` and `next-200-segments.json`; 29 unavailable Urdu provider glosses are left empty. `next-detailed-aid-profiles.ts` contains the authored additions, and `detailed-word-aids-next-200.json` is a separate overlay. Rebuild with `npm run build:next-detailed-aids`, then run `npm test`. Next detailed-aid work starts at **3:8**. The next new-ayah import starts at **57:26**. Detailed review is progressing toward the first **1,000 canonical ayahs**, ending at **7:46**; 300 are complete, with completed keys, source snapshots and word counts recorded separately in `progress.json`.

## Next work

Continue new ayah imports from **57:26** and detailed word-aid review from **3:8**. Complete all remaining ayah batches; review source edition details and memorization aids; add stronger end-to-end UI checks and optionally device-to-device progress synchronization.

Additional familiar-phrase anchors for kaana/kun, bayan, wali, inshaAllah and An-Nas use Quranic Arabic Corpus lemma matches. The “inshaAllah” cue applies to the verb shaa, not the noun shay (thing), and the wali cue is not used for tawalla (turn away). Source dictionaries: https://corpus.quran.com/qurandictionary.jsp?q=kwn , https://corpus.quran.com/qurandictionary.jsp?q=byn , https://corpus.quran.com/qurandictionary.jsp?q=wly , https://corpus.quran.com/qurandictionary.jsp?q=$yA .
