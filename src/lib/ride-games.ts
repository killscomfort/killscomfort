export function isRidePath(pathname: string) {
  return pathname === "/ride" || pathname.startsWith("/ride/");
}
