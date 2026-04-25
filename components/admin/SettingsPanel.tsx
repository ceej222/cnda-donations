"use client";

import { useEffect, useState } from "react";
import type { Settings } from "@/lib/supabase";

type Props = {
  password: string;
};

export function SettingsPanel({ password }: Props) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [totalInput, setTotalInput] = useState<string>("");
  const [goalInput, setGoalInput] = useState<string>("");
  const [pending, setPending] = useState<"total" | "goal" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/settings");
    if (res.ok) {
      const body = await res.json();
      setSettings(body.settings);
      setTotalInput(String(body.settings?.total_raised ?? 0));
      setGoalInput(String(body.settings?.goal ?? 100000));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function patch(field: "total_raised" | "goal", value: number) {
    setPending(field === "total_raised" ? "total" : "goal");
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setMessage(body?.error ?? "Failed");
        return;
      }
      const body = await res.json();
      setSettings(body.settings);
      setMessage("Saved");
      setTimeout(() => setMessage(null), 1500);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5 flex flex-col gap-3">
        <label className="font-sans text-xs uppercase tracking-[0.4em] text-amber-400">
          Total raised
        </label>
        <input
          type="number"
          inputMode="decimal"
          value={totalInput}
          onChange={(e) => setTotalInput(e.target.value)}
          className="bg-stone-950 border border-stone-700 rounded-lg px-4 py-3 text-stone-100 font-serif text-lg focus:outline-none focus:border-amber-400"
        />
        <button
          type="button"
          onClick={() => patch("total_raised", Number(totalInput))}
          disabled={pending === "total"}
          className="bg-stone-800 hover:bg-stone-700 text-stone-100 font-sans rounded-lg py-2 transition disabled:opacity-50"
        >
          {pending === "total" ? "Updating..." : "Update"}
        </button>
      </div>
      <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5 flex flex-col gap-3">
        <label className="font-sans text-xs uppercase tracking-[0.4em] text-amber-400">
          Goal
        </label>
        <input
          type="number"
          inputMode="decimal"
          value={goalInput}
          onChange={(e) => setGoalInput(e.target.value)}
          className="bg-stone-950 border border-stone-700 rounded-lg px-4 py-3 text-stone-100 font-serif text-lg focus:outline-none focus:border-amber-400"
        />
        <button
          type="button"
          onClick={() => patch("goal", Number(goalInput))}
          disabled={pending === "goal"}
          className="bg-stone-800 hover:bg-stone-700 text-stone-100 font-sans rounded-lg py-2 transition disabled:opacity-50"
        >
          {pending === "goal" ? "Updating..." : "Update"}
        </button>
      </div>
      {message && (
        <div className="sm:col-span-2 font-sans text-sm text-amber-300">
          {message}
        </div>
      )}
      {settings && (
        <div className="sm:col-span-2 font-sans text-xs text-stone-500">
          Current: ${Number(settings.total_raised).toLocaleString()} of $
          {Number(settings.goal).toLocaleString()}
        </div>
      )}
    </div>
  );
}
