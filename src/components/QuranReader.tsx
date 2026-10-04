"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AudioButton from "./AudioButton";
import DetailedWordAid from "./DetailedWordAid";
import {
  BOOKMARKS,
  LAST_READ,
  LEARNED,
  useLocalStore,
} from "@/lib/local-store";
import type { Ayah, QuranWord, SurahData } from "@/types/quran";
const SIZE = 15;
const bn = (n: number) => n.toLocaleString("bn-BD");
function plain(text: string) {
  return text
    .replace(/<sup[^>]*>.*?<\/sup>/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
export default function QuranReader({
  data,
  initialAyah = 1,
}: {
  data: SurahData;
  initialAyah?: number;
}) {
  const initialIndex = Math.max(
    0,
    data.ayahs.findIndex((a) => a.ayahNumber === initialAyah),
  );
  const [page, setPage] = useState(Math.floor(initialIndex / SIZE)),
    [mode, setMode] = useState<"study" | "read">("study");
  const [query, setQuery] = useState(""),
    [showTranslation, setShowTranslation] = useState(true),
    [fontSize, setFontSize] = useState(38);
  const [bookmarks, saveBookmarks] = useLocalStore<string[]>(BOOKMARKS, []);
  const [learned, saveLearned] = useLocalStore<string[]>(LEARNED, []);
  const [, saveLast] = useLocalStore<{ verseKey: string; name: string } | null>(
    LAST_READ,
    null,
  );
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (initialAyah > 1)
      document
        .getElementById(`ayah-${initialAyah}`)
        ?.scrollIntoView({ block: "center" });
  }, [initialAyah]);
  const q = query.trim();
  const filtered = data.ayahs.filter(
    (a) =>
      !q ||
      `${a.verseKey} ${a.arabic} ${a.banglaTranslation} ${a.words.map((w) => w.banglaMeaning).join(" ")}`.includes(
        q,
      ),
  );
  const pages = Math.ceil(filtered.length / SIZE),
    safePage = Math.min(page, Math.max(0, pages - 1));
  const visible = filtered.slice(safePage * SIZE, (safePage + 1) * SIZE);
  function toggle(key: string, list: string[], save: (v: string[]) => boolean) {
    const ok = save(
      list.includes(key) ? list.filter((k) => k !== key) : [...list, key],
    );
    if (!ok) setNotice("এই ব্রাউজারে সংরক্ষণ করা যায়নি।");
  }
  function remember(a: Ayah) {
    if (!saveLast({ verseKey: a.verseKey, name: data.surah.nameEnglish }))
      setNotice("পড়ার অবস্থান সংরক্ষণ করা যায়নি।");
  }
  return (
    <section className="reader">
      <div className="reader-heading">
        <Link href="/" className="quiet-link">
          ← সব সূরা
        </Link>
        <p className="eyebrow">
          সূরা {bn(data.surah.number)} ·{" "}
          {data.surah.revelationPlace === "makkah" ? "মক্কী" : "মাদানী"} ·{" "}
          {bn(data.surah.versesCount)} আয়াত
        </p>
        <h1>
          <span lang="ar" dir="rtl">
            {data.surah.nameArabic}
          </span>
          {data.surah.nameEnglish}
        </h1>
        <p>{data.surah.nameBangla}</p>
        {data.surah.bismillahPre && (
          <p className="bismillah" lang="ar" dir="rtl">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
        )}
      </div>
      {data.ayahs.length < data.surah.versesCount && (
        <p className="content-notice">
          এই সূরার {bn(data.ayahs.length)} / {bn(data.surah.versesCount)} আয়াত
          এখন প্রস্তুত। পরের আয়াতগুলো দৈনিক ব্যাচে যোগ হবে।
        </p>
      )}
      <div className="reader-toolbar">
        <div className="segmented" aria-label="পড়ার ধরন">
          <button
            aria-pressed={mode === "study"}
            onClick={() => setMode("study")}
          >
            শব্দে শব্দে
          </button>
          <button
            aria-pressed={mode === "read"}
            onClick={() => setMode("read")}
          >
            শুধু পড়া
          </button>
        </div>
        <label>
          আরবি আকার
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          >
            <option value={30}>ছোট</option>
            <option value={38}>মাঝারি</option>
            <option value={48}>বড়</option>
          </select>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={showTranslation}
            onChange={(e) => setShowTranslation(e.target.checked)}
          />{" "}
          বাংলা অনুবাদ
        </label>
        <label>
          আয়াতে যান
          <select
            value=""
            onChange={(e) => {
              const n = Number(e.target.value);
              setQuery("");
              setPage(
                Math.floor(
                  data.ayahs.findIndex((a) => a.ayahNumber === n) / SIZE,
                ),
              );
            }}
          >
            <option value="" disabled>
              আয়াত বাছুন
            </option>
            {data.ayahs.map((a) => (
              <option key={a.verseKey} value={a.ayahNumber}>
                {a.verseKey}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="search-label reader-search">
        <span>এই সূরায় খুঁজুন</span>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="আয়াত নম্বর বা অনুবাদের শব্দ"
        />
      </label>
      <p className="source-line">
        বাংলা অনুবাদ: ড. আবু বকর মুহাম্মাদ যাকারিয়া। শব্দের অর্থ: Quran.com।
      </p>
      {notice && <p role="status">{notice}</p>}
      <div className="ayah-list">
        {visible.map((a) => (
          <ReaderAyah
            key={a.verseKey}
            ayah={a}
            mode={mode}
            fontSize={fontSize}
            showTranslation={showTranslation}
            bookmarked={bookmarks.includes(a.verseKey)}
            learned={learned.includes(a.verseKey)}
            onBookmark={() => toggle(a.verseKey, bookmarks, saveBookmarks)}
            onLearned={() => {
              toggle(a.verseKey, learned, saveLearned);
              remember(a);
            }}
            onRead={() => remember(a)}
            onNotice={setNotice}
            focused={a.ayahNumber === initialAyah}
          />
        ))}
      </div>
      {!visible.length && (
        <p className="empty-state">এই অনুসন্ধানে কোনো আয়াত পাওয়া যায়নি।</p>
      )}
      <div className="pagination">
        <button disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
          ← আগের
        </button>
        <span>
          {bn(safePage + 1)} / {bn(Math.max(1, pages))} পৃষ্ঠা
        </span>
        <button
          disabled={safePage + 1 >= pages}
          onClick={() => setPage(safePage + 1)}
        >
          পরের →
        </button>
      </div>
      <nav className="surah-navigation" aria-label="অন্য সূরা">
        <Link href="/">সূরার তালিকা</Link>
        {data.surah.number > 1 && (
          <Link href={`/surah/${data.surah.number - 1}`}>আগের সূরা</Link>
        )}
        {data.surah.number < 114 && (
          <Link href={`/surah/${data.surah.number + 1}`}>পরের সূরা</Link>
        )}
      </nav>
    </section>
  );
}
function ReaderAyah({
  ayah: a,
  mode,
  fontSize,
  showTranslation,
  bookmarked,
  learned,
  onBookmark,
  onLearned,
  onRead,
  onNotice,
  focused,
}: {
  ayah: Ayah;
  mode: string;
  fontSize: number;
  showTranslation: boolean;
  bookmarked: boolean;
  learned: boolean;
  onBookmark: () => void;
  onLearned: () => void;
  onRead: () => void;
  onNotice: (v: string) => void;
  focused: boolean;
}) {
  const [word, setWord] = useState<QuranWord | null>(null),
    [hidden, setHidden] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        `${a.verseKey}\n${a.arabic}\n${plain(a.banglaTranslation)}\n${a.translationSource}`,
      );
      onNotice(`${a.verseKey} কপি হয়েছে।`);
    } catch {
      onNotice("কপি করা যায়নি। লেখাটি নির্বাচন করে কপি করুন।");
    }
  }
  async function share() {
    const url = `${window.location.origin}/surah/${a.verseKey.split(":")[0]}?ayah=${a.ayahNumber}`;
    try {
      if (navigator.share)
        await navigator.share({ title: `কুরআন ${a.verseKey}`, url });
      else {
        await navigator.clipboard.writeText(url);
        onNotice("আয়াতের লিংক কপি হয়েছে।");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError")
        onNotice("লিংক শেয়ার করা যায়নি।");
    }
  }
  return (
    <article
      className={`ayah-card ${focused ? "focused-ayah" : ""}`}
      id={`ayah-${a.ayahNumber}`}
    >
      <div className="ayah-meta">
        <span className="verse-key">{a.verseKey}</span>
        <span>
          পৃষ্ঠা {a.pageNumber ? bn(a.pageNumber) : "—"} · জুজ{" "}
          {a.juzNumber ? bn(a.juzNumber) : "—"}
        </span>
        <div className="ayah-tools">
          {a.audio && <AudioButton src={a.audio} />}
          <button
            className="tool-button"
            aria-pressed={bookmarked}
            onClick={onBookmark}
            aria-label={bookmarked ? "সংরক্ষণ সরান" : "আয়াত সংরক্ষণ করুন"}
          >
            {bookmarked ? "★" : "☆"}
          </button>
          <button className="tool-button" onClick={copy}>
            কপি
          </button>
          <button className="tool-button" onClick={share}>
            শেয়ার
          </button>
        </div>
      </div>
      {hidden ? (
        <button className="recall-cover" onClick={() => setHidden(false)}>
          না দেখে আয়াতটি বলুন। তারপর মিলিয়ে দেখতে এখানে চাপুন।
        </button>
      ) : mode === "study" ? (
        <div
          className="arabic-verse word-flow"
          dir="rtl"
          lang="ar"
          style={{ fontSize }}
        >
          {a.words.map((w) => (
            <button
              key={w.position}
              className={`word-token ${word?.position === w.position ? "word-token-active" : ""}`}
              onClick={() => {
                setWord(w);
                onRead();
              }}
              title={w.detailedAid?.meaning ?? w.banglaMeaning}
              aria-pressed={word?.position === w.position}
            >
              {w.arabic}
            </button>
          ))}
          <span className="ayah-end">
            ﴿{a.ayahNumber.toLocaleString("ar-EG", { useGrouping: false })}﴾
          </span>
        </div>
      ) : (
        <p className="arabic-verse" lang="ar" dir="rtl" style={{ fontSize }}>
          {a.arabic}{" "}
          <span className="ayah-end">
            ﴿{a.ayahNumber.toLocaleString("ar-EG", { useGrouping: false })}﴾
          </span>
        </p>
      )}
      {word && mode === "study" && !hidden && (
        <div className="word-info">
          <button
            className="word-close"
            onClick={() => setWord(null)}
            aria-label="শব্দের তথ্য বন্ধ করুন"
          >
            ×
          </button>
          <p className="word-info-arabic" lang="ar" dir="rtl">
            {word.arabic}
          </p>
          <p>
            <strong>শব্দের অর্থ:</strong>{" "}
            {word.detailedAid?.meaning ?? word.banglaMeaning}
          </p>
          <p>
            <strong>ট্রান্সলিটারেশন:</strong> {word.transliteration}
          </p>
          <p className="learning-label">মনে রাখার trick:</p>
          {word.detailedAid ? (
            <DetailedWordAid word={word} />
          ) : (
            <p>{word.memoryTrick}</p>
          )}
          {!word.detailedAid && word.memoryTrickSource && (
            <a
              className="mnemonic-source"
              href={word.memoryTrickSource}
              target="_blank"
              rel="noreferrer"
            >
              শব্দের সম্পর্ক যাচাই করুন ↗
            </a>
          )}
          {word.audio && <AudioButton src={word.audio} />}
        </div>
      )}
      {showTranslation && !hidden && (
        <p className="translation">{plain(a.banglaTranslation)}</p>
      )}

      <div className="practice-actions">
        <button
          className="tool-button"
          onClick={() => {
            setHidden(!hidden);
            onRead();
          }}
        >
          {hidden ? "আয়াত দেখুন" : "ঢেকে অনুশীলন করুন"}
        </button>
        <button className="tool-button" onClick={onRead}>
          এখান থেকে পরে পড়ব
        </button>
        <button
          className={`tool-button ${learned ? "is-learned" : ""}`}
          aria-pressed={learned}
          onClick={onLearned}
        >
          {learned ? "✓ অনুশীলন হয়েছে" : "অনুশীলন হয়েছে চিহ্নিত করুন"}
        </button>
      </div>
    </article>
  );
}
