import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BRAND_NAME, normalizeBrandName } from "@/lib/constants";

type BrandVariant = "title" | "label" | "name" | "inline";

interface BrandTextProps {
  children: ReactNode;
  variant?: BrandVariant;
  className?: string;
  displayClassName?: string;
  scriptClassName?: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4";
}

/** Flatten React children into a single string for text processing */
function childrenToText(children: ReactNode): string {
  if (children == null || typeof children === "boolean") return "";
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(childrenToText).join("");
  }
  return "";
}

function splitBrandName(name: string) {
  const normalized = normalizeBrandName(name);
  const match = normalized.match(/^([A-Z][a-z]+)([A-Z].*)$/);
  if (match) {
    return { display: match[1], script: match[2], joinWithoutSpace: true };
  }
  return { display: normalized, script: "", joinWithoutSpace: true };
}

function splitBrandTitle(title: string) {
  const normalized = normalizeBrandName(title.trim());

  if (normalized.toLowerCase() === BRAND_NAME.toLowerCase()) {
    return splitBrandName(normalized);
  }

  const words = normalized.split(/\s+/);
  if (words.length <= 1) {
    return { display: "", script: normalized, joinWithoutSpace: false };
  }

  const script = words.pop()!;

  return { display: words.join(" "), script, joinWithoutSpace: false };
}

function splitBrandLabel(label: string) {
  const normalized = normalizeBrandName(label.trim());
  const words = normalized.split(/\s+/);
  if (words.length <= 1) {
    return { display: normalized, script: "", joinWithoutSpace: false };
  }
  return {
    display: words[0],
    script: words.slice(1).join(" "),
    joinWithoutSpace: false,
  };
}

function splitBrandInline(text: string) {
  const normalized = normalizeBrandName(text);
  const pivot = Math.ceil(normalized.length * 0.45);
  let splitAt = normalized.lastIndexOf(" ", pivot);
  if (splitAt === -1) splitAt = normalized.indexOf(" ", pivot);
  if (splitAt === -1) {
    return { display: normalized, script: "", joinWithoutSpace: false };
  }
  return {
    display: normalized.slice(0, splitAt).trim(),
    script: normalized.slice(splitAt).trim(),
    joinWithoutSpace: false,
  };
}

function getParts(text: string, variant: BrandVariant) {
  switch (variant) {
    case "name":
      return splitBrandName(text);
    case "label":
      return splitBrandLabel(text);
    case "inline":
      return splitBrandInline(text);
    case "title":
    default:
      return splitBrandTitle(text);
  }
}

const variantStyles: Record<
  BrandVariant,
  { wrapper: string; display: string; script: string }
> = {
  title: {
    wrapper: "text-brand text-brand-title",
    display: "text-brand-display",
    script: "text-brand-script text-brand-script-title",
  },
  label: {
    wrapper: "text-brand text-brand-label",
    display: "text-brand-display",
    script: "text-brand-script text-brand-script-label",
  },
  name: {
    wrapper: "text-brand text-brand-name",
    display: "text-brand-display",
    script: "text-brand-script text-brand-script-name",
  },
  inline: {
    wrapper: "text-brand text-brand-inline",
    display: "text-brand-display",
    script: "text-brand-script text-brand-script-inline",
  },
};

export function BrandText({
  children,
  variant = "title",
  className,
  displayClassName,
  scriptClassName,
  as: Tag = "span",
}: BrandTextProps) {
  const text = childrenToText(children);

  // Inline copy should read as one voice — no weight/case split
  if (variant === "inline") {
    return <Tag className={className}>{text}</Tag>;
  }

  const { display, script, joinWithoutSpace } = getParts(text, variant);
  const styles = variantStyles[variant];
  const gap = display && script && !joinWithoutSpace ? "\u00a0" : null;

  return (
    <Tag className={cn(styles.wrapper, className)}>
      {display && (
        <span className={cn(styles.display, displayClassName)}>{display}</span>
      )}
      {gap}
      {script && (
        <span className={cn(styles.script, scriptClassName)}>{script}</span>
      )}
    </Tag>
  );
}

/** Renders the canonical KillsComfort brand name with logo + script blend */
export function BrandName({
  className,
  as = "span",
}: {
  className?: string;
  as?: BrandTextProps["as"];
}) {
  return (
    <BrandText variant="name" as={as} className={className}>
      {BRAND_NAME}
    </BrandText>
  );
}
