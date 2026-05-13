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
      className="scroll-mt-8 overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 shadow-xl shadow-slate-200/70 backdrop-blur-xl"
    >
      {/* Top Bar */}
      <div className="border-b border-slate-100 px-5 py-4 sm:px-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-black text-white shadow-lg shadow-emerald-600/20">
              {ayah.ayahNumber}
            </div>

            <div>
              <p className="font-english font-black text-slate-950">
                Ayah {ayah.ayahNumber}
              </p>
              <p className="font-english text-sm font-medium text-slate-500">
                {ayah.verseKey} · {ayah.words.length} words
              </p>
            </div>
          </div>

          {ayah.audio ? <AudioButton src={ayah.audio} /> : null}
        </div>
      </div>

      <div className="px-5 py-7 sm:px-7">
        {/* Arabic Ayah Box */}
        <div className="rounded-[1.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-5 sm:p-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="font-english rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200 ring-1 ring-white/10">
              Reading Ayah
            </p>

            <p className="font-english rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-100 ring-1 ring-emerald-300/20">
              {ayah.verseKey}
            </p>
          </div>

          <p
            className="font-arabic-ayah text-right text-4xl leading-[2.4] text-white sm:text-5xl lg:text-6xl"
            dir="rtl"
            lang="ar"
          >
            {ayah.arabic}
          </p>
        </div>

        {/* Translation + Learning Flow */}
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-5">
            <p className="font-english text-sm font-black uppercase tracking-wider text-emerald-700">
              Bangla Translation
            </p>

            <p className="font-bangla mt-3 text-lg font-semibold leading-8 text-emerald-950">
              {hasTranslation
                ? ayah.banglaTranslation
                : "এখানে এই আয়াতের বাংলা অনুবাদ যোগ করুন।"}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-amber-100 bg-amber-50 p-5">
            <p className="font-english text-sm font-black uppercase tracking-wider text-amber-700">
              Learning Flow
            </p>

            <ol className="font-bangla mt-3 space-y-2 text-sm font-semibold leading-6 text-amber-950">
              <li>১. আগে আয়াত পড়ুন</li>
              <li>২. বাংলা অর্থ দেখুন</li>
              <li>৩. শব্দের trick দেখে মনে রাখুন</li>
            </ol>
          </div>
        </div>

        {/* Word Cards */}
        <div className="mt-7">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-english text-xl font-black text-slate-950">
                Word by Word
              </h2>
              <p className="font-bangla mt-1 text-sm leading-6 text-slate-500">
                প্রতিটি word card খুলে বাংলা অর্থ ও memory trick দেখুন।
              </p>
            </div>
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