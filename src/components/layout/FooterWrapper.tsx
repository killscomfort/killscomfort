"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { isAcademyPath, isImmersiveLandPath, isRidePath } from "@/lib/ride-games";

export function FooterWrapper() {
  const pathname = usePathname();
  if (
    pathname.startsWith("/lp") ||
    pathname.startsWith("/admin") ||
    isRidePath(pathname) ||
    isImmersiveLandPath(pathname) ||
    isAcademyPath(pathname)
  )
    return null;
  return <Footer />;
}
