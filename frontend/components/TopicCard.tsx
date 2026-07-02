"use client";

import { useState } from "react";
import { Posts, type PostResponse } from "@/lib/api";
import { canModify, type CurrentUser } from "@/lib/auth";
import { AuthorLine } from "./AuthorLine";
import { LikeButton } from "./LikeButton";

export function TopicCard({
  post,
  user,
  onChange,
  onDeleted,
  cardBg,
}: {
  post: PostResponse;
  user: CurrentUser | null;
  onChange: (p: PostResponse) => void;
  onDeleted: () => void;
  cardBg?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mayEdit = canModify(user, post.author.id);

  async function toggleLike() {
    try {
      const updated = post.likedByCurrentUser
        ? await Posts.unlike(post.id)
        : await Posts.like(post.id);
      onChange(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const updated = await Posts.update(post.id, { title, content });
      onChange(updated);
      setEditing(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this topic and all its replies?")) return;
    try {
      await Posts.remove(post.id);
      onDeleted();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  if (editing) {
    return (
      <form onSubmit={save} className="space-y-3 rounded-md border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900" style={cardBg ? { backgroundColor: cardBg } : undefined}>
        <input
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 font-semibold dark:border-neutral-700 dark:bg-neutral-950"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
        />
        <textarea
          className="min-h-32 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={busy} className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
            {busy ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => { setEditing(false); setTitle(post.title); setContent(post.content); }} className="rounded-md px-3 py-1.5 text-sm text-neutral-600 hover:underline dark:text-neutral-300">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <article className="rounded-md border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900" style={cardBg ? { backgroundColor: cardBg } : undefined}>
      <h1 className="text-xl font-semibold">{post.title}</h1>
      <div className="mt-1">
        <AuthorLine
          author={post.author}
          createdAt={post.createdAt}
          updatedAt={post.updatedAt}
          extra={<span>👁 {post.views}</span>}
        />
      </div>

      <p className="mt-4 whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">
        {post.content}
      </p>

      <div className="mt-4 flex items-center gap-3 text-sm">
        <LikeButton
          liked={post.likedByCurrentUser}
          count={post.likeCount}
          disabled={!user}
          onClick={toggleLike}
        />
        {mayEdit && (
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
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </article>
  );
}
