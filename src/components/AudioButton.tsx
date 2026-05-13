"use client";

import { useRef, useState } from "react";

type AudioButtonProps = {
  src: string;
};

export default function AudioButton({ src }: AudioButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  function handlePlay() {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);

      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
      });
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    void audioRef.current.play();
    setIsPlaying(true);
  }

  return (
    <button
      type="button"
      onClick={handlePlay}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700"
    >
      <span>{isPlaying ? "Pause" : "Play"}</span>
      <span>{isPlaying ? "Ⅱ" : "▶"}</span>
    </button>
  );
}