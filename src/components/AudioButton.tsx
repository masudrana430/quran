"use client";

type AudioButtonProps = {
  src: string;
};

export default function AudioButton({ src }: AudioButtonProps) {
  function playAudio() {
    const audio = new Audio(src);
    void audio.play();
  }

  return (
    <button
      type="button"
      onClick={playAudio}
      className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
    >
      Play
    </button>
  );
}