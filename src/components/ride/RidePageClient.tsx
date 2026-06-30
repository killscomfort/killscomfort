"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Archivo_Narrow, Space_Mono } from "next/font/google";
import KillsComfortRide from "./KillsComfortRide";

const rideDisplay = Archivo_Narrow({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-ride-display",
  display: "swap",
});

const rideMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-ride-mono",
  display: "swap",
});

export function RidePageClient() {
  const router = useRouter();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className={`${rideDisplay.variable} ${rideMono.variable} fixed inset-0 z-[200] h-[100dvh] w-full bg-near-black`}
    >
      <KillsComfortRide onSkip={() => router.push("/")} />
    </div>
  );
}
