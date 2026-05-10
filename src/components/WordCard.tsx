import type { QuranWord } from "@/types/quran";

type WordCardProps = {
  word: QuranWord;
};

export default function WordCard({ word }: WordCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p
        className="text-right text-3xl font-bold leading-loose text-slate-950"
        dir="rtl"
        lang="ar"
      >
        {word.arabic}
      </p>

      <p className="mt-2 text-sm text-slate-500">{word.transliteration}</p>

      <p className="mt-3 font-semibold text-slate-900">
        {word.banglaMeaning}
      </p>

      {word.memoryTrick ? (
        <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          <span className="font-semibold">Memory trick: </span>
          {word.memoryTrick}
        </div>
      ) : null}

      {word.root ? (
        <p className="mt-3 text-xs text-slate-500">
          Root: <span className="font-medium">{word.root}</span>
        </p>
      ) : null}
    </div>
  );
}