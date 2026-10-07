# Bangla Quran learning website

A Next.js 16 / React 19 application for reading Quran Arabic, exploring Bengali word meanings, listening to recitation and practicing memorization.

## Current content

**All 6,236 ayahs in all 114 surahs are available.** The final import added **106 new ayahs**, 98:1–114:6, through the non-destructive one-off import pipeline. All source verse objects, earlier detailed overlays, original source snapshots and archived Al-Mulk remain unchanged. The catalog has no missing or partial surahs. All 77,429 word occurrences have relational cues; fully detailed aids now cover **1,801 ayahs / 33,475 words**.

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

Production builds allocate up to 4 GiB of Node heap for the source-heavy TypeScript check; type checking remains enabled in local, CI and Vercel builds.

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

The scheduled ChatGPT task begins October 4, 2026, around 09:00 Asia/Dhaka. It targets 300 ayahs per run, reports actual completion and blockers, and delivers changes through pull requests. Scheduling does not automatically merge or deploy the site. Future runs must inspect the latest content branch/open pull request as well as main so unmerged work is not duplicated. Now that all 6,236 ayahs are populated, continue content verification and website fixes instead of adding duplicates. An exhausted import validates the existing library and returns without verse, audio or morphology requests and without changing content or progress files.

## Relational mnemonic correction

All 77,429 word occurrences in the complete 6,236 ayahs have relational cues. Familiar-language anchors are curated; Arabic form/lemma matches are annotated in Quranic Arabic Corpus v0.4. When no dependable familiar match exists, use a same-lemma form comparison or a concrete verse-local word pair. Never invent shared etymology from similar sounds. The verse-level chunking panel has been removed. Full Bangla translation is now exclusively Dr. Abu Bakr Muhammad Zakaria (213); Bengali word glosses remain separately attributed to Quran.com. Preserve the provider translation including footnotes in the stored data.

Seven exact position-specific spelling differences are documented in `morphology-spellings.json` with primary Corpus links. Source text is preserved, and the normal alignment check is still required everywhere else. The questioned segmentation of 12:39:1 / 12:41:1 is not used to teach possessive-pronoun grammar. Regression tests reject altered consonants and unreviewed locations.

The derived morphology subset and its original copyright/terms notice are stored in `src/data/word-morphology.json` and `src/data/MORPHOLOGY-NOTICE.txt`. The importer prepares and checks position/text alignment against the corpus before generating cues. Core hints in `mnemonic-anchors.json` and exact-lemma overrides in `mnemonic-lemmas.json` must be reviewed carefully.

Attribute passages use verse-local textual associations, without human comparisons or speculative interpretation. The exact-position **57:25:13** Al-Hadid/iron cue does not apply iron to **50:22:12**. Twelve targeted word-gloss clarifications are in `source-word-clarifications.json`: the nine earlier clarifications remain unchanged; positions **70:4:4** (আল্লাহর দিকে) and **75:23:3** (তাকিয়ে থাকবে) follow exact wording from Zakaria's full translations, retain original provider fingerprints, and supply source links. The final batch also clarifies **101:3:3**: the provider gloss incorrectly labels interrogative مَا as মহাপ্রলয়. Its educational meaning **কী** follows the primary Corpus interrogative annotation and the same word in Zakaria’s adjacent translation at **101:2**; both full verse translations and the original provider fingerprint remain intact. Original Arabic and provider word glosses are not rewritten. These partial clarifications do not change the complete detailed scope, which now covers **1,801 ayahs / 33,475 words**.

The preceding 1,000-ayah batch added three narrow spelling exceptions, **70:1:2**, **80:25:1** and **82:1:2**, after verification on the primary Corpus pages. Extended Buckwalter decoding now follows the [official JQuranTree table](https://corpus.quran.com/java/buckwalter.jsp): Quranic annotation signs are displayed as Unicode instead of ASCII placeholders. Existing derived `stemArabic` values and 265 detailed segmentation part strings, plus their 124 embedded step strings, receive only that encoding repair; aid meanings, explanation wording, reviews and source snapshots remain unchanged. Stored direction controls remain intact; alignment ignores LRM/RLM display markers in addition to existing spacing/diacritic normalization, with tests rejecting changed letters or a missing sajdah sign. The final 106-ayah batch documents **108:1:1**, another exact-position separate/precomposed maddah spelling difference. All source forms are retained. Final attribute passages use verse-local textual cues; **111:1:4** retains the name ‘Abu Lahab’, while the identical spelling at **111:3:4** is taught in its flame context. The final request and source/word/audio comparisons are recorded in `progress.json`.

## Detailed aids for the first 100 ayahs

Al-Fatihah 1–7 and Al-Baqarah 1–93 now have detailed aids for all **1,593 word occurrences**. Each aid explains a carefully selected familiar Bangla/Urdu word, familiar Arabic phrase, grammar relation, or concrete meaning association; these categories do not imply that every Arabic word has a Bangla/Urdu cognate. The reader shows three word-specific memory explanations, real corpus prefix/stem/suffix segmentation where available, nearby words from the actual ayah, and source links. Five missing Urdu provider glosses remain unavailable rather than invented.

The separate `detailed-word-aids.json` overlay retains the original source gloss fingerprint. Five educational gloss clarifications distinguish wrath, women, the two-word number twelve, the possessive phrase for relatives, and disobedient fasiks; original provider data and Zakaria's full translations remain intact. Existing verse content is preserved outside the overlay. Future imports cannot overwrite these detailed aids; mismatched source fingerprints are not attached silently.

Authored profiles and exceptions are in `detailed-aid-profiles.ts` and `detailed-aid-overrides.ts`. Quran.com Urdu glosses and Quranic Arabic Corpus v0.4 segments for this scope are cached in `first-100-urdu-glosses.json` and `first-100-segments.json`. Rebuild offline with `npm run build:detailed-aids`, then run `npm test`. The subset retains the original corpus attribution and terms in `MORPHOLOGY-NOTICE.txt`. Structural/source checks are not an independent scholarly review.

The first detailed batch ends at **2:93**; the next batch below continues from **2:94**, separately from adding new ayahs.

## Detailed aids for the next 200 ayahs

The second detailed batch covers **Al-Baqarah 2:94–286 and Ali Imran 3:1–7**, exactly **200 ayahs / 4,659 word occurrences**. Together with the first batch, **300 ayahs / 6,252 words** now have detailed aids. The remaining 5,936 ayahs retain their original word content; this is an aid-improvement batch, not a new-ayah import.

New curated associations include taklif, aman, amanat, nikah, talaq, qard, hifazat, mashwara, and others. Context exceptions distinguish hady/guidance, dayn/din, nahar/river, rih/ruh, wombs/mercy, charity/truthfulness, temporary postponement/looking, and other polysemous forms. Meaning scenes and grammatical relationships are used where familiar-language matches are unreliable.

The requested religious boundary is implemented as word learning anchored to Zakaria 213, without new tafsir, religious rulings, human comparisons or imagined forms for Allah's names, attributes and actions. Educational clarifications preserve the original source gloss: security at 2:125, abundance at 2:115, Kursi at 2:255, and the mutashabih terminology at 3:7. Dictionaries support language usage only. This is not a claim of certification by a Salafi scholar.

Source snapshots are `next-200-urdu-glosses.json` and `next-200-segments.json`; 29 unavailable Urdu provider glosses are left empty. `next-detailed-aid-profiles.ts` contains the authored additions, and `detailed-word-aids-next-200.json` is a separate overlay. Rebuild with `npm run build:next-detailed-aids`, then run `npm test`. The original second batch remains unchanged. All ayahs are imported; no new verse keys remain. Detailed review now continues from **14:52** toward all **6,236 canonical ayahs**; completed keys, source snapshots and word counts are recorded separately in `progress.json`.

## Next work

All 6,236 ayahs are imported. Continue detailed word-aid review from **14:52**, verify source edition details and memorization aids, improve reader performance and end-to-end UI checks, and optionally add device-to-device progress synchronization. Imported coverage and fully detailed aid coverage remain separately recorded.

Additional familiar-phrase anchors for kaana/kun, bayan, wali, inshaAllah and An-Nas use Quranic Arabic Corpus lemma matches. The “inshaAllah” cue applies to the verb shaa, not the noun shay (thing), and the wali cue is not used for tawalla (turn away). Source dictionaries: https://corpus.quran.com/qurandictionary.jsp?q=kwn , https://corpus.quran.com/qurandictionary.jsp?q=byn , https://corpus.quran.com/qurandictionary.jsp?q=wly , https://corpus.quran.com/qurandictionary.jsp?q=$yA .

## Detailed continuation: 3:8

The first 301 canonical ayahs (6,267 words) now have complete authored word aids. The new independent overlay covers all 15 words of 3:8; next detailed key is 3:9. All 6,236 source verse objects and previous detailed overlays remain unchanged. Fresh Quran.com resource 213/text/gloss/transliteration checks and Corpus v0.4 position alignment were performed on 2026-10-05. Familiar hidayat/rahmat usage is separately sourced to Rekhta; no Urdu verse translation is substituted.

## Detailed 500-ayah batch: 3:9–6:12

The next **500 canonical ayahs / 10,090 words** have complete detailed aids in `detailed-word-aids-500.json`. Fresh Quran.com responses verify every stored Arabic verse, Zakaria resource 213 translation, Bengali word gloss and transliteration; Urdu word glosses are separately attributed and 55 unavailable Urdu fields remain explicitly empty. Every position aligns with the stored Quranic Arabic Corpus v0.4 morphology and the retained segment subset. Familiar-language anchors are used only from reviewed profiles; otherwise the aid explicitly presents an Urdu/Bangla meaning comparison, grammar, or verse-local context without claiming shared etymology. Verses referring to Allah receive a neutral no-imagery guard. Next detailed key: **6:13**.

## Detailed 500-ayah batch: 6:13–9:66

The following **500 canonical ayahs / 8,662 words** have complete detailed aids in `detailed-word-aids-500-second.json`. Fresh Quran.com responses verify stored Arabic, Zakaria resource 213 translation, Bengali word fields and separately attributed Urdu glosses; 20 unavailable Urdu fields remain empty. Corpus v0.4 positional alignment, retained segment data, source hashes and the no-forced-etymology policy are checked in regression tests. Cumulative complete detailed coverage is **1,301 ayahs / 25,019 words**. Next detailed key: **9:67**.

## Detailed 500-ayah batch: 9:67–14:51

The third **500 canonical ayahs / 8,456 words** are stored in `detailed-word-aids-500-third.json`. Arabic, Zakaria resource 213, Bengali glosses/transliteration, separately attributed Urdu fields and Corpus v0.4 positions are verified afresh. The 35 unavailable Urdu fields remain empty. Regression checks preserve both earlier 500-ayah overlays byte-for-byte and reject overlap or forced etymology. Cumulative detailed coverage is **1,801 ayahs / 33,475 words**. Next detailed key: **14:52**.
