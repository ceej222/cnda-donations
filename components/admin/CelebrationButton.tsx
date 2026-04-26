"use client";

import { useEffect, useState } from "react";

type Props = {
  password: string;
};

export function CelebrationButton({ password }: Props) {
  const [active, setActive] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data?.settings) {
          setActive(!!data.settings.celebration_active);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggle() {
    setPending(true);
    setError(null);
    const next = !active;
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ celebration_active: next }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? "Failed");
        return;
      }
      setActive(next);
    } catch {
      setError("Network error");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="flex flex-col gap-3 bg-stone-900/60 border border-stone-800 rounded-2xl p-5">
      <div className="font-sans text-xs uppercase tracking-[0.4em] text-amber-400">
        Celebration
      </div>
      <p className="font-sans text-sm text-stone-400">
        Triggers a full-screen celebration on the public display. Use when the
        $100,000 goal is reached.
      </p>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`rounded-lg py-4 font-sans font-semibold text-lg transition disabled:opacity-50 ${
          active
            ? "bg-stone-700 text-stone-100 hover:bg-stone-600"
            : "bg-amber-400 text-stone-950 hover:bg-amber-300"
        }`}
      >
        {pending
          ? "Working..."
          : active
            ? "End celebration"
            : "🎉 Trigger celebration"}
      </button>
      {error && (
        <div className="text-rose-400 font-sans text-sm">{error}</div>
      )}
    </section>
  );
}
