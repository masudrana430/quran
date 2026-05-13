import Link from "next/link";
import type { SurahInfo } from "@/types/quran";

type SurahHeaderProps = {
  surah: SurahInfo;
  totalWords: number;
  totalAyahs: number;
};

export default function SurahHeader({
  surah,
  totalWords,
  totalAyahs,
}: SurahHeaderProps) {
  return (
    <header className="rounded-[2rem] border border-white/80 bg-white/80 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-5 py-8 text-white sm:px-8 lg:px-10">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/"
              className="font-english inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-100 ring-1 ring-white/15 transition hover:bg-white/15"
            >
              ← Back to Home
            </Link>

            <p className="font-english mt-8 text-sm font-bold uppercase tracking-[0.3em] text-emerald-200">
              Surah {surah.number}
            </p>

            <div className="mt-3 flex flex-wrap items-end gap-4">
              <h1 className="font-english text-4xl font-black tracking-tight sm:text-6xl">
                {surah.nameEnglish}
              </h1>

              <p
                className="font-arabic-ayah text-5xl font-bold text-amber-100 sm:text-6xl"
                dir="rtl"
                lang="ar"
              >
                {surah.nameArabic}
              </p>
            </div>

            <p className="font-bangla mt-4 text-xl font-semibold text-slate-200">
              {surah.nameBangla}
            </p>

            <p className="font-bangla mt-4 max-w-2xl leading-7 text-slate-300">
              Word-by-word বাংলা অর্থ, আয়াতের অনুবাদ, এবং সহজ memory trick দিয়ে
              Quran vocabulary শেখার সুন্দর পদ্ধতি।
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Ayahs" value={totalAyahs} />
            <StatCard label="Words" value={totalWords} />
            <StatCard label="Mode" value="Study" />
          </div>
        </div>
      </div>
    </header>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/10 px-5 py-4 text-center ring-1 ring-white/10">
      <p className="font-english text-2xl font-black text-white">{value}</p>
      <p className="font-english mt-1 text-xs font-bold uppercase tracking-wider text-slate-300">
        {label}
      </p>
    </div>
  );
}