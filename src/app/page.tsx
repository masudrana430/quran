import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          Quran Word-by-Word Bangla
        </h1>

        <p className="mt-3 text-slate-600">
          Learn Quran words with Bangla meaning and easy memory tricks.
        </p>

        <Link
          href="/surah/67"
          className="mt-6 inline-block rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-700"
        >
          Start Surah Mulk
        </Link>
      </div>
    </main>
  );
}