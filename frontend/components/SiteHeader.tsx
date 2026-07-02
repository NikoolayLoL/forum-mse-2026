"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout, useCurrentUser } from "@/lib/auth";
import { RoleBadge } from "./RoleBadge";

export function SiteHeader() {
  const user = useCurrentUser();
  const router = useRouter();

  function onLogout() {
    logout();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-600 text-sm text-white">F</span>
          <span>Forum</span>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link
                href="/posts/new"
                className="rounded-md bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-500"
              >
                New topic
              </Link>
              <Link href="/customize" className="text-neutral-600 hover:underline dark:text-neutral-300">
                Customize
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin/users" className="text-neutral-600 hover:underline dark:text-neutral-300">
                  Users
                </Link>
              )}
              <span className="hidden items-center gap-1.5 sm:flex">
                <span className="text-neutral-700 dark:text-neutral-200">{user.username}</span>
                <RoleBadge role={user.role} />
              </span>
              <button onClick={onLogout} className="text-neutral-500 hover:underline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-neutral-600 hover:underline dark:text-neutral-300">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-500"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
