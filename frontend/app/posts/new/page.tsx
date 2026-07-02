"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Posts } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";

export default function NewTopicPage() {
  const router = useRouter();
  useRequireAuth(); // FUS1: only registered users may create a topic.
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const created = await Posts.create({ title, content });
      router.push(`/posts/${created.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create topic");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">New topic</h1>

      <label className="block">
        <span className="mb-1 block text-sm">Title</span>
        <input
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
          autoFocus
        />
        <span className="mt-1 block text-xs text-neutral-500">
          The title must be unique.
        </span>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm">Content</span>
        <textarea
          className="min-h-40 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create topic"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md px-4 py-2 text-neutral-600 hover:underline dark:text-neutral-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
