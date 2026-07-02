"use client";

export function LikeButton({
  liked,
  count,
  disabled,
  onClick,
}: {
  liked: boolean;
  count: number;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={disabled ? "Sign in to like" : liked ? "Unlike" : "Like"}
      className={`flex items-center gap-1 rounded-md border px-2 py-1 transition disabled:opacity-50 ${
        liked
          ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300"
          : "border-neutral-300 text-neutral-600 hover:border-rose-300 dark:border-neutral-700 dark:text-neutral-300"
      }`}
    >
      <span>{liked ? "❤" : "🤍"}</span>
      <span>{count}</span>
    </button>
  );
}
