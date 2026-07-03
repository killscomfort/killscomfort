export type TransitionConfig = {
  type: string;
  duration: number;
  direction: string;
  intensity: number;
  blur: number;
  flash: number;
  sound: string | null;
};

export const DEFAULT_TRANSITION_CONFIG: TransitionConfig = {
  type: "slide",
  duration: 600,
  direction: "forward",
  intensity: 0.7,
  blur: 10,
  flash: 0.2,
  sound: null,
};

/** Mirrors public/experience/transitions.js presets */
export const TRANSITION_PRESETS = {
  homeToBikePicker: {
    type: "zoom",
    duration: 650,
    direction: "in",
    intensity: 1,
    blur: 8,
    flash: 0.22,
    sound: null,
  },
  bikePickerToRide: {
    type: "whipPan",
    duration: 560,
    direction: "left",
    intensity: 1,
    blur: 16,
    flash: 0.12,
    sound: null,
  },
  rideToSection: {
    type: "freezeReveal",
    duration: 820,
    direction: "forward",
    intensity: 0.9,
    blur: 0,
    flash: 0.28,
    sound: null,
  },
} satisfies Record<string, TransitionConfig>;

export type TransitionRouteKey =
  | "warehouse:bikePicker"
  | "bikePicker:ride"
  | "experience:site"
  | "experience:section";

export const ROUTE_TRANSITION_MAP: Record<
  TransitionRouteKey,
  keyof typeof TRANSITION_PRESETS | TransitionConfig
> = {
  "warehouse:bikePicker": "homeToBikePicker",
  "bikePicker:ride": "bikePickerToRide",
  "experience:site": "rideToSection",
  "experience:section": "rideToSection",
};

export function resolveTransitionConfig(
  key: TransitionRouteKey | TransitionConfig
): TransitionConfig {
  if (typeof key === "object") return key;
  const preset = ROUTE_TRANSITION_MAP[key];
  if (typeof preset === "string") return TRANSITION_PRESETS[preset];
  return preset;
}

export function clampDuration(ms: number) {
  return Math.max(400, Math.min(900, ms));
}
