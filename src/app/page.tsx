import Link from "next/link";

const features = [
  {
    title: "Word-by-word Bangla",
    description: "প্রতিটি আরবি শব্দের পাশে সহজ বাংলা অর্থ।",
  },
  {
    title: "Memory tricks",
    description: "শব্দ মনে রাখার জন্য sound, root, meaning based tricks।",
  },
  {
    title: "Clean reading mode",
    description: "আরবি আয়াত, বাংলা অনুবাদ ও শব্দগুলো আলাদা সুন্দরভাবে দেখা যাবে।",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <section className="relative px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <nav className="flex items-center justify-between rounded-3xl border border-white/70 bg-white/75 px-5 py-4 shadow-sm backdrop-blur-xl">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                Quran Bangla Learning
              </p>
              <h1 className="text-lg font-bold text-slate-950">
                Word by Word
              </h1>
            </div>

            <Link
              href="/surah/67"
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              Start Learning
            </Link>
          </nav>

          <div className="grid items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
            <div>
              <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
                Start with Surah Al-Mulk
              </div>

              <h2 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-7xl">
                Learn Quran words with{" "}
                <span className="bg-gradient-to-r from-emerald-700 to-amber-600 bg-clip-text text-transparent">
                  Bangla meaning
                </span>{" "}
                and smart tricks.
              </h2>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                প্রতিটি আয়াত পড়ুন, শব্দের অর্থ বুঝুন, তারপর সহজ Bangla memory
                trick দিয়ে শব্দগুলো মনে রাখুন।
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/surah/67"
                  className="rounded-2xl bg-emerald-600 px-7 py-4 text-center font-bold text-white shadow-xl shadow-emerald-600/20 transition hover:-translate-y-1 hover:bg-emerald-700"
                >
                  Start Surah Mulk
                </Link>

                <a
                  href="#features"
                  className="rounded-2xl border border-slate-200 bg-white px-7 py-4 text-center font-bold text-slate-800 transition hover:-translate-y-1 hover:border-emerald-200 hover:text-emerald-700"
                >
                  See Features
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-emerald-200/60 via-white to-amber-200/60 blur-2xl" />

              <div className="relative rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-2xl backdrop-blur-xl">
                <div className="rounded-[1.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white">
                  <p className="text-sm font-semibold text-emerald-200">
                    Surah Al-Mulk · Ayah 1
                  </p>

                  <p
                    className="arabic-text mt-6 text-right text-4xl leading-loose sm:text-5xl"
                    dir="rtl"
                    lang="ar"
                  >
                    تَبَارَكَ ٱلَّذِي بِيَدِهِ ٱلْمُلْكُ
                  </p>

                  <div className="mt-6 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                    <p className="text-sm text-slate-300">Bangla meaning</p>
                    <p className="mt-1 text-lg font-semibold">
                      বরকতময় তিনি, যাঁর হাতে রাজত্ব।
                    </p>
                  </div>

                  <div className="mt-4 rounded-2xl bg-amber-300/15 p-4 ring-1 ring-amber-200/20">
                    <p className="text-sm font-semibold text-amber-100">
                      Memory trick
                    </p>
                    <p className="mt-1 text-sm leading-6 text-amber-50">
                      تَبَارَكَ → বারাকা/বরকত; মানে বরকতময়।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section id="features" className="grid gap-4 pb-16 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-xl font-bold text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}