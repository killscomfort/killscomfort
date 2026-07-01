"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePortalTransit } from "@/components/portal/PortalTransitProvider";
import KillsComfortRide from "./KillsComfortRide";
import reveal from "./rideReveal.module.css";

export function RidePageClient() {
  const router = useRouter();
  const { phase } = usePortalTransit();
  const inTransit = phase === "tunnel" || phase === "release";

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
    <div className={revealClass} aria-hidden={phase === "tunnel" && inTransit}>
      <KillsComfortRide onSkip={() => router.push("/")} />
    </div>
  );
}
