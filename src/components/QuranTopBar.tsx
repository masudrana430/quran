type QuranTopBarProps = {
  surahName: string;
  surahNumber: number;
};

export default function QuranTopBar({
  surahName,
  surahNumber,
}: QuranTopBarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <h1 className="font-english text-2xl font-black tracking-tight text-slate-950">
            Quran.com
          </h1>

          <div className="hidden h-8 w-px bg-slate-200 sm:block" />

          <button className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 sm:flex">
            {surahNumber}. {surahName}
            <span className="text-slate-400">⌄</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-full border border-[#2ca4ab] px-4 py-2 text-sm font-bold text-[#2ca4ab] transition hover:bg-[#e9f8f9]">
            শেখা শুরু
          </button>

          <button className="flex h-10 w-10 items-center justify-center rounded-full text-xl transition hover:bg-slate-100">
            ◯
          </button>

          <button className="flex h-10 w-10 items-center justify-center rounded-full text-xl transition hover:bg-slate-100">
            ⌕
          </button>

          <button className="flex h-10 w-10 items-center justify-center rounded-full text-xl transition hover:bg-slate-100">
            ☰
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100">
        <div className="quran-container flex items-center justify-between px-5 py-3">
          <p className="font-bangla text-sm font-semibold text-slate-500">
            পাতা ৫৬২ · জুজ ২৯ · হিজব ৫৭
          </p>

          <div className="flex rounded-full bg-slate-100 p-1">
            <button className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-sm">
              পদ দ্বারা পদ
            </button>
            <button className="rounded-full px-4 py-2 text-sm font-bold text-slate-500">
              পড়া
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}