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
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-xl text-slate-400 transition hover:bg-[#e9f8f9] hover:text-[#2ca4ab]"
      aria-label={isPlaying ? "Pause audio" : "Play audio"}
    >
      {isPlaying ? "Ⅱ" : "▷"}
    </button>
  );
}