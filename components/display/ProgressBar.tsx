"use client";

import { useEffect, useState } from "react";

const ZEFFY_SRC =
  "https://www.zeffy.com/embed/thermometer/cnda-pac-donation";
// Force the iframe to refetch this often (ms). Zeffy doesn't push live updates
// to the embed, so we cache-bust the src to pull the latest total.
const REFRESH_MS = 60_000;

export function ProgressBar() {
  const [cacheBust, setCacheBust] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      setCacheBust(Date.now());
    }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="relative h-[120px] w-[calc(100%+3rem)] overflow-hidden rounded-2xl border border-stone-800/70 bg-stone-900/60 backdrop-blur-sm md:w-[calc(100%+8rem)]"
    >
      <iframe
        // key change forces a full iframe reload, not just a src swap
        key={cacheBust}
        title="Donation form powered by Zeffy"
        src={`${ZEFFY_SRC}?t=${cacheBust}`}
        style={{
          position: "absolute",
          border: 0,
          top: "20px",
          left: 0,
          right: 0,
          width: "100%",
          height: "100%",
          // Cross-origin embed: use filter to improve label contrast on dark background.
          filter: "invert(1) hue-rotate(180deg) brightness(1.25)",
        }}
      />
    </div>
  );
}
