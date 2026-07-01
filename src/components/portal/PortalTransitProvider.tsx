"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { PortalVortex } from "./PortalVortex";
import transit from "./portalTransit.module.css";

const STORAGE_KEY = "kc-portal-transit";
const ENGULF_MS = 850;
const RELEASE_MS = 1050;

type Phase = "idle" | "engulf" | "tunnel" | "release";

type PortalTransitContextValue = {
  phase: Phase;
  isActive: boolean;
  startPortalTransit: () => void;
};

const PortalTransitContext = createContext<PortalTransitContextValue | null>(null);

export function usePortalTransit() {
  const ctx = useContext(PortalTransitContext);
  if (!ctx) {
    throw new Error("usePortalTransit must be used within PortalTransitProvider");
  }
  return ctx;
}

export function PortalTransitProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const navigateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const releasingRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (navigateTimer.current) clearTimeout(navigateTimer.current);
    if (releaseTimer.current) clearTimeout(releaseTimer.current);
    navigateTimer.current = null;
    releaseTimer.current = null;
  }, []);

  const finishTransit = useCallback(() => {
    clearTimers();
    releasingRef.current = false;
    setPhase("idle");
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, [clearTimers]);

  const beginRelease = useCallback(() => {
    if (releasingRef.current) return;
    releasingRef.current = true;
    setPhase("release");
    releaseTimer.current = setTimeout(finishTransit, RELEASE_MS);
  }, [finishTransit]);

  const startPortalTransit = useCallback(() => {
    if (phase !== "idle") return;
    clearTimers();
    try {
      sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setPhase("engulf");
    router.prefetch("/ride");

    navigateTimer.current = setTimeout(() => {
      setPhase("tunnel");
      router.push("/ride");
    }, ENGULF_MS);
  }, [clearTimers, phase, router]);

  useEffect(() => {
    if (pathname !== "/ride" || phase !== "tunnel") return;
    requestAnimationFrame(() => {
      requestAnimationFrame(beginRelease);
    });
  }, [pathname, phase, beginRelease]);

  useEffect(() => {
    if (pathname !== "/ride" || phase !== "idle") return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) {
        setPhase("tunnel");
      }
    } catch {
      /* ignore */
    }
  }, [pathname, phase]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const vortexClass =
    phase === "engulf"
      ? transit.engulfVortex
      : phase === "tunnel"
        ? transit.tunnelVortex
        : phase === "release"
          ? transit.releaseVortex
          : "";

  const overlayClass = [
    transit.overlay,
    phase !== "idle" ? transit.overlayActive : "",
    phase === "engulf" ? transit.engulf : "",
    phase === "tunnel" ? transit.tunnel : "",
    phase === "release" ? transit.release : "",
  ]
    .filter(Boolean)
    .join(" ");

  const value = useMemo(
    () => ({
      phase,
      isActive: phase !== "idle",
      startPortalTransit,
    }),
    [phase, startPortalTransit],
  );

  return (
    <PortalTransitContext.Provider value={value}>
      {children}
      <div className={overlayClass} aria-hidden={phase === "idle"}>
        <div className={transit.tunnelWash} />
        <div className={transit.streakField} />
        <div className={`${transit.vortexShell} ${vortexClass}`}>
          <PortalVortex intense />
        </div>
      </div>
    </PortalTransitContext.Provider>
  );
}
