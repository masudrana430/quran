import type { SurahInfo } from "@/types/quran";

type SurahIntroProps = {
  surah: SurahInfo;
};

export default function SurahIntro({ surah }: SurahIntroProps) {
  return (
    <section className="py-12 text-center sm:py-16">
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <p
          className="font-arabic-ayah text-8xl leading-none text-black sm:text-9xl"
          dir="rtl"
          lang="ar"
        >
          {surah.nameArabic}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <h2 className="font-english text-3xl font-black text-slate-900 sm:text-4xl">
            {surah.number}. {surah.nameEnglish}
          </h2>

          <span className="rounded-full bg-[#2ca4ab] px-3 py-1 text-sm font-bold text-white">
            অধ্যায়
          </span>
        </div>

        <p className="font-bangla mt-2 text-2xl font-semibold text-slate-500">
          {surah.nameBangla}
        </p>

        <div className="mt-8">
          <p
            className="font-arabic-ayah text-4xl leading-relaxed text-slate-900 sm:text-5xl"
            dir="rtl"
            lang="ar"
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>

          <p className="font-bangla mt-3 text-sm font-medium text-slate-500">
            আল্লাহর নামে শুরু করছি, যিনি পরম করুণাময়, অতি দয়ালু।
          </p>
        </div>
      </div>
    </section>
  );
}