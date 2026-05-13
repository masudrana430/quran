import type { Ayah } from "@/types/quran";
import WordCard from "./WordCard";
import AudioButton from "./AudioButton";

type AyahCardProps = {
  ayah: Ayah;
};

export default function AyahCard({ ayah }: AyahCardProps) {
  const hasTranslation = ayah.banglaTranslation.trim().length > 0;

  return (
    <article
      id={`ayah-${ayah.ayahNumber}`}
      className="relative scroll-mt-6 rounded-[2rem] border border-white/80 bg-white/90 shadow-xl shadow-slate-200/70 backdrop-blur-xl"
    >
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-7">
        {/* Full Sticky Ayah Box */}
        <div className="sticky top-3 z-30 mb-7 max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 sm:top-4 lg:top-6">
          {/* Ayah Top Bar */}
          <div className="border-b border-slate-100 bg-white px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-base font-black text-white shadow-lg shadow-emerald-600/25 sm:h-12 sm:w-12">
                  {ayah.ayahNumber}
                </div>

                <div>
                  <p className="font-english text-sm font-black text-slate-950 sm:text-base">
                    Ayah {ayah.ayahNumber}
                  </p>
                  <p className="font-english text-xs font-semibold text-slate-500 sm:text-sm">
                    {ayah.verseKey} · {ayah.words.length} words
                  </p>
                </div>
              </div>

              {ayah.audio ? <AudioButton src={ayah.audio} /> : null}
            </div>
          </div>

          {/* Arabic Ayah */}
          <div className="p-4 sm:p-6">
            <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-5 shadow-xl shadow-slate-900/20 sm:p-7">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="font-english rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200 ring-1 ring-white/10">
                  Reading Ayah
                </p>

                <p className="font-english rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-100 ring-1 ring-emerald-300/20">
                  {ayah.verseKey}
                </p>
              </div>

              <p
                className="font-arabic-ayah text-right text-[2.15rem] leading-[2.15] text-white sm:text-5xl sm:leading-[2.25] lg:text-6xl lg:leading-[2.35]"
                dir="rtl"
                lang="ar"
              >
                {ayah.arabic}
              </p>
            </div>

            {/* Translation + Learning Flow */}
            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
              <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-5">
                <p className="font-english text-xs font-black uppercase tracking-wider text-emerald-700">
                  Bangla Translation
                </p>

                <p className="font-bangla mt-3 text-base font-semibold leading-8 text-emerald-950 sm:text-lg">
                  {hasTranslation
                    ? ayah.banglaTranslation
                    : "এখানে এই আয়াতের বাংলা অনুবাদ যোগ করুন।"}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-amber-100 bg-amber-50 p-5">
                <p className="font-english text-xs font-black uppercase tracking-wider text-amber-700">
                  Learning Flow
                </p>

                <ol className="font-bangla mt-3 space-y-2 text-sm font-semibold leading-6 text-amber-950">
                  <li>১. আগে আয়াত পড়ুন</li>
                  <li>২. বাংলা অর্থ দেখুন</li>
                  <li>৩. শব্দের trick দেখে মনে রাখুন</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Word Cards Section */}
        <div className="mt-7">
          <div className="mb-4 rounded-[1.5rem] border border-slate-200 bg-white/80 p-5">
            <h2 className="font-english text-xl font-black text-slate-950">
              Word by Word
            </h2>
            <p className="font-bangla mt-1 text-sm leading-6 text-slate-500">
              প্রতিটি word card খুলে বাংলা অর্থ ও memory trick দেখুন।
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ayah.words.map((word) => (
              <WordCard
                key={`${ayah.verseKey}-${word.position}`}
                word={word}
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}