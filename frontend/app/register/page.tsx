"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  api,
  setToken,
  type RegisterRequest,
  type LoginResponse,
} from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const body: RegisterRequest = {
        username,
        password,
        ...(email ? { email } : {}),
      };
      const res = await api<LoginResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setToken(res.accessToken);
      router.push("/");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Create account</h1>

      <label className="block">
        <span className="block text-sm mb-1">Username</span>
        <input
          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          minLength={1}
          maxLength={100}
          required
        />
      </label>

      <label className="block">
        <span className="block text-sm mb-1">Email (optional)</span>
        <input
          type="email"
          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          maxLength={320}
        />
      </label>

      <label className="block">
        <span className="block text-sm mb-1">Password</span>
        <input
          type="password"
          className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
        />
        <span className="block text-xs text-neutral-500 mt-1">
          8–72 characters.
        </span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-3 py-2 font-medium disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Create account"}
      </button>

      <p className="text-sm text-neutral-500 text-center">
        Already have an account?{" "}
        <a href="/login" className="underline">Sign in</a>
      </p>
    </form>
  );
}
