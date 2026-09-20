const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

export function toRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ];
}

export const toHex = (rgb: number[]) =>
  "#" + rgb.map((v) => clamp(v).toString(16).padStart(2, "0")).join("");

/** Relative luminance, 0 (black) to 1 (white). */
export function luminance(hex: string) {
  const [r, g, b] = toRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Ink that stays legible on the given background. */
export const readableOn = (hex: string, light = "#ffffff", dark = "#111111") =>
  luminance(hex) > 0.45 ? dark : light;

/** amount > 0 lightens, < 0 darkens. */
export function shade(hex: string, amount: number) {
  const rgb = toRgb(hex);
  return toHex(
    rgb.map((v) => (amount >= 0 ? v + (255 - v) * amount : v * (1 + amount)))
  );
}

export const alpha = (hex: string, a: number) => {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};
