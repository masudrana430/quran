"use client";
import Link from "next/link";
import { BOOKMARKS, LEARNED, useLocalStore } from "@/lib/local-store";
type Verse = {
  verseKey: string;
  translation: string;
  name: string;
  arabic: string;
};
export default function BookmarkList({ verses }: { verses: Verse[] }) {
  const [keys, save] = useLocalStore<string[]>(BOOKMARKS, []),
    [learned] = useLocalStore<string[]>(LEARNED, []);
  const selected = verses.filter((a) => keys.includes(a.verseKey));
  return (
    <section className="directory">
      <p className="eyebrow">নিজের পাঠের তালিকা</p>
      <h1>সংরক্ষিত আয়াত</h1>
      <p className="source-line">
        সংরক্ষণ ও অগ্রগতি এই ব্রাউজারেই থাকে। অন্য ডিভাইসে স্বয়ংক্রিয়ভাবে যায়
        না।
      </p>
      {!selected.length ? (
        <div className="empty-state">
          <p>আয়াতের ☆ বোতামে চাপ দিয়ে এখানে সংরক্ষণ করুন।</p>
          <Link href="/">পড়া শুরু করুন →</Link>
        </div>
      ) : (
        <div className="bookmark-list">
          {selected.map((a) => (
            <article key={a.verseKey}>
              <Link
                href={`/surah/${a.verseKey.split(":")[0]}?ayah=${a.verseKey.split(":")[1]}`}
              >
                <strong>
                  {a.name} · {a.verseKey}{" "}
                  {learned.includes(a.verseKey) ? "✓" : ""}
                </strong>
                <p lang="ar" dir="rtl" className="arabic-verse">
                  {a.arabic}
                </p>
                <p>{a.translation.replace(/<[^>]*>/g, "")}</p>
              </Link>
              <button
                className="tool-button"
                onClick={() => save(keys.filter((k) => k !== a.verseKey))}
              >
                সংরক্ষণ সরান
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
