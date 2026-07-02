import { glyph } from "./figureIcons";

/** Renders a single Font Awesome figure as inline SVG. */
export function FigureIcon({
  name,
  size = 20,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const g = glyph(name);
  if (!g) return null;
  return (
    <svg
      viewBox={`0 0 ${g.width} ${g.height}`}
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <path d={g.path} fill="currentColor" />
    </svg>
  );
}
