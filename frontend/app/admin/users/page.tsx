"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, type UserResponse, type UserRole } from "@/lib/api";
import { useCurrentUser } from "@/lib/auth";
import { RoleBadge } from "@/components/RoleBadge";

const ROLES: UserRole[] = ["ADMIN", "MODERATOR", "USER"];

export default function AdminUsersPage() {
  const router = useRouter();
  const me = useCurrentUser();
  const [users, setUsers] = useState<UserResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // FUS5: only the administrator manages users.
  useEffect(() => {
    if (me === null) return; // still resolving on first render
    if (me.role !== "ADMIN") {
      router.replace("/");
      return;
    }
    Users.list()
      .then(setUsers)
      .catch((e) => setError(e.message));
  }, [me, router]);

  async function changeRole(u: UserResponse, role: UserRole) {
    setError(null);
    try {
      const updated = await Users.update(u.id, {
        username: u.username,
        email: u.email,
        role,
      });
      setUsers((list) => list?.map((x) => (x.id === u.id ? updated : x)) ?? null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update role");
    }
  }

  async function remove(u: UserResponse) {
    if (!confirm(`Delete user "${u.username}"?`)) return;
    setError(null);
    try {
      await Users.remove(u.id);
      setUsers((list) => list?.filter((x) => x.id !== u.id) ?? null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete user");
    }
  }

  if (me && me.role !== "ADMIN") return null;
  if (error) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        {error}
      </div>
    );
  }
  if (!users) return <p className="text-neutral-500">Loading…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Users</h1>
      <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">{u.username}</span>
                <RoleBadge role={u.role} />
                {me?.id === u.id && <span className="text-xs text-neutral-400">(you)</span>}
              </div>
              {u.email && (
                <div className="truncate text-xs text-neutral-500">{u.email}</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={u.role}
                disabled={me?.id === u.id}
                onChange={(e) => changeRole(u, e.target.value as UserRole)}
                className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-950"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0) + r.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              <button
                onClick={() => remove(u)}
                disabled={me?.id === u.id}
                className="text-sm text-red-600 hover:underline disabled:opacity-40"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
