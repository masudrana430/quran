import type { QuranWord } from "@/types/quran";

type WordCardProps = {
  word: QuranWord;
};

export default function WordCard({ word }: WordCardProps) {
  const hasTrick = word.memoryTrick.trim().length > 0;
  const hasRoot = Boolean(word.root?.trim());

  return (
    <details className="group overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
      <summary className="cursor-pointer list-none p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
            Word {word.position}
          </span>

          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
            Tap
          </span>
        </div>

        <p
          className="arabic-text mt-5 text-right text-4xl font-bold leading-loose text-slate-950"
          dir="rtl"
          lang="ar"
        >
          {word.arabic}
        </p>

        <p className="mt-2 text-sm font-semibold text-slate-400">
          {word.transliteration || "Transliteration not added"}
        </p>

        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            Bangla Meaning
          </p>

          <p className="mt-2 text-lg font-black leading-7 text-slate-950">
            {word.banglaMeaning || "বাংলা অর্থ যোগ করুন"}
          </p>
        </div>
      </summary>

      <div className="border-t border-slate-100 bg-gradient-to-br from-amber-50 to-emerald-50 p-5">
        <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-white">
          <p className="text-sm font-black text-amber-700">Memory Trick</p>

          <p className="mt-2 leading-7 text-slate-800">
            {hasTrick
              ? word.memoryTrick
              : "এখানে এই শব্দের জন্য সহজ Bangla memory trick লিখুন।"}
          </p>
        </div>

        {hasRoot ? (
          <div className="mt-3 rounded-2xl bg-slate-950 p-4 text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Root
            </p>

            <p className="arabic-text mt-1 text-2xl font-bold" dir="rtl">
              {word.root}
            </p>
          </div>
        ) : null}
      </div>
    </details>
  );
}