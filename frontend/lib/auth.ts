"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH_EVENT, getToken, setToken, type UserRole } from "./api";

export type CurrentUser = { id: number; username: string; role: UserRole };

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

export function decodeToken(token: string | null): CurrentUser | null {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    const claims = JSON.parse(base64UrlDecode(payload));
    if (claims.exp && claims.exp * 1000 < Date.now()) return null; // expired
    return { id: Number(claims.uid), username: String(claims.sub), role: claims.role as UserRole };
  } catch {
    return null;
  }
}

/** Reactive current-user state, kept in sync with login/logout across the app. */
export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const sync = () => setUser(decodeToken(getToken()));
    sync();
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return user;
}

/**
 * Current user for pages that require authentication; redirects to /login when
 * there is no valid session. Guards on the token persisted in localStorage
 * (read synchronously on the client) rather than the async-hydrated `user`
 * state, so a logged-in user is never bounced to login during the first render.
 */
export function useRequireAuth(): CurrentUser | null {
  const router = useRouter();
  const user = useCurrentUser();
  useEffect(() => {
    const guard = () => {
      if (!decodeToken(getToken())) router.replace("/login");
    };
    guard();
    window.addEventListener(AUTH_EVENT, guard);
    return () => window.removeEventListener(AUTH_EVENT, guard);
  }, [router]);
  return user;
}

export function logout() {
  setToken(null);
}

/** FUS5: a user may edit/delete their own content; moderators and admins may edit anyone's. */
export function canModify(user: CurrentUser | null, authorId: number): boolean {
  if (!user) return false;
  return user.id === authorId || user.role === "ADMIN" || user.role === "MODERATOR";
}
