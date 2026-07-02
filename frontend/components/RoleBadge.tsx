import type { UserRole } from "@/lib/api";

const STYLES: Record<UserRole, string> = {
  ADMIN: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  MODERATOR: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  USER: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
};

export function RoleBadge({ role }: { role: UserRole }) {
  if (role === "USER") return null;
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STYLES[role]}`}>
      {role.toLowerCase()}
    </span>
  );
}
