import type { SurahInfo } from "@/types/quran";

type SurahHeaderProps = {
  surah: SurahInfo;
};

export default function SurahHeader({ surah }: SurahHeaderProps) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">Surah {surah.number}</p>

      <div className="mt-2 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {surah.nameEnglish}
          </h1>
          <p className="mt-1 text-lg text-slate-600">{surah.nameBangla}</p>
        </div>

        <h2 className="text-4xl font-bold text-slate-900" dir="rtl" lang="ar">
          {surah.nameArabic}
        </h2>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        Total ayahs: {surah.versesCount}
      </p>
    </section>
  );
}