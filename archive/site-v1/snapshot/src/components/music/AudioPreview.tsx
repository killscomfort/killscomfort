"use client";

import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

type AudioPreviewProps = {
  previewUrl: string;
  title: string;
  overlay?: boolean;
  className?: string;
};

export function AudioPreview({
  previewUrl,
  title,
  overlay = false,
  className,
}: AudioPreviewProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    document.querySelectorAll("audio[data-release-preview]").forEach((el) => {
      if (el !== audio) {
        (el as HTMLAudioElement).pause();
      }
    });

    audio.play();
    setPlaying(true);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={previewUrl}
        data-release-preview
        preload="none"
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? `Pause preview of ${title}` : `Play preview of ${title}`}
        className={cn(
          "flex items-center gap-2 text-xs uppercase tracking-widest transition-colors",
          overlay
            ? "absolute bottom-3 right-3 border border-bone/20 bg-near-black/80 px-3 py-2 text-bone backdrop-blur-sm hover:border-muted-gold hover:text-muted-gold"
            : "border border-clay/30 px-4 py-2 text-bone/70 hover:border-muted-gold hover:text-muted-gold",
          className
        )}
      >
        {playing ? (
          <Pause className="h-3.5 w-3.5 fill-current" />
        ) : (
          <Play className="h-3.5 w-3.5 fill-current" />
        )}
        {playing ? "Pause" : "Preview"}
      </button>
    </>
  );
}
