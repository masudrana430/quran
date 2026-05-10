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
      <main className="min-h-screen p-6">
        <h1 className="text-2xl font-bold">Surah not found</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <SurahHeader surah={surah.surah} />

        <div className="space-y-6">
          {surah.ayahs.map((ayah) => (
            <AyahCard key={ayah.verseKey} ayah={ayah} />
          ))}
        </div>
      </div>
    </main>
  );
}