"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cnda-admin-password";

type Props = {
  children: (password: string) => React.ReactNode;
};

export function PasswordGate({ children }: Props) {
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHydrated(true);
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      setPassword(stored);
      setUnlocked(true);
    }
  }, []);

  async function tryUnlock(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: input }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? "Wrong password");
        return;
      }
      sessionStorage.setItem(STORAGE_KEY, input);
      setPassword(input);
      setUnlocked(true);
    } catch (err) {
      setError("Network error");
    } finally {
      setPending(false);
    }
  }

  if (!hydrated) {
    return null;
  }

  if (unlocked) {
    return <>{children(password)}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 p-6">
      <form
        onSubmit={tryUnlock}
        className="w-full max-w-sm flex flex-col gap-4 bg-stone-900/60 border border-stone-800 rounded-2xl p-6"
      >
        <div className="font-sans text-xs uppercase tracking-[0.4em] text-amber-400">
          Admin
        </div>
        <h1 className="font-serif text-2xl text-stone-100">Enter password</h1>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          className="bg-stone-950 border border-stone-700 rounded-lg px-4 py-3 text-stone-100 font-sans focus:outline-none focus:border-amber-400"
          placeholder="Password"
        />
        {error && (
          <div className="text-rose-400 font-sans text-sm">{error}</div>
        )}
        <button
          type="submit"
          disabled={pending || !input}
          className="bg-amber-400 text-stone-950 font-sans font-medium rounded-lg py-3 hover:bg-amber-300 transition disabled:opacity-50"
        >
          {pending ? "Checking..." : "Unlock"}
        </button>
      </form>
    </div>
  );
}
