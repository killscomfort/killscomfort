/** Fullscreen warehouse game shell — no site header/footer. */
export function isRidePath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/experience" ||
    pathname.startsWith("/experience/") ||
    pathname === "/ride" ||
    pathname.startsWith("/ride/")
  );
}
