"use client";

import { useRef, useState } from "react";

type Props = {
  password: string;
  onAdded: () => void;
};

export function AdminForm({ password, onAdded }: Props) {
  const [name, setName] = useState<string>("");
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/donors", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? "Failed to add");
        return;
      }
      setName("");
      inputRef.current?.focus();
      onAdded();
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 bg-stone-900/60 border border-stone-800 rounded-2xl p-5"
    >
      <label className="font-sans text-xs uppercase tracking-[0.4em] text-amber-400">
        Add donor
      </label>
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        autoFocus
        maxLength={200}
        className="bg-stone-950 border border-stone-700 rounded-lg px-4 py-3 text-stone-100 font-serif text-lg focus:outline-none focus:border-amber-400"
      />
      {error && (
        <div className="text-rose-400 font-sans text-sm">{error}</div>
      )}
      <button
        type="submit"
        disabled={pending || !name.trim()}
        className="bg-amber-400 text-stone-950 font-sans font-medium rounded-lg py-3 hover:bg-amber-300 transition disabled:opacity-50"
      >
        {pending ? "Adding..." : "Add donor"}
      </button>
    </form>
  );
}
