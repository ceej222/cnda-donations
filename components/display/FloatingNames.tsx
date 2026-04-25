"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Donor } from "@/lib/supabase";

type FloatItem = {
  key: string;
  name: string;
  duration: number;
  startX: number;
  drift: number;
  fontClass: string;
  colorClass: string;
  heartClass: string;
  bornAt: number;
};

const FONT_CHOICES = ["text-2xl", "text-3xl", "text-4xl"];
const COLOR_CHOICES = ["text-amber-200", "text-stone-100", "text-amber-300"];
const HEART_CHOICES = ["text-rose-400", "text-amber-400", "text-pink-300"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeItem(donor: Donor, delayMs: number): FloatItem {
  return {
    key: `${donor.id}-${Math.random().toString(36).slice(2, 8)}`,
    name: donor.name,
    duration: 10000,
    startX: 25 + Math.random() * 50,
    drift: (Math.random() < 0.5 ? -1 : 1) * (120 + Math.random() * 80),
    fontClass: pick(FONT_CHOICES),
    colorClass: pick(COLOR_CHOICES),
    heartClass: pick(HEART_CHOICES),
    bornAt: performance.now() + delayMs,
  };
}

type Props = {
  initialDonors: Donor[];
  newDonor: Donor | null;
  burst?: Donor[] | null;
};

export function FloatingNames({ initialDonors, newDonor, burst }: Props) {
  const [items, setItems] = useState<FloatItem[]>([]);
  const seenIds = useRef<Set<string>>(new Set());
  const queueOffset = useRef<number>(0);
  const lastQueuedAt = useRef<number>(0);

  useEffect(() => {
    initialDonors.forEach((d) => seenIds.current.add(d.id));
  }, [initialDonors]);

  useEffect(() => {
    if (!newDonor) return;
    if (seenIds.current.has(newDonor.id)) return;
    seenIds.current.add(newDonor.id);

    const now = performance.now();
    const earliest = Math.max(now, lastQueuedAt.current + 250);
    queueOffset.current = earliest - now;
    lastQueuedAt.current = earliest;

    const item = makeItem(newDonor, queueOffset.current);
    setItems((prev) => [...prev, item]);

    const lifetime = item.duration + queueOffset.current + 500;
    const timer = window.setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.key !== item.key));
    }, lifetime);
    return () => window.clearTimeout(timer);
  }, [newDonor]);

  useEffect(() => {
    if (!burst || burst.length === 0) return;
    const fresh = burst.filter((d) => !seenIds.current.has(d.id));
    if (fresh.length === 0) return;

    const now = performance.now();
    const newItems: FloatItem[] = fresh.map((d, idx) => {
      seenIds.current.add(d.id);
      const earliest = Math.max(now, lastQueuedAt.current + 250);
      lastQueuedAt.current = earliest;
      const offset = earliest - now + idx * 50;
      return makeItem(d, offset);
    });
    setItems((prev) => [...prev, ...newItems]);

    const timers = newItems.map((item) => {
      const lifetime = item.duration + (item.bornAt - now) + 500;
      return window.setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.key !== item.key));
      }, lifetime);
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [burst]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {items.map((item) => (
        <FloatingName key={item.key} item={item} />
      ))}
    </div>
  );
}

function FloatingName({ item }: { item: FloatItem }) {
  const delay = useMemo(() => {
    const d = item.bornAt - performance.now();
    return Math.max(0, d);
  }, [item.bornAt]);

  return (
    <div
      className="absolute bottom-0 will-change-transform"
      style={{
        left: `${item.startX}%`,
        animation: `float-up ${item.duration}ms cubic-bezier(0.45, 0, 0.55, 1) ${delay}ms forwards, float-fade ${item.duration}ms ease-in-out ${delay}ms forwards`,
        ["--drift" as string]: `${item.drift}px`,
        opacity: 0,
      }}
    >
      <div
        className={`flex items-center gap-2 font-serif italic ${item.fontClass} ${item.colorClass} whitespace-nowrap`}
      >
        <Heart className={`${item.heartClass} fill-current`} />
        <span>{item.name}</span>
        <span aria-hidden>💰</span>
      </div>
    </div>
  );
}

function Heart({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1.1em"
      height="1.1em"
      className={className}
      aria-hidden
    >
      <path d="M12 21s-7.5-4.6-10-9.5C.5 7.7 3 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 4 23.5 7.7 22 11.5 19.5 16.4 12 21 12 21z" />
    </svg>
  );
}
