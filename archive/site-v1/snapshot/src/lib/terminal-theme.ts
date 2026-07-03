/** LOCAL DEV ONLY — enabled via NEXT_PUBLIC_TERMINAL_THEME=1 or =true */
export function isTerminalThemeEnabled(): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  const flag = process.env.NEXT_PUBLIC_TERMINAL_THEME;
  return flag === "1" || flag === "true";
}

/** Terminal CLI design tokens (mirrored in globals.experiment.css) */
export const TERMINAL_TOKENS = {
  background: "#0a0a0a",
  primary: "#33ff00",
  secondary: "#ffb000",
  muted: "#1f521f",
  error: "#ff3333",
  glow: "0 0 5px rgba(51, 255, 0, 0.5)",
} as const;

export const TERMINAL_ASCII_LOGO = `██╗  ██╗██╗██╗     ██╗     ███████╗
██║ ██╔╝██║██║     ██║     ██╔════╝
█████╔╝ ██║██║     ██║     ███████╗
██╔═██╗ ██║██║     ██║     ╚════██║
██║  ██╗██║███████╗███████╗███████║
╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚══════╝
 ██████╗ ██████╗ ███╗   ███╗███████╗ ██████╗ ██████╗ ████████╗`;

export const TERMINAL_MIAMI_STATUS =
  "> geo.lock: MIAMI_AREA // status: [OK] // tz: EST";

export const TERMINAL_INPUT_PROMPT = "user@killscomfort:~$";
