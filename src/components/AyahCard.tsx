import type { Ayah } from "@/types/quran";
import WordCard from "./WordCard";
import AudioButton from "./AudioButton";

type AyahCardProps = {
  ayah: Ayah;
};

export default function AyahCard({ ayah }: AyahCardProps) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
          Ayah {ayah.ayahNumber}
        </span>

        {ayah.audio ? <AudioButton src={ayah.audio} /> : null}
      </div>

      <p
        className="mt-6 text-right text-4xl leading-loose text-slate-950"
        dir="rtl"
        lang="ar"
      >
        {ayah.arabic}
      </p>

      <p className="mt-4 rounded-xl bg-slate-100 p-4 text-slate-700">
        {ayah.banglaTranslation}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ayah.words.map((word) => (
          <WordCard key={`${ayah.verseKey}-${word.position}`} word={word} />
        ))}
      </div>
    </section>
  );
}