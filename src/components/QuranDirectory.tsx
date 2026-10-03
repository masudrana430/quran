"use client";
import { useState } from "react";
import Link from "next/link";
import { useLocalStore, LAST_READ, LEARNED } from "@/lib/local-store";
import type { SurahInfo } from "@/types/quran";
type SearchVerse = {
  verseKey: string;
  arabic: string;
  translation: string;
  name: string;
};
export default function QuranDirectory({
  chapters,
  verses,
  completed,
}: {
  chapters: (SurahInfo & { availableAyahs: number })[];
  verses: SearchVerse[];
  completed: number;
}) {
  const [query, setQuery] = useState(""),
    [onlyAvailable, setOnlyAvailable] = useState(false);
  const [last] = useLocalStore<{ verseKey: string; name: string } | null>(
    LAST_READ,
    null,
  );
  const [learned] = useLocalStore<string[]>(LEARNED, []);
  const q = query.trim().toLocaleLowerCase();
  const filtered = chapters.filter(
    (s) =>
      (!onlyAvailable || s.availableAyahs > 0) &&
      (!q ||
        `${s.number} ${s.nameEnglish} ${s.nameBangla} ${s.nameArabic}`
          .toLocaleLowerCase()
          .includes(q)),
  );
  const hits =
    q.length >= 2
      ? verses
          .filter((a) =>
            `${a.verseKey} ${a.arabic} ${a.translation}`
              .toLocaleLowerCase()
              .includes(q),
          )
          .slice(0, 30)
      : [];
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">QURAN WORD BY WORD · বাংলা</p>
          <h1>
            প্রতিটি শব্দ বুঝুন।
            <br />
            <span>একটু একটু করে শিখুন।</span>
          </h1>
          <p className="hero-copy">
            আরবি আয়াত, বাংলা অনুবাদ ও শব্দের অর্থ এক জায়গায়। অডিও শুনুন, ছোট
            অংশে অনুশীলন করুন, নিজের শেখার অগ্রগতি রাখুন।
          </p>
          <div className="hero-actions">
            <Link
              href={
                last
                  ? `/surah/${last.verseKey.split(":")[0]}?ayah=${last.verseKey.split(":")[1]}`
                  : "/surah/1"
              }
              className="primary-link"
            >
              {last
                ? `আবার পড়ুন · ${last.verseKey}`
                : "আল-ফাতিহা দিয়ে শুরু করুন"}{" "}
              <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/surah/67" className="quiet-link">
              সূরা আল-মুলক
            </Link>
          </div>
        </div>
        <div className="hero-art">
          <p lang="ar" dir="rtl">
            ٱقْرَأْ
          </p>
          <span>পড়ুন। শিখুন। অনুশীলন করুন।</span>
          <div className="art-line" />
        </div>
      </section>
      <section className="stats-strip" aria-label="অগ্রগতি">
        <div>
          <strong>১১৪</strong>
          <span>সূরার তালিকা</span>
        </div>
        <div>
          <strong>{completed.toLocaleString("bn-BD")} / ৬,২৩৬</strong>
          <span>আয়াত এখন পড়া যায়</span>
        </div>
        <div>
          <strong>
            {learned
              .filter((k) => verses.some((v) => v.verseKey === k))
              .length.toLocaleString("bn-BD")}
          </strong>
          <span>নিজে অনুশীলন করেছেন</span>
        </div>
      </section>
      <section id="surahs" className="directory">
        <div className="section-heading">
          <div>
            <p className="eyebrow">আপনার পরবর্তী পাঠ</p>
            <h2>সূরা খুঁজুন</h2>
          </div>
          <label className="check">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
            />{" "}
            শুধু পড়ার জন্য প্রস্তুত
          </label>
        </div>
        <label className="search-label">
          <span>সূরা, আয়াত নম্বর অথবা বাংলা অনুবাদ খুঁজুন</span>
          <input
            type="search"
            placeholder="যেমন: Al-Mulk, 2:255, করুণাময়…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        {hits.length > 0 && (
          <div className="search-results">
            <h3>
              আয়াতে পাওয়া গেছে <small>সর্বোচ্চ ৩০টি ফল</small>
            </h3>
            {hits.map((a) => (
              <Link
                key={a.verseKey}
                href={`/surah/${a.verseKey.split(":")[0]}?ayah=${a.verseKey.split(":")[1]}`}
              >
                <strong>
                  {a.name} · {a.verseKey}
                </strong>
                <p>{a.translation.replace(/<[^>]*>/g, "").slice(0, 180)}…</p>
              </Link>
            ))}
          </div>
        )}
        <div className="surah-grid">
          {filtered.map((s) =>
            s.availableAyahs ? (
              <Link
                className="surah-tile"
                key={s.number}
                href={`/surah/${s.number}`}
              >
                <span className="number-badge">
                  {s.number.toLocaleString("bn-BD")}
                </span>
                <div>
                  <h3>{s.nameEnglish}</h3>
                  <p>{s.nameBangla}</p>
                  <small>
                    {s.availableAyahs.toLocaleString("bn-BD")} /{" "}
                    {s.versesCount.toLocaleString("bn-BD")} আয়াত প্রস্তুত
                  </small>
                </div>
                <span className="surah-arabic" lang="ar" dir="rtl">
                  {s.nameArabic}
                </span>
              </Link>
            ) : (
              <div className="surah-tile unavailable" key={s.number}>
                <span className="number-badge">
                  {s.number.toLocaleString("bn-BD")}
                </span>
                <div>
                  <h3>{s.nameEnglish}</h3>
                  <p>{s.nameBangla}</p>
                  <small>
                    {s.versesCount.toLocaleString("bn-BD")} আয়াত · যোগ করা হচ্ছে
                  </small>
                </div>
                <span className="surah-arabic" lang="ar" dir="rtl">
                  {s.nameArabic}
                </span>
              </div>
            ),
          )}
        </div>
        {!filtered.length && !hits.length && (
          <p className="empty-state">
            কোনো ফল পাওয়া যায়নি। অন্য শব্দ দিয়ে খুঁজুন।
          </p>
        )}
      </section>
    </>
  );
}
