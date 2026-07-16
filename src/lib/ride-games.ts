/** Fullscreen warehouse game shell — no site header/footer. */
export function isRidePath(pathname: string) {
  return (
    pathname === "/warehouse" ||
    pathname.startsWith("/warehouse/") ||
    pathname === "/experience" ||
    pathname.startsWith("/experience/") ||
    pathname === "/ride" ||
    pathname.startsWith("/ride/")
  );
}

/** Immersive scroll/3D landings — hide site chrome + falling logos. */
export function isImmersiveLandPath(pathname: string) {
  return pathname === "/land" || pathname.startsWith("/land/");
}

/** Academy course shell — own chrome; hide site header/footer/player. */
export function isAcademyPath(pathname: string) {
  return pathname === "/academy" || pathname.startsWith("/academy/");
}
