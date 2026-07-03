"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { isRidePath } from "@/lib/ride-games";

export function FooterWrapper() {
  const pathname = usePathname();
  if (pathname.startsWith("/lp") || pathname.startsWith("/admin") || isRidePath(pathname)) return null;
  return <Footer />;
}
