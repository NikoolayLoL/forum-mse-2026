"use client";

import { useState } from "react";
import { Replies } from "@/lib/api";

export function ReplyComposer({
  postId,
  onCreated,
  onCancel,
}: {
  postId: number;
  onCreated: () => void;
  onCancel?: () => void;
}) {
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await Replies.create(postId, { content });
      setContent("");
      onCreated();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to reply");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        className="min-h-24 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply…"
        autoFocus
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
          {busy ? "Posting…" : "Post reply"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-md px-3 py-1.5 text-sm text-neutral-600 hover:underline dark:text-neutral-300">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
