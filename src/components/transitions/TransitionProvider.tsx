"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  clampDuration,
  resolveTransitionConfig,
  type TransitionConfig,
  type TransitionRouteKey,
} from "@/lib/transitions/config";

type NavigateWithTransition = (
  href: string,
  config?: TransitionRouteKey | TransitionConfig
) => Promise<void>;

const TransitionContext = createContext<{
  busy: boolean;
  navigateWithTransition: NavigateWithTransition;
} | null>(null);

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function CinematicOverlay({
  config,
  phase,
}: {
  config: TransitionConfig;
  phase: "in" | "out";
}) {
  const dur = clampDuration(config.duration) / 1000;
  const isWhip = config.type === "whipPan";
  const isZoom = config.type === "zoom";
  const isFreeze = config.type === "freezeReveal";

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[200] overflow-hidden bg-[#060607]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
      aria-hidden
    >
      <motion.div
        className="absolute inset-0 bg-[#060607]"
        initial={
          phase === "in"
            ? isFreeze
              ? { clipPath: "inset(0 100% 0 0)" }
              : isWhip
                ? { x: "100%", filter: "blur(12px)" }
                : isZoom
                  ? { scale: 1.08, opacity: 0.2 }
                  : { x: "6%", opacity: 0.4 }
            : { opacity: 0 }
        }
        animate={
          phase === "in"
            ? { clipPath: "inset(0 0 0 0)", x: 0, scale: 1, opacity: 1, filter: "blur(0px)" }
            : isWhip
              ? { x: "-110%", filter: `blur(${config.blur}px)`, opacity: 0.1 }
              : { scale: 1.12, opacity: 0, filter: `blur(${config.blur}px)` }
        }
        transition={{ duration: dur * (phase === "in" ? 0.55 : 0.45), ease: [0.22, 0.95, 0.28, 1] }}
      />
      <motion.div
        className="absolute inset-0 mix-blend-screen"
        style={{
          background:
            "linear-gradient(90deg,rgba(255,0,80,.18),transparent 40%,transparent 60%,rgba(0,220,255,.18))",
        }}
        initial={{ opacity: 0, x: 0 }}
        animate={{ opacity: isFreeze ? [0, 0.7, 0] : 0, x: isFreeze ? [0, 8, 0] : 0 }}
        transition={{ duration: dur * 0.7 }}
      />
      <motion.div
        className="absolute inset-0 bg-[#f4f5f7]"
        initial={{ opacity: 0 }}
        animate={{ opacity: config.flash > 0 ? [0, config.flash, 0] : 0 }}
        transition={{ duration: dur * 0.6 }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 1px,transparent 1px 3px)",
        }}
      />
    </motion.div>
  );
}

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [overlay, setOverlay] = useState<{
    config: TransitionConfig;
    phase: "in" | "out";
  } | null>(null);

  const navigateWithTransition: NavigateWithTransition = useCallback(
    async (href, configKey = "experience:site") => {
      if (busyRef.current) return;
      const config = resolveTransitionConfig(configKey);
      const reduceMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      busyRef.current = true;
      setBusy(true);

      if (reduceMotion) {
        router.push(href);
        busyRef.current = false;
        setBusy(false);
        return;
      }

      setOverlay({ config, phase: "out" });
      await wait(clampDuration(config.duration) * 0.45);
      router.push(href);
      setOverlay({ config, phase: "in" });
      await wait(clampDuration(config.duration) * 0.55);
      setOverlay(null);
      busyRef.current = false;
      setBusy(false);
    },
    [router]
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== "kc:navigate" || typeof event.data.href !== "string") {
        return;
      }
      const cfg = event.data.transition as TransitionConfig | undefined;
      navigateWithTransition(event.data.href, cfg ?? "experience:site");
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [navigateWithTransition]);

  const value = useMemo(
    () => ({ busy, navigateWithTransition }),
    [busy, navigateWithTransition]
  );

  return (
    <TransitionContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {overlay ? <CinematicOverlay key="kc-overlay" {...overlay} /> : null}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}

export function useCinematicTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    throw new Error("useCinematicTransition must be used within TransitionProvider");
  }
  return ctx;
}
