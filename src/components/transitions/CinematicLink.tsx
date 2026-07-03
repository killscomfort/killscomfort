"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import {
  type TransitionConfig,
  type TransitionRouteKey,
} from "@/lib/transitions/config";
import { useCinematicTransition } from "@/components/transitions/TransitionProvider";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  transition?: TransitionRouteKey | TransitionConfig;
};

/** Site chrome link with optional cinematic handoff. */
export function CinematicLink({ href, transition, onClick, ...rest }: Props) {
  const { busy, navigateWithTransition } = useCinematicTransition();

  return (
    <Link
      href={href}
      {...rest}
      aria-disabled={busy || rest["aria-disabled"]}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || busy) return;
        if (!transition) return;
        e.preventDefault();
        navigateWithTransition(href, transition ?? "experience:section");
      }}
    />
  );
}
