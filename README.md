# Bangla Quran learning website

A Next.js 16 / React 19 application for reading Quran Arabic, exploring Bengali word meanings, listening to recitation and practicing memorization.

## Current content

The first batch contains **300 new ayahs** in canonical order: Al-Fatihah 1–7, Al-Baqarah 1–286, and Ali 'Imran 1–7. The original Al-Mulk draft has also been repaired separately: all 30 ayahs now have complete sourced word data and Bangla translations. **330 distinct ayahs** are available. The catalog lists all 114 surahs and explicitly marks unavailable or partial content.

The original `src/data/surah-mulk.json` is retained unchanged as an archive. The live reader uses `src/data/quran-library.json`. Original unsourced roots are not published.

## Features

- Search the surah catalog and available Arabic/Bangla verse text.
- Word-by-word study mode, full-verse reading mode, Arabic font size and translation visibility.
- Per-verse and per-word audio; playing another clip pauses the first.
- Bookmarks, last-read position and self-reported practice progress stored in the browser.
- Copy and share an ayah, jump to an ayah, paginated reading.
- Text-linked chunking and retrieval-practice aids, with hide-and-recall practice.
- Responsive layouts, keyboard access, source attribution and explicit content availability.

## Sources and content boundaries

- Arabic verse and word text, Bengali word meanings, and transliteration: Quran.com / Quran Foundation v4 API.
- Bengali verse translation: **Taisirul Quran, Tawheed Publication**, resource **161**, selected from the provider's translation catalog. Original translation strings are stored intact. The reader removes markup and footnote markers for plain-text display; consult the provider for full notes.
- Verse audio: **Mishary Rashid Alafasy**, recitation **7**, using the URLs returned by the provider. Word audio is also supplied by the API.
- Memorization aids: generated chunking and meaning-recall prompts. These are learning aids, **not translation, tafsir, tajwid instruction, or verified etymology**. No invented Arabic roots or religious interpretations are added.
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

In a proxy-controlled environment with Node 24+, use `NODE_USE_ENV_PROXY=1` when invoking the importer. A batch must complete all required source requests before any content is written. Failed requests exit unsuccessfully; do not claim those verses were added. The importer has a maximum of 300 new ayahs per invocation. Only the initial repair used `--repair-mulk`, separately from the new-ayah quota.

The scheduled ChatGPT task begins October 4, 2026, around 09:00 Asia/Dhaka. It targets 300 ayahs per run, reports actual completion and blockers, and delivers changes through pull requests. Scheduling does not automatically merge or deploy the site. Future runs must inspect the latest content branch/open pull request as well as main so unmerged work is not duplicated. After 6,236 ayahs are populated, continue content verification and website fixes instead of adding duplicates.

## Next work

Continue from **3:8**. Publish the reviewed code through the repository's chosen hosting provider. Complete all remaining ayah batches; review source edition details and memorization aids; add stronger end-to-end UI checks and optionally device-to-device progress synchronization.
