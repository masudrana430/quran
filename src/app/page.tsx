import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="quran-container px-5 py-10">
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
          <p className="rounded-full bg-[#e9f8f9] px-4 py-2 text-sm font-bold text-[#2ca4ab]">
            Quran Word by Word Bangla
          </p>

          <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-7xl">
            Learn Quran words with Bangla meaning and smart memorization tricks.
          </h1>

          <p className="font-bangla mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            আয়াত পড়ুন, প্রতিটি আরবি শব্দে ক্লিক করুন, বাংলা অর্থ,
            ট্রান্সলিটারেশন এবং মনে রাখার সহজ trick দেখুন।
          </p>

          <Link
            href="/surah/67"
            className="mt-8 rounded-full bg-[#2ca4ab] px-8 py-4 text-base font-bold text-white shadow-lg shadow-cyan-900/10 transition hover:-translate-y-0.5 hover:bg-[#238d94]"
          >
            Start Surah Al-Mulk
          </Link>
        </div>
      </section>
    </main>
  );
}