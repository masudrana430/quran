# Bangla Quran learning website

A Next.js 16 / React 19 application for reading Quran Arabic, exploring Bengali word meanings, listening to recitation and practicing memorization.

## Current content

**830 distinct ayahs** are available: all of Al-Fatihah, Al-Baqarah, Ali 'Imran, An-Nisa and Al-Ma'idah; Al-An'am 1–11; and all 30 Al-Mulk ayahs. The first batch added 300 new ayahs and repaired Al-Mulk separately. The latest explicitly requested one-off batch adds **500 new ayahs**, 3:8–6:11, without replacing existing sourced Arabic, translations, word glosses or audio. The catalog lists all 114 surahs and marks unavailable or partial content.

The original `src/data/surah-mulk.json` is retained unchanged as an archive. The live reader uses `src/data/quran-library.json`. Original unsourced roots are not published.

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

All 16,665 word occurrences in the current 830 ayahs have relational cues. Familiar-language anchors are curated; Arabic form/lemma matches are annotated in Quranic Arabic Corpus v0.4. When no dependable familiar match exists, use a same-lemma form comparison or a concrete verse-local word pair. Never invent shared etymology from similar sounds. The verse-level chunking panel has been removed. Full Bangla translation is now exclusively Dr. Abu Bakr Muhammad Zakaria (213); Bengali word glosses remain separately attributed to Quran.com. Preserve the provider translation including footnotes in the stored data.

The derived morphology subset and its original copyright/terms notice are stored in `src/data/word-morphology.json` and `src/data/MORPHOLOGY-NOTICE.txt`. The importer prepares and checks position/text alignment against the corpus before generating cues. Core hints in `mnemonic-anchors.json` and exact-lemma overrides in `mnemonic-lemmas.json` must be reviewed carefully.

## Next work

Continue from **6:12**. Complete all remaining ayah batches; review source edition details and memorization aids; add stronger end-to-end UI checks and optionally device-to-device progress synchronization.

Additional familiar-phrase anchors for kaana/kun, bayan, wali, inshaAllah and An-Nas use Quranic Arabic Corpus lemma matches. The “inshaAllah” cue applies to the verb shaa, not the noun shay (thing), and the wali cue is not used for tawalla (turn away). Source dictionaries: https://corpus.quran.com/qurandictionary.jsp?q=kwn , https://corpus.quran.com/qurandictionary.jsp?q=byn , https://corpus.quran.com/qurandictionary.jsp?q=wly , https://corpus.quran.com/qurandictionary.jsp?q=$yA .
