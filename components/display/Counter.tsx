"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  goal: number;
};

function formatDollars(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export function Counter({ value, goal }: Props) {
  const [displayed, setDisplayed] = useState<number>(value);
  const fromRef = useRef<number>(value);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = displayed;
    const to = value;
    if (from === to) return;
    fromRef.current = from;
    startRef.current = performance.now();
    const duration = 900;

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(fromRef.current + (to - fromRef.current) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="font-serif font-light leading-none text-stone-50"
        style={{
          fontSize: "clamp(3.5rem, 11vw, 11rem)",
          letterSpacing: "-0.04em",
        }}
      >
        <span className="text-amber-400 font-light">$</span>
        {formatDollars(displayed)}
      </div>
      <div className="font-sans text-stone-400 text-base sm:text-lg tracking-wide">
        of ${goal.toLocaleString("en-US")} goal
      </div>
    </div>
  );
}
