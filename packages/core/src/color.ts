import {
  parse as parseCulori,
  converter,
  formatHex,
  formatRgb,
  type Color,
} from "culori";
import type { ColorFormat } from "./types";

const toOklch = converter("oklch");
const toHsl = converter("hsl");
const toRgb = converter("rgb");

const BARE_HSL = /^-?[\d.]+\s+[\d.]+%\s+[\d.]+%$/;
const BARE_HSL_PARTS = /^(-?[\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/;

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

// Also accepts a bare Tailwind-v3 HSL triplet ("0 0% 100%"), which culori won't.
export function parseColor(raw: string): Color | undefined {
  const value = raw.trim();
  const direct = parseCulori(value);
  if (direct) return direct;
  const m = value.match(BARE_HSL_PARTS);
  return m ? parseCulori(`hsl(${m[1]} ${m[2]}% ${m[3]}%)`) : undefined;
}

export function detectColorFormat(raw: string): ColorFormat {
  const value = raw.trim().toLowerCase();
  if (value.startsWith("oklch") || value.startsWith("oklab")) return "oklch";
  if (value.startsWith("hsl")) return "hsl";
  if (value.startsWith("rgb")) return "rgb";
  if (value.startsWith("#")) return "hex";
  if (BARE_HSL.test(value)) return "hsl";
  if (/^[a-z]+$/.test(value) && parseCulori(value)) return "named";
  return "unknown";
}

export function isColorValue(raw: string): boolean {
  if (/var\(|calc\(/.test(raw)) return false;
  return parseColor(raw) !== undefined;
}

// shadcn-style oklch: numeric hue (never `none`), rounded, optional `/ alpha`.
export function formatOklch(input: string | Color): string {
  const color = typeof input === "string" ? parseColor(input) : input;
  if (!color) return typeof input === "string" ? input : "";
  const o = toOklch(color);
  const body = `${round(o.l ?? 0, 4)} ${round(o.c ?? 0, 4)} ${round(o.h ?? 0, 3)}`;
  const alpha = o.alpha ?? 1;
  return alpha < 1 ? `oklch(${body} / ${round(alpha, 4)})` : `oklch(${body})`;
}

// Bare Tailwind-v3 triplet: "H S% L%".
export function formatHslTriplet(input: string | Color): string {
  const color = typeof input === "string" ? parseColor(input) : input;
  if (!color) return typeof input === "string" ? input : "";
  const hsl = toHsl(color);
  return `${round(hsl.h ?? 0, 2)} ${round((hsl.s ?? 0) * 100, 2)}% ${round((hsl.l ?? 0) * 100, 2)}%`;
}

// Re-serialize into a target notation, keeping the theme's convention.
export function toFormat(input: string | Color, format: ColorFormat): string {
  const color = typeof input === "string" ? parseColor(input) : input;
  if (!color) return typeof input === "string" ? input : "";
  switch (format) {
    case "hsl":
      return formatHslTriplet(color);
    case "hex":
      return formatHex(color) ?? formatOklch(color);
    case "rgb":
      return formatRgb(color);
    default:
      return formatOklch(color);
  }
}

export function resolveColor(raw: string): { format: ColorFormat; resolved?: string } {
  const format = detectColorFormat(raw);
  if (/var\(|calc\(/.test(raw)) return { format };
  const color = parseColor(raw);
  return color ? { format, resolved: formatOklch(color) } : { format };
}

export function toHex(input: string | Color): string | undefined {
  const color = typeof input === "string" ? parseColor(input) : input;
  return color ? formatHex(color) : undefined;
}

export interface OklchComponents {
  l: number;
  c: number;
  h: number;
  alpha: number;
}

export function oklchComponents(input: string | Color): OklchComponents | undefined {
  const color = typeof input === "string" ? parseColor(input) : input;
  if (!color) return undefined;
  const o = toOklch(color);
  return { l: o.l ?? 0, c: o.c ?? 0, h: o.h ?? 0, alpha: o.alpha ?? 1 };
}

export function oklchFromComponents(
  l: number,
  c: number,
  h: number,
  alpha = 1,
): string {
  const body = `${round(l, 4)} ${round(c, 4)} ${round(h, 3)}`;
  return alpha < 1 ? `oklch(${body} / ${round(alpha, 4)})` : `oklch(${body})`;
}

// --- WCAG contrast -------------------------------------------------------

function channel(c: number): number {
  const v = Math.max(0, Math.min(1, c));
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(color: Color): number {
  const { r, g, b } = toRgb(color);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

// WCAG contrast ratio (1–21). Alpha is ignored — the indicator assumes solids.
export function contrastRatio(a: string, b: string): number | undefined {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return undefined;
  const la = luminance(ca);
  const lb = luminance(cb);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export type WcagGrade = "AAA" | "AA" | "AA Large" | "Fail";

export function wcagGrade(ratio: number): WcagGrade {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return "Fail";
}
