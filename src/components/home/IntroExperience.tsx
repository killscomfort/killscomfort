"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  INTRO_COMPLETE_EVENT,
  hasSeenIntro,
  rememberIntro,
} from "@/lib/intro";
import styles from "./IntroExperience.module.css";

type IntroState = "boot" | "playing" | "static" | "ended" | "done";

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
  };
};

const LOAD_TIMEOUT_MS = 12_000;

export function IntroExperience() {
  const [state, setState] = useState<IntroState>("boot");
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const startedRef = useRef(false);
  const playStartedAtRef = useRef(0);
  const aliveRef = useRef(true);

  const completeIntro = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    rememberIntro();
    window.dispatchEvent(new Event(INTRO_COMPLETE_EVENT));
  }, []);

  const enterSite = useCallback(() => {
    completeIntro();
    document.getElementById("main-site")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  }, [completeIntro]);

  const enterStatic = useCallback(() => {
    if (startedRef.current) return;
    setState("static");
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    if (hasSeenIntro()) {
      startedRef.current = true;
      setState("done");
      window.dispatchEvent(new Event(INTRO_COMPLETE_EVENT));
      return () => { aliveRef.current = false; };
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const saveData = (navigator as NavigatorWithConnection).connection?.saveData;

    setState(prefersReducedMotion || saveData ? "static" : "playing");

    return () => {
      aliveRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (state !== "playing") return;

    const timeout = window.setTimeout(() => {
      // Never trap the visitor if media never becomes playable.
      enterStatic();
    }, LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timeout);
  }, [enterStatic, state]);

  useEffect(() => {
    if (state === "playing" || state === "static") {
      actionRef.current?.focus({ preventScroll: true });
    }
  }, [state]);

  useEffect(() => {
    if (state !== "playing" && state !== "static" && state !== "ended") return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        enterSite();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enterSite, state]);

  useEffect(() => {
    if (state === "boot" || state === "done") return;

    const onScroll = () => {
      const section = sectionRef.current;
      if (section && window.scrollY > section.offsetHeight * 0.25) {
        completeIntro();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [completeIntro, state]);

  async function handleCanPlay() {
    const video = videoRef.current;
    if (!video || state !== "playing" || startedRef.current) return;

    try {
      await video.play();
      playStartedAtRef.current = performance.now();
    } catch (error) {
      // React Strict Mode remounts abort in-flight play(); ignore that.
      if (!aliveRef.current) return;
      if (error instanceof DOMException && error.name === "AbortError") return;
      enterStatic();
    }
  }

  function handleEnded() {
    const video = videoRef.current;
    const elapsed = performance.now() - playStartedAtRef.current;
    // Guard against spurious ended events during remount / source probing.
    if (!video || video.currentTime < 2 || elapsed < 1500) return;
    completeIntro();
    setProgress(1);
    setState("ended");
  }

  function handleError() {
    if (!aliveRef.current || startedRef.current) return;
    enterStatic();
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    setProgress(Math.min(1, video.currentTime / video.duration));
  }

  if (state === "boot" || state === "done") return null;

  const isStatic = state === "static";
  const showVideo = state === "playing" || state === "ended";

  return (
    <section
      ref={sectionRef}
      className={styles.intro}
      aria-label="KILLSCOMFORT animated introduction"
    >
          <div className={styles.ambient} aria-hidden="true" />

          <div className={styles.mediaFrame} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.poster}
              src="/video/intro/killscomfort-intro-poster.webp"
              alt=""
              width={1280}
              height={720}
              fetchPriority="high"
            />

            {showVideo && (
              <video
                ref={videoRef}
                className={styles.video}
                autoPlay
                muted
                playsInline
                preload="auto"
                poster="/video/intro/killscomfort-intro-poster.webp"
                onCanPlay={handleCanPlay}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onError={handleError}
              >
                <source
                  src="/video/intro/killscomfort-intro.mp4"
                  type="video/mp4"
                />
                <source
                  src="/video/intro/killscomfort-intro.webm"
                  type="video/webm"
                />
              </video>
            )}
          </div>

          <div className={styles.vignette} aria-hidden="true" />

          <p className={styles.srOnly}>
            KILLSCOMFORT. A silent mechanical animation introduces the site.
            Press Escape or use Skip intro to continue.
          </p>

          {(state === "playing" || isStatic || state === "ended") && (
            <button
              ref={actionRef}
              className={styles.action}
              type="button"
              onClick={enterSite}
            >
              {isStatic || state === "ended" ? "Enter site" : "Skip intro"}
              <span aria-hidden="true"> ↓</span>
            </button>
          )}

          <div className={styles.progressTrack} aria-hidden="true">
            <div
              className={styles.progressBar}
              style={{ transform: `scaleX(${isStatic ? 1 : progress})` }}
            />
          </div>
    </section>
  );
}
