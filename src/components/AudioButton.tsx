"use client";
import { useEffect, useId, useRef, useState } from "react";
export default function AudioButton({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement>(null),
    id = useId();
  const [playing, setPlaying] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    const audio = ref.current;
    const stop = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== id) audio?.pause();
    };
    window.addEventListener("quran-audio-play", stop);
    return () => {
      audio?.pause();
      window.removeEventListener("quran-audio-play", stop);
    };
  }, [id, src]);
  async function toggle() {
    if (!ref.current) return;
    setError("");
    if (!ref.current.paused) {
      ref.current.pause();
      return;
    }
    window.dispatchEvent(new CustomEvent("quran-audio-play", { detail: id }));
    try {
      await ref.current.play();
    } catch {
      setError("অডিও চালু হয়নি। আবার চেষ্টা করুন।");
    }
  }
  return (
    <span className="audio-control">
      <audio
        ref={ref}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => {
          setPlaying(false);
          setError("অডিও পাওয়া যাচ্ছে না।");
        }}
      />
      <button
        type="button"
        onClick={toggle}
        className="tool-button"
        aria-label={playing ? "অডিও থামান" : "অডিও শুনুন"}
      >
        {playing ? "Ⅱ" : "▷"} <span>{playing ? "থামান" : "শুনুন"}</span>
      </button>
      {error && (
        <span role="status" className="audio-error">
          {error}
        </span>
      )}
    </span>
  );
}
