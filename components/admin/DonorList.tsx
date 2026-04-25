"use client";

import { useEffect, useState } from "react";
import type { Donor } from "@/lib/supabase";

type Props = {
  password: string;
  refreshKey: number;
};

const MAX_DONORS = 150;

export function DonorList({ password, refreshKey }: Props) {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/donors", { cache: "no-store" });
    if (res.ok) {
      const body = await res.json();
      setDonors(body.donors ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [refreshKey]);

  async function remove(id: string) {
    if (!confirm("Delete this donor?")) return;
    const res = await fetch(`/api/donors?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    if (res.ok) load();
  }

  return (
    <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <div className="font-sans text-xs uppercase tracking-[0.4em] text-amber-400">
          Donors
        </div>
        <div className="font-sans text-xs text-stone-400">
          {donors.length} / {MAX_DONORS}
        </div>
      </div>
      {loading ? (
        <div className="font-sans text-sm text-stone-500">Loading…</div>
      ) : donors.length === 0 ? (
        <div className="font-sans text-sm text-stone-500">
          No donors yet.
        </div>
      ) : (
        <ul className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {donors.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between gap-3 bg-stone-950 border border-stone-800 rounded-lg px-4 py-3"
            >
              <div className="flex flex-col">
                <span className="font-serif text-lg text-stone-100">
                  {d.name}
                </span>
                <span className="font-sans text-xs text-stone-500">
                  {new Date(d.created_at).toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => remove(d.id)}
                className="font-sans text-xs uppercase tracking-widest text-stone-400 hover:text-rose-400 transition"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
