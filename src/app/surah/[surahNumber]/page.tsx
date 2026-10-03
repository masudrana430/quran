import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSurahByNumber, getCatalogEntry } from "@/lib/quran";
import QuranReader from "@/components/QuranReader";
type Props = {
  params: Promise<{ surahNumber: string }>;
  searchParams: Promise<{ ayah?: string }>;
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { surahNumber } = await params;
  const s = getCatalogEntry(surahNumber);
  return { title: s ? `${s.nameEnglish} · বাংলা কুরআন` : "সূরা পাওয়া যায়নি" };
}
export default async function SurahPage({ params, searchParams }: Props) {
  const { surahNumber } = await params,
    { ayah } = await searchParams;
  const entry = getCatalogEntry(surahNumber);
  if (!entry) notFound();
  const data = getSurahByNumber(surahNumber);
  if (!data)
    return (
      <section className="empty-state">
        <h1>{entry.nameEnglish}</h1>
        <p>
          এই সূরার আয়াতগুলো এখনো যোগ করা হয়নি। দৈনিক ব্যাচে কনটেন্ট যোগ হচ্ছে।
        </p>
        <Link className="primary-link" href="/">
          প্রস্তুত সূরাগুলো দেখুন
        </Link>
      </section>
    );
  return (
    <QuranReader
      key={surahNumber}
      data={data}
      initialAyah={Number(ayah) || 1}
    />
  );
}
