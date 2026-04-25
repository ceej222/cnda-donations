"use client";

import { useRef, useState } from "react";

type Props = {
  password: string;
  onAdded: () => void;
};

export function AdminForm({ password, onAdded }: Props) {
  const [name, setName] = useState<string>("");
  const [bigDonation, setBigDonation] = useState<boolean>(false);
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
        body: JSON.stringify({ name: trimmed, big_donation: bigDonation }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? "Failed to add");
        return;
      }
      setName("");
      setBigDonation(false);
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
      <div
        className={`font-sans text-xs text-right ${
          name.length >= 200 ? "text-rose-400" : "text-stone-500"
        }`}
      >
        {name.length} / 200
      </div>
      <label className="flex items-center gap-3 cursor-pointer select-none font-sans text-sm text-stone-200">
        <input
          type="checkbox"
          checked={bigDonation}
          onChange={(e) => setBigDonation(e.target.checked)}
          className="h-4 w-4 accent-amber-400"
        />
        Big donation
      </label>
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
