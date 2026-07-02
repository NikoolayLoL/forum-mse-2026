"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Posts, Theme, type PostResponse, type ThemeCustomization } from "@/lib/api";
import { useCurrentUser } from "@/lib/auth";
import { rgba } from "@/lib/color";
import { TopicCard } from "@/components/TopicCard";
import { RepliesSection } from "@/components/RepliesSection";
import { DoodleBackground } from "@/components/DoodleBackground";

export default function TopicPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const router = useRouter();
  const user = useCurrentUser();

  const [post, setPost] = useState<PostResponse | null>(null);
  const [theme, setTheme] = useState<ThemeCustomization | null>(null);
  const [error, setError] = useState<string | null>(null);

  // GET /posts/{id} increments the view count server-side, so it must run once
  // per open. React StrictMode double-invokes effects in dev, which would
  // otherwise record two views; guard so each topic id is fetched only once
  // (still refetches when navigating to a different topic).
  const openedId = useRef<number | null>(null);
  useEffect(() => {
    if (openedId.current === id) return;
    openedId.current = id;
    Posts.get(id)
      .then(setPost)
      .catch((e) => setError(e.message));
  }, [id]);

  // The background reflects the topic author's theme (their "blog" look).
  useEffect(() => {
    if (!post) return;
    Theme.forUser(post.author.id).then(setTheme).catch(() => {});
  }, [post]);

  if (error) {
    return (
      <div className="space-y-4">
        <BackLink />
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          Failed to load topic: {error}
        </div>
      </div>
    );
  }
  if (!post) return <p className="text-neutral-500">Loading…</p>;

  const cardBg = theme ? rgba(theme.cardColor, theme.cardOpacity) : undefined;

  return (
    <div className="space-y-6">
      {theme && <DoodleBackground theme={theme} />}
      <BackLink />
      <TopicCard
        post={post}
        user={user}
        onChange={setPost}
        onDeleted={() => router.push("/")}
        cardBg={cardBg}
      />
      <RepliesSection postId={id} user={user} cardBg={cardBg} />
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/" className="text-sm text-neutral-500 hover:underline">
      ← All topics
    </Link>
  );
}
