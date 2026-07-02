import type { AuthorSummary } from "@/lib/api";
import { RoleBadge } from "./RoleBadge";
import { TimeAgo } from "./TimeAgo";

/** Author + role badge + created/edited timestamps — shared by topics and replies. */
export function AuthorLine({
  author,
  createdAt,
  updatedAt,
  extra,
}: {
  author: AuthorSummary;
  createdAt: string;
  updatedAt?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
      <span className="flex items-center gap-1">
        {author.username}
        <RoleBadge role={author.role} />
      </span>
      <span>·</span>
      <TimeAgo iso={createdAt} />
      {updatedAt && updatedAt !== createdAt && (
        <>
          <span>·</span>
          <TimeAgo iso={updatedAt} prefix="edited " />
        </>
      )}
      {extra && (
        <>
          <span>·</span>
          {extra}
        </>
      )}
    </div>
  );
}
