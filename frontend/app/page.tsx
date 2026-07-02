"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Posts, Theme, type PostPage, type ThemeCustomization } from "@/lib/api";
import { AuthorLine } from "@/components/AuthorLine";
import { DoodleBackground } from "@/components/DoodleBackground";
import { rgba } from "@/lib/color";

const PAGE_SIZE = 15; // FUS1: topics paginated 15 per page.

export default function PostsPage() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PostPage | null>(null);
  const [theme, setTheme] = useState<ThemeCustomization | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Posts.list(page, PAGE_SIZE)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [page]);

  useEffect(() => {
    Theme.home().then(setTheme).catch(() => {}); // background is non-critical
  }, []);

  const background = theme ? <DoodleBackground theme={theme} /> : null;
  const cardBg = theme ? rgba(theme.cardColor, theme.cardOpacity) : undefined;

  if (error) {
    return (
      <>
        {background}
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          Failed to load topics: {error}
        </div>
      </>
    );
  }

  if (!data)
    return (
      <>
        {background}
        <p className="text-neutral-500">Loading…</p>
      </>
    );

  return (
    <div className="space-y-4">
      {background}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Topics</h1>
        <Link
          href="/posts/new"
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          New topic
        </Link>
      </div>

      {data.content.length === 0 ? (
        <p className="text-neutral-500">No topics yet. Be the first to start one.</p>
      ) : (
        <ul className="space-y-3">
          {data.content.map((p) => (
            <li
              key={p.id}
              className="rounded-md border border-neutral-200 bg-white p-4 transition hover:border-indigo-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-indigo-700"
              style={cardBg ? { backgroundColor: cardBg } : undefined}
            >
              <Link href={`/posts/${p.id}`} className="block">
                <h2 className="font-semibold hover:underline">{p.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {p.content}
                </p>
              </Link>
              <div className="mt-2">
                <AuthorLine
                  author={p.author}
                  createdAt={p.createdAt}
                  extra={
                    <span className="flex items-center gap-3">
                      <span>👁 {p.views}</span>
                      <span>❤ {p.likeCount}</span>
                    </span>
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-md border border-neutral-300 px-3 py-1 disabled:opacity-40 dark:border-neutral-700"
          >
            ← Prev
          </button>
          <span className="text-neutral-500">
            Page {page + 1} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
            disabled={page >= data.totalPages - 1}
            className="rounded-md border border-neutral-300 px-3 py-1 disabled:opacity-40 dark:border-neutral-700"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
