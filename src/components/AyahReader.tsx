"use client";

import { useMemo, useState } from "react";
import type { Ayah, QuranWord } from "@/types/quran";
import AudioButton from "./AudioButton";

type AyahReaderProps = {
  ayah: Ayah;
};

export default function AyahReader({ ayah }: AyahReaderProps) {
  const [selectedWord, setSelectedWord] = useState<QuranWord | null>(null);

  const selectedWordLabel = useMemo(() => {
    if (!selectedWord) return null;

    return {
      meaning: selectedWord.banglaMeaning || "বাংলা অর্থ যোগ করুন",
      transliteration:
        selectedWord.transliteration || "Transliteration যোগ করা হয়নি",
      trick: selectedWord.memoryTrick || "এই শব্দের memory trick এখনো যোগ করা হয়নি।",
      root: selectedWord.root?.trim() || "",
    };
  }, [selectedWord]);

  return (
    <article id={`ayah-${ayah.ayahNumber}`} className="scroll-mt-32 py-9">
      <div className="grid gap-6 lg:grid-cols-[120px_1fr]">
        {/* Left verse tools */}
        <aside className="flex items-center justify-between gap-4 lg:block">
          <div className="font-bangla text-xl font-bold text-slate-400">
            ৬৭:{toBanglaNumber(ayah.ayahNumber)}
          </div>

          <div className="mt-0 flex items-center gap-4 text-slate-400 lg:mt-4">
            {ayah.audio ? <AudioButton src={ayah.audio} /> : null}

            <button className="text-2xl transition hover:text-[#2ca4ab]">
              ♡
            </button>
          </div>
        </aside>

        {/* Main verse content */}
        <div>
          <div className="mb-5 flex items-center justify-end gap-4 text-slate-400">
            <button className="text-2xl transition hover:text-[#2ca4ab]">
              ⧉
            </button>
            <button className="text-2xl transition hover:text-[#2ca4ab]">
              ⤴
            </button>
            <button className="text-2xl transition hover:text-[#2ca4ab]">
              ✎
            </button>
            <button className="text-2xl transition hover:text-[#2ca4ab]">
              ⋯
            </button>
          </div>

          {selectedWord && selectedWordLabel ? (
            <div className="relative mb-8 rounded-xl bg-[#e9f8f9] px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setSelectedWord(null)}
                className="absolute right-4 top-4 text-xl text-slate-500 transition hover:text-slate-900"
                aria-label="Close word info"
              >
                ×
              </button>

              <div className="pr-8">
                <p className="font-bangla text-lg leading-8 text-slate-900">
                  <span className="font-bold">অনুবাদ:</span>{" "}
                  {selectedWordLabel.meaning}
                </p>

                <p className="font-bangla mt-2 text-lg leading-8 text-slate-900">
                  <span className="font-bold">ট্রান্সলিটারেশন:</span>{" "}
                  {selectedWordLabel.transliteration}
                </p>

                <p className="font-bangla mt-2 text-lg leading-8 text-slate-900">
                  <span className="font-bold text-[#2ca4ab]">
                    মনে রাখার trick:
                  </span>{" "}
                  {selectedWordLabel.trick}
                </p>

                {selectedWordLabel.root ? (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-600">
                    Root:
                    <span
                      className="font-arabic-word text-xl text-slate-950"
                      dir="rtl"
                      lang="ar"
                    >
                      {selectedWordLabel.root}
                    </span>
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div
            className="font-arabic-ayah flex flex-row-reverse flex-wrap justify-start gap-x-3 gap-y-4 text-right text-4xl leading-[2.2] text-slate-950 sm:text-5xl lg:text-[3.4rem]"
            dir="rtl"
            lang="ar"
          >
            {ayah.words.map((word) => {
              const active = selectedWord?.position === word.position;

              return (
                <button
                  key={`${ayah.verseKey}-${word.position}`}
                  type="button"
                  onClick={() => setSelectedWord(word)}
                  className={`word-token rounded-lg px-1.5 py-0.5 text-right ${
                    active ? "word-token-active" : ""
                  }`}
                  title={word.banglaMeaning}
                >
                  {word.arabic}
                </button>
              );
            })}

            <span className="font-arabic-word inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-slate-300 text-xl text-slate-700">
              {toArabicNumber(ayah.ayahNumber)}
            </span>
          </div>

          <p className="font-bangla mt-8 text-2xl font-medium leading-[2.1] text-slate-900">
            {ayah.banglaTranslation ||
              "এখানে এই আয়াতের বাংলা অনুবাদ যোগ করুন।"}
          </p>

          <div className="font-bangla mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 text-base font-semibold text-slate-400">
            <button className="transition hover:text-[#2ca4ab]">▭ তাফসীর</button>
            <span className="h-5 w-px bg-slate-200" />
            <button className="transition hover:text-[#2ca4ab]">
              ▱ ধাপ বা পর্যায়সমূহ
            </button>
            <span className="h-5 w-px bg-slate-200" />
            <button className="transition hover:text-[#2ca4ab]">▱ পাঠ</button>
            <span className="h-5 w-px bg-slate-200" />
            <button className="transition hover:text-[#2ca4ab]">
              ◯ প্রতিফলন
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function toBanglaNumber(value: number) {
  const map = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

  return String(value)
    .split("")
    .map((digit) => map[Number(digit)])
    .join("");
}

function toArabicNumber(value: number) {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  return String(value)
    .split("")
    .map((digit) => map[Number(digit)])
    .join("");
}