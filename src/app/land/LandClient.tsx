"use client";

import dynamic from "next/dynamic";

const ScrollLandExperience = dynamic(
  () => import("@/components/land/ScrollLandExperience"),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 flex items-center justify-center bg-[#050506] text-[11px] uppercase tracking-[0.4em] text-white/40">
        Loading
      </div>
    ),
  }
);

export default function LandClient() {
  return <ScrollLandExperience />;
}
