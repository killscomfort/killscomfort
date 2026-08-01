export const INTRO_SESSION_KEY = "killscomfort:intro-seen:v1";
export const INTRO_COMPLETE_EVENT = "killscomfort:intro-complete";

export function hasSeenIntro(): boolean {
  if (typeof window === "undefined") return false;

  try {
    return window.sessionStorage.getItem(INTRO_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function rememberIntro(): void {
  try {
    window.sessionStorage.setItem(INTRO_SESSION_KEY, "1");
  } catch {
    // Storage can be unavailable in private or restricted browsing.
  }
}
