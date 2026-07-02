/** Parse a #rgb or #rrggbb string to [r, g, b]. */
export function parseHex(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h || "ffffff", 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Build a CSS rgba() string from a hex colour + alpha (0..1). */
export function rgba(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
