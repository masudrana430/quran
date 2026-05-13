import { getSurahByNumber } from "@/lib/quran";
import QuranTopBar from "@/components/QuranTopBar";
import SurahIntro from "@/components/SurahIntro";
import AyahReader from "@/components/AyahReader";

type SurahPageProps = {
  params:
    | {
        surahNumber: string;
      }
    | Promise<{
        surahNumber: string;
      }>;
};

export default async function SurahPage({ params }: SurahPageProps) {
  const { surahNumber } = await params;
  const surah = getSurahByNumber(surahNumber);

  if (!surah) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-950">
            Surah not found
          </h1>
          <p className="mt-3 text-slate-500">
            This surah is not available yet.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <QuranTopBar surahName={surah.surah.nameEnglish} surahNumber={surah.surah.number} />

      <div className="quran-container px-5">
        <SurahIntro surah={surah.surah} />

        <section className="divide-y divide-slate-200">
          {surah.ayahs.map((ayah) => (
            <AyahReader key={ayah.verseKey} ayah={ayah} />
          ))}
        </section>
      </div>
    </main>
  );
}