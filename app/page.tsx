"use client";

import { useEffect, useRef, useState } from "react";
import { supabase, type Donor, type Settings } from "@/lib/supabase";
import { QRPanel } from "@/components/display/QRPanel";
import { Counter } from "@/components/display/Counter";
import { ProgressBar } from "@/components/display/ProgressBar";
import { FloatingNames } from "@/components/display/FloatingNames";

export default function DisplayPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [latest, setLatest] = useState<Donor | null>(null);
  const [settings, setSettings] = useState<Settings>({
    id: 1,
    total_raised: 0,
    goal: 100000,
  });
  const [hydrated, setHydrated] = useState<boolean>(false);
  const initialIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const [{ data: donorRows }, { data: settingsRow }] = await Promise.all([
        supabase
          .from("donors")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("settings").select("*").eq("id", 1).single(),
      ]);
      if (cancelled) return;
      if (donorRows) {
        setDonors(donorRows);
        donorRows.forEach((d) => initialIdsRef.current.add(d.id));
      }
      if (settingsRow) setSettings(settingsRow);
      setHydrated(true);
    }
    bootstrap();

    const donorChannel = supabase
      .channel("donors-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "donors" },
        (payload) => {
          const donor = payload.new as Donor;
          setDonors((prev) =>
            prev.find((d) => d.id === donor.id) ? prev : [donor, ...prev]
          );
          if (!initialIdsRef.current.has(donor.id)) {
            setLatest(donor);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "donors" },
        (payload) => {
          const removed = payload.old as Donor;
          setDonors((prev) => prev.filter((d) => d.id !== removed.id));
        }
      )
      .subscribe();

    const settingsChannel = supabase
      .channel("settings-feed")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "settings" },
        (payload) => {
          setSettings(payload.new as Settings);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(donorChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-stone-950">
      {/* Decorative background glows */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 18% 30%, rgba(251, 191, 36, 0.10), transparent 55%), radial-gradient(ellipse at 82% 75%, rgba(244, 63, 94, 0.08), transparent 60%)",
        }}
      />
      <div className="grain" aria-hidden />

      {/* Wordmark */}
      <div className="absolute top-6 left-8 z-20 font-serif text-lg select-none">
        <span className="text-stone-100">Support </span>
        <span className="text-amber-400">CNDA</span>
      </div>

      <div className="relative z-10 grid grid-cols-2 h-full w-full">
        {/* LEFT */}
        <section className="relative flex flex-col justify-center items-start gap-10 px-12 lg:px-16">
          <QRPanel />
          <div className="flex flex-col gap-4 w-full max-w-2xl">
            <div className="font-sans text-xs uppercase tracking-[0.4em] text-amber-400">
              Tonight's Progress
            </div>
            <Counter value={settings.total_raised} goal={settings.goal} />
            <div className="mt-2">
              <ProgressBar />
            </div>
          </div>
          <div className="absolute bottom-6 left-8 font-serif text-sm text-stone-500 select-none">
            CNDA
          </div>
        </section>

        {/* RIGHT */}
        <section className="relative border-l border-stone-800/70 flex flex-col">
          <div className="absolute top-0 left-0 right-0 h-32 z-10 bg-gradient-to-b from-stone-950 to-transparent pointer-events-none" />
          <div className="relative z-20 pt-10 pb-6 text-center flex flex-col gap-2">
            <div className="font-sans text-xs uppercase tracking-[0.4em] text-amber-400">
              Our Donors
            </div>
            <div className="font-serif italic text-2xl text-stone-100">
              {donors.length === 0
                ? " "
                : `${donors.length} ${
                    donors.length === 1 ? "person has" : "people have"
                  } given`}
            </div>
          </div>
          <div className="flex-1 relative">
            {hydrated && donors.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-8">
                <div className="font-sans text-xs uppercase tracking-[0.4em] text-amber-400">
                  Waiting for the first donor
                </div>
                <div className="font-serif italic text-xl text-stone-400">
                  Scan the code to be the first.
                </div>
              </div>
            ) : (
              <FloatingNames
                initialDonors={donors}
                newDonor={latest}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
