import { glyph } from "./figureIcons";
import { parseHex, rgba } from "@/lib/color";
import type { ThemeCustomization } from "@/lib/api";

/**
 * A fixed, behind-content layer that scatters Font Awesome figures into a
 * doodle pattern. Placement, rotation, size and shade are fully deterministic
 * from `theme.seed` (a UUID), so a given theme always renders identically.
 *
 * Inline styles are used deliberately: every value here (position, rotation,
 * colour, opacity, blur) is data-driven and cannot be a static Tailwind class.
 */

/** mulberry32 — small deterministic PRNG from a 32-bit integer seed. */
function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash an arbitrary string (e.g. a UUID seed) to a 32-bit integer. */
function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mix a colour toward white (amount>0) or black (amount<0). */
function shade([r, g, b]: [number, number, number], amount: number): string {
  const target = amount >= 0 ? 255 : 0;
  const t = Math.abs(amount);
  const mix = (c: number) => Math.round(c + (target - c) * t);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

type Placement = {
  glyph: NonNullable<ReturnType<typeof glyph>>;
  leftPct: number;
  topPct: number;
  size: number;
  rotation: number;
  color: string;
};

function buildPlacements(theme: ThemeCustomization): Placement[] {
  const glyphs = theme.figures
    .map(glyph)
    .filter((g): g is NonNullable<typeof g> => g !== null);
  if (glyphs.length === 0) return [];

  const rng = makeRng(hashSeed(theme.seed));
  const accent = parseHex(theme.accentColor);
  const count = Math.max(0, Math.min(400, theme.density));

  // Lay icons on a jittered grid (≈ viewport aspect) so they spread evenly
  // instead of clumping. One icon per cell, offset within the cell.
  const cols = Math.max(1, Math.round(Math.sqrt(count * (16 / 9))));
  const rows = Math.max(1, Math.ceil(count / cols));
  const cellW = 100 / cols;
  const cellH = 100 / rows;

  const out: Placement[] = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const g = glyphs[Math.floor(rng() * glyphs.length)];

    // jitter kept under half a cell so neighbours rarely collide
    const leftPct = (col + 0.5) * cellW + (rng() - 0.5) * cellW * 0.7;
    const topPct = (row + 0.5) * cellH + (rng() - 0.5) * cellH * 0.7;

    // size: most near base, some notably larger (frequency = sizeVariation)
    const big = rng() < theme.sizeVariation;
    const scale = big ? 1.3 + rng() * 0.8 : 0.6 + rng() * 0.5;
    const size = theme.baseSize * scale;

    // shade: mostly light tints, a fraction (accentVariation) darker
    const dark = rng() < theme.accentVariation;
    const color = dark ? shade(accent, -(0.2 + rng() * 0.5)) : shade(accent, rng() * 0.55);

    out.push({ glyph: g, leftPct, topPct, size, rotation: Math.floor(rng() * 360), color });
  }
  return out;
}

export function DoodleBackground({ theme }: { theme: ThemeCustomization }) {
  const placements = buildPlacements(theme);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ backgroundColor: rgba(theme.bgColor, theme.bgOpacity) }}
    >
      <div
        className="absolute inset-0"
        style={theme.blur ? { filter: `blur(${theme.blur}px)` } : undefined}
      >
        {placements.map((p, i) => (
          <svg
            key={i}
            viewBox={`0 0 ${p.glyph.width} ${p.glyph.height}`}
            width={p.size}
            height={p.size}
            className="absolute"
            style={{
              left: `${p.leftPct}%`,
              top: `${p.topPct}%`,
              opacity: theme.opacity,
              transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
            }}
          >
            <path d={p.glyph.path} fill={p.color} />
          </svg>
        ))}
      </div>
    </div>
  );
}
