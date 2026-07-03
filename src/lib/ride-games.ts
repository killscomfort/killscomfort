/** Fullscreen warehouse game shell — no site header/footer. */
export function isRidePath(pathname: string) {
  return pathname === "/" || pathname === "/ride" || pathname.startsWith("/ride/");
}
