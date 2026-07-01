"use client";

import { useEffect } from "react";
import { usePortalTransit } from "@/components/portal/PortalTransitProvider";
import reveal from "./rideReveal.module.css";

export function RideGameShell({ children }: { children: React.ReactNode }) {
  const { phase } = usePortalTransit();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const revealClass = [
    reveal.reveal,
    phase === "tunnel" ? reveal.revealHidden : "",
    phase === "release" ? reveal.revealActive : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={revealClass} aria-hidden={phase === "tunnel"}>
      {children}
    </div>
  );
}
