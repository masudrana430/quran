import { getSurahByNumber } from "@/lib/quran";
import SurahHeader from "@/components/SurahHeader";
import AyahCard from "@/components/AyahCard";

type SurahPageProps = {
  params: Promise<{
    surahNumber: string;
  }>;
};

export default async function SurahPage({ params }: SurahPageProps) {
  const { surahNumber } = await params;
  const surah = getSurahByNumber(surahNumber);

  if (!surah) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
          <h1 className="text-2xl font-black text-slate-950">
            Surah not found
          </h1>
          <p className="mt-3 text-slate-600">
            This Surah data is not available yet.
          </p>
        </div>
      </main>
    );
  }

  const totalWords = surah.ayahs.reduce(
    (total, ayah) => total + ayah.words.length,
    0
  );

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SurahHeader
          surah={surah.surah}
          totalWords={totalWords}
          totalAyahs={surah.ayahs.length}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-6 rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
              <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Ayah list
              </p>

              <div className="mt-4 grid grid-cols-5 gap-2">
                {surah.ayahs.map((ayah) => (
                  <a
                    key={ayah.verseKey}
                    href={`#ayah-${ayah.ayahNumber}`}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    {ayah.ayahNumber}
                  </a>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-emerald-50 p-4">
                <p className="font-bold text-emerald-900">Study tip</p>
                <p className="mt-2 text-sm leading-6 text-emerald-800">
                  আগে আয়াত পড়ুন, তারপর translation, এরপর word card খুলে memory
                  trick দেখুন।
                </p>
              </div>
            </div>
          </aside>

          <section className="space-y-7">
            {surah.ayahs.map((ayah) => (
              <AyahCard key={ayah.verseKey} ayah={ayah} />
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}