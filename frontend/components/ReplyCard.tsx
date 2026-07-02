"use client";

import { useState } from "react";
import { Replies, type ReplyResponse } from "@/lib/api";
import { canModify, type CurrentUser } from "@/lib/auth";
import { AuthorLine } from "./AuthorLine";
import { LikeButton } from "./LikeButton";

export function ReplyCard({
  reply,
  user,
  onChange,
  cardBg,
}: {
  reply: ReplyResponse;
  user: CurrentUser | null;
  onChange: () => void;
  cardBg?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(reply.content);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mayEdit = canModify(user, reply.author.id);

  async function toggleLike() {
    try {
      if (reply.likedByCurrentUser) await Replies.unlike(reply.id);
      else await Replies.like(reply.id);
      onChange();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await Replies.update(reply.id, { content });
      setEditing(false);
      onChange();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this reply?")) return;
    try {
      await Replies.remove(reply.id);
      onChange();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  return (
    <li className="rounded-md border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900" style={cardBg ? { backgroundColor: cardBg } : undefined}>
      <AuthorLine author={reply.author} createdAt={reply.createdAt} updatedAt={reply.updatedAt} />

      {editing ? (
        <form onSubmit={save} className="mt-2 space-y-2">
          <textarea
            className="min-h-20 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
              {busy ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={() => { setEditing(false); setContent(reply.content); }} className="rounded-md px-3 py-1 text-sm text-neutral-600 hover:underline dark:text-neutral-300">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-800 dark:text-neutral-200">
          {reply.content}
        </p>
      )}

      <div className="mt-3 flex items-center gap-3 text-sm">
        <LikeButton
          liked={reply.likedByCurrentUser}
          count={reply.likeCount}
          disabled={!user}
          onClick={toggleLike}
        />
        {mayEdit && !editing && (
          <>
            <button onClick={() => setEditing(true)} className="text-neutral-500 hover:underline">
              Edit
            </button>
            <button onClick={remove} className="text-red-600 hover:underline">
              Delete
            </button>
          </>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </li>
  );
}
