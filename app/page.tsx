"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { supabase, type Donor } from "@/lib/supabase";
import { QRPanel } from "@/components/display/QRPanel";
import { ProgressBar } from "@/components/display/ProgressBar";
import { FloatingNames } from "@/components/display/FloatingNames";
import { DonorTicker } from "@/components/display/DonorTicker";

export default function DisplayPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [latest, setLatest] = useState<Donor | null>(null);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const initialIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const { data: donorRows } = await supabase
        .from("donors")
        .select("*")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (donorRows) {
        setDonors(donorRows);
        donorRows.forEach((d) => initialIdsRef.current.add(d.id));
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

    return () => {
      cancelled = true;
      supabase.removeChannel(donorChannel);
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
      <div className="absolute top-6 left-8 z-20 font-serif text-xl md:text-2xl select-none">
        <span className="text-stone-100">Support </span>
        <span className="text-amber-400">CNDA</span>
      </div>

      <div className="relative z-10 grid grid-cols-2 h-full w-full">
        {/* LEFT */}
        <section className="relative flex flex-col justify-center items-start gap-10 px-12 lg:px-16 pt-24 pb-16">
          <QRPanel />
          <div className="flex flex-col gap-4 w-full max-w-2xl">
            <div className="font-sans text-xs uppercase tracking-[0.4em] text-amber-400">
              Tonight's Progress
            </div>
            <ProgressBar />
          </div>
          <div className="absolute bottom-6 left-8 select-none">
            <Image
              src="/cnda-logo.png"
              alt="CNDA logo"
              width={90}
              height={30}
              className="h-auto w-16 md:w-20 opacity-85"
              priority
            />
          </div>
        </section>

        {/* RIGHT */}
        <section className="relative border-l border-stone-800/70 flex flex-col">
          <div className="absolute top-0 left-0 right-0 h-32 z-10 bg-gradient-to-b from-stone-950 to-transparent pointer-events-none" />
          <div className="relative z-20 pt-10 pb-6 flex flex-col gap-4">
            <div className="font-sans text-xs uppercase tracking-[0.4em] text-amber-400 text-center">
              Our Donors
            </div>
            {hydrated && donors.length === 0 ? (
              <div className="font-serif italic text-xl text-stone-400 text-center px-8 mt-2">
                Scan the code to be the first.
              </div>
            ) : (
              <DonorTicker donors={donors} />
            )}
          </div>
          <div className="flex-1 relative">
            <FloatingNames initialDonors={donors} newDonor={latest} />
          </div>
        </section>
      </div>
    </main>
  );
}
