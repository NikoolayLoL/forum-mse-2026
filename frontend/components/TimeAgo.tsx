"use client";

import { useEffect, useState } from "react";

function relative(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const sec = Math.round(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

/** Renders only after mount so SSR/client locale & clock never mismatch. */
export function TimeAgo({ iso, prefix }: { iso: string; prefix?: string }) {
  const [text, setText] = useState<string>("");
  useEffect(() => {
    setText(relative(iso));
  }, [iso]);
  return (
    <time dateTime={iso} title={new Date(iso).toLocaleString()} suppressHydrationWarning>
      {text ? `${prefix ?? ""}${text}` : ""}
    </time>
  );
}
