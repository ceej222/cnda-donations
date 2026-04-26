"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { supabase, type Donor, type Settings } from "@/lib/supabase";
import { QRPanel } from "@/components/display/QRPanel";
import { ProgressBar } from "@/components/display/ProgressBar";
import { FloatingNames } from "@/components/display/FloatingNames";
import { DonorTicker } from "@/components/display/DonorTicker";
import { Celebration } from "@/components/display/Celebration";

export default function DisplayPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [latest, setLatest] = useState<Donor | null>(null);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [celebrating, setCelebrating] = useState<boolean>(false);
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
      if (settingsRow) {
        setCelebrating(!!(settingsRow as Settings).celebration_active);
      }
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
          const s = payload.new as Settings;
          setCelebrating(!!s.celebration_active);
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
      <div className="absolute top-6 left-8 z-20 flex items-center gap-3 font-serif text-xl md:text-2xl select-none">
        <span className="text-amber-400">Donate to</span>
        <Image
          src="/cnda-logo.png"
          alt="CNDA"
          width={120}
          height={40}
          priority
          className="h-7 md:h-9 w-auto"
        />
      </div>

      <div className="relative z-10 grid grid-cols-2 h-full w-full">
        {/* LEFT */}
        <section className="relative flex flex-col justify-center items-start gap-10 px-12 lg:px-16 pt-24 pb-40">
          <div className="flex flex-col gap-4 w-full max-w-2xl">
            <div className="font-sans text-xs uppercase tracking-[0.4em] text-amber-400">
              Donation Goal Progress
            </div>
            <ProgressBar />
          </div>
          <div className="mb-12">
            <QRPanel />
          </div>
          <div className="absolute bottom-8 left-12 lg:left-16 right-12 lg:right-16 select-none max-w-2xl">
            <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 p-6 shadow-[0_20px_60px_-20px_rgba(251,191,36,0.35)] bg-gradient-to-br from-amber-500/15 via-stone-900/70 to-stone-950/80 backdrop-blur-sm">
              {/* inner radial glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 0% 0%, rgba(251, 191, 36, 0.18), transparent 60%)",
                }}
              />
              <div className="relative flex flex-col gap-2 mb-4">
                <div className="font-sans text-xs uppercase tracking-[0.4em] text-amber-400">
                  With Gratitude
                </div>
                <p className="font-serif italic text-lg md:text-xl text-stone-100 leading-snug">
                  Thank you for championing naturopathic medicine in California.
                  Your generosity fuels CNDA&rsquo;s advocacy, education, and
                  the next generation of NDs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <section className="relative border-l border-stone-800/70 flex flex-col overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-32 z-10 bg-gradient-to-b from-stone-950 to-transparent pointer-events-none" />
          <div className="relative z-20 pt-10 pb-6 flex flex-col gap-4">
            <div className="font-sans text-sm md:text-base uppercase tracking-[0.35em] text-amber-400 text-center">
              Tonight's Donors
            </div>
            {hydrated && donors.length === 0 ? (
              <div className="font-serif italic text-2xl md:text-3xl text-stone-400 text-center px-8 mt-2">
                Scan the code to be the first.
              </div>
            ) : (
              <DonorTicker donors={donors} />
            )}
          </div>
          <div className="flex-1" />
          {/* Floating names overlay the entire right pane so they rise over the ticker */}
          <div className="absolute inset-0 z-30 pointer-events-none">
            <FloatingNames initialDonors={donors} newDonor={latest} />
          </div>
        </section>
      </div>

      {celebrating && <Celebration />}
    </main>
  );
}
