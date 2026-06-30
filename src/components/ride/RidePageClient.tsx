"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import KillsComfortRide from "./KillsComfortRide";

export function RidePageClient() {
  const router = useRouter();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return <KillsComfortRide onSkip={() => router.push("/")} />;
}
