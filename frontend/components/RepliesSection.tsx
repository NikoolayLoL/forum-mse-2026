"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Replies, type ReplyPage } from "@/lib/api";
import { type CurrentUser } from "@/lib/auth";
import { ReplyCard } from "./ReplyCard";
import { ReplyComposer } from "./ReplyComposer";

const PAGE_SIZE = 10; // FUS3: replies paginated 10 per page.

export function RepliesSection({
  postId,
  user,
  cardBg,
}: {
  postId: number;
  user: CurrentUser | null;
  cardBg?: string;
}) {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<ReplyPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);

  const load = useCallback(() => {
    Replies.list(postId, page, PAGE_SIZE)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [postId, page]);

  useEffect(() => {
    load();
  }, [load]);

  function onReplyCreated() {
    setComposing(false);
    // Jump to the last page so the new reply is visible.
    if (data && data.totalElements + 1 > (page + 1) * PAGE_SIZE) {
      setPage(Math.floor(data.totalElements / PAGE_SIZE));
    } else {
      load();
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">
        Replies{data ? ` (${data.totalElements})` : ""}
      </h2>

      {user ? (
        composing ? (
          <ReplyComposer
            postId={postId}
            onCreated={onReplyCreated}
            onCancel={() => setComposing(false)}
          />
        ) : (
          <button
            onClick={() => setComposing(true)}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Reply
          </button>
        )
      ) : (
        <p className="text-sm text-neutral-500">
          <Link href="/login" className="underline">Sign in</Link> to reply.
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Always pin the newest reply at the top, regardless of the current page. */}
      {data?.newest && (
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Latest reply
          </p>
          <ReplyCard reply={data.newest} user={user} onChange={load} cardBg={cardBg} />
        </div>
      )}

      {data && data.content.length === 0 && (
        <p className="text-sm text-neutral-500">No replies yet.</p>
      )}

      <ul className="space-y-3">
        {/* Drop the pinned newest reply so it is not shown twice on its page. */}
        {data?.content
          .filter((r) => r.id !== data.newest?.id)
          .map((r) => (
            <ReplyCard key={r.id} reply={r} user={user} onChange={load} cardBg={cardBg} />
          ))}
      </ul>

      {data && data.totalPages > 1 && (
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
    </section>
  );
}
