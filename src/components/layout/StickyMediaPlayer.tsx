"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Pause, Play, X } from "lucide-react";
import { getLaunchTrack } from "@/lib/music";
import { isAcademyPath, isImmersiveLandPath, isRidePath } from "@/lib/ride-games";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "killscomfort-sticky-player-dismissed";

function getListenUrl(release: NonNullable<ReturnType<typeof getLaunchTrack>>) {
  return (
    release.links.listen ??
    release.links.spotify ??
    release.links.soundcloud ??
    release.links.appleMusic
  );
}

function pauseOtherAudio(except?: HTMLAudioElement | null) {
  document.querySelectorAll("audio").forEach((element) => {
    if (element !== except) {
      element.pause();
    }
  });
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function StickyMediaPlayer() {
  const pathname = usePathname();
  const release = getLaunchTrack();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const hiddenRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/lp") ||
    isRidePath(pathname) ||
    isImmersiveLandPath(pathname) ||
    isAcademyPath(pathname) ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  const dismiss = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
    document.body.classList.remove("sticky-player-active");
  }, []);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    pauseOtherAudio(audio);
    try {
      await audio.play();
      setPlaying(true);
      setAutoplayBlocked(false);
    } catch {
      setAutoplayBlocked(true);
    }
  }, [playing]);

  useEffect(() => {
    if (hiddenRoute || !release?.previewUrl) {
      document.body.classList.remove("sticky-player-active");
      return;
    }

    if (sessionStorage.getItem(DISMISS_KEY)) {
      setVisible(false);
      return;
    }

    setVisible(true);
    document.body.classList.add("sticky-player-active");

    const audio = audioRef.current;
    if (!audio) return;

    pauseOtherAudio(audio);
    audio.play()
      .then(() => {
        setPlaying(true);
        setAutoplayBlocked(false);
      })
      .catch(() => {
        setPlaying(false);
        setAutoplayBlocked(true);
      });

    return () => {
      document.body.classList.remove("sticky-player-active");
    };
  }, [hiddenRoute, release?.previewUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setProgress(audio.currentTime);
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [visible, release?.previewUrl]);

  if (!visible || hiddenRoute || !release?.previewUrl) {
    return null;
  }

  const listenUrl = getListenUrl(release);
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div
      className="sticky-media-player fixed inset-x-0 bottom-0 z-[45] border-t border-clay/70 bg-bone/92 backdrop-blur-md"
      role="region"
      aria-label="Now playing"
    >
      <div
        className="absolute inset-x-0 top-0 h-px bg-clay/60"
        aria-hidden
      >
        <div
          className="h-full bg-near-black/75 transition-[width] duration-150"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <audio
          ref={audioRef}
          src={release.previewUrl}
          preload="auto"
          data-sticky-player
        />

        <button
          type="button"
          onClick={togglePlay}
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors",
            playing
              ? "border-near-black/20 bg-near-black text-bone"
              : "border-clay bg-bone/80 text-near-black hover:border-near-black/40"
          )}
          aria-label={playing ? "Pause track" : "Play track"}
        >
          {playing ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="h-4 w-4 fill-current pl-0.5" />
          )}
        </button>

        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-clay/70">
          <Image
            src={release.coverUrl}
            alt=""
            width={44}
            height={44}
            unoptimized
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-near-black">{release.title}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-near-black/45">
            {autoplayBlocked && !playing
              ? "Tap play to start"
              : `${formatTime(progress)} / ${formatTime(duration)}`}
          </p>
        </div>

        {listenUrl && (
          <Link
            href={listenUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-near-black/55 transition-colors hover:text-near-black sm:flex"
          >
            Full track
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}

        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-full p-1.5 text-near-black/45 transition-colors hover:bg-desert-sand hover:text-near-black"
          aria-label="Close player"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
