"use client";

import { useMemo } from "react";

const CONFETTI_COUNT = 80;
const SPARKLE_COUNT = 24;
const FLOAT_EMOJIS = ["🎉", "🎊", "💰", "✨", "🤑", "🥳", "🌟"];

const CONFETTI_COLORS = [
  "#fbbf24", // amber-400
  "#fde68a", // amber-200
  "#f59e0b", // amber-500
  "#fff7ed", // off-white
  "#fb923c", // orange-400
  "#f43f5e", // rose-500
];

type ConfettiPiece = {
  key: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotate: number;
  drift: number;
};

type Sparkle = {
  key: number;
  top: number;
  left: number;
  delay: number;
  size: number;
};

type Floater = {
  key: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
};

function buildConfetti(): ConfettiPiece[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    key: i,
    left: Math.random() * 100,
    delay: Math.random() * 4,
    duration: 4 + Math.random() * 4,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 6 + Math.random() * 10,
    rotate: Math.random() * 720 - 360,
    drift: (Math.random() - 0.5) * 200,
  }));
}

function buildSparkles(): Sparkle[] {
  return Array.from({ length: SPARKLE_COUNT }, (_, i) => ({
    key: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    size: 8 + Math.random() * 18,
  }));
}

function buildFloaters(): Floater[] {
  return Array.from({ length: 18 }, (_, i) => ({
    key: i,
    emoji: FLOAT_EMOJIS[i % FLOAT_EMOJIS.length],
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 6 + Math.random() * 5,
    size: 36 + Math.random() * 36,
  }));
}

export function Celebration() {
  const confetti = useMemo(buildConfetti, []);
  const sparkles = useMemo(buildSparkles, []);
  const floaters = useMemo(buildFloaters, []);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden pointer-events-none"
      aria-live="polite"
    >
      {/* Backdrop with warm glow */}
      <div
        className="absolute inset-0 bg-stone-950/85 backdrop-blur-sm animate-celebration-fade-in"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(120, 53, 15, 0.55) 0%, rgba(12, 10, 9, 0.92) 60%, rgba(12, 10, 9, 0.97) 100%)",
        }}
      />

      {/* Sparkle / firework bursts */}
      {sparkles.map((s) => (
        <div
          key={`s-${s.key}`}
          className="absolute"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animation: `sparkle-burst 1.6s ease-out ${s.delay}s infinite`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle, rgba(253,230,138,0.95) 0%, rgba(251,191,36,0.6) 35%, transparent 70%)",
              borderRadius: "9999px",
              filter: "blur(0.5px)",
            }}
          />
          {/* Cross spike */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: `${s.size * 3}px`,
              height: "2px",
              background:
                "linear-gradient(90deg, transparent, rgba(253,230,138,0.95), transparent)",
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: "2px",
              height: `${s.size * 3}px`,
              background:
                "linear-gradient(180deg, transparent, rgba(253,230,138,0.95), transparent)",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      ))}

      {/* Confetti rain */}
      {confetti.map((c) => (
        <div
          key={`c-${c.key}`}
          className="absolute -top-8"
          style={{
            left: `${c.left}%`,
            width: `${c.size}px`,
            height: `${c.size * 0.45}px`,
            backgroundColor: c.color,
            transform: `rotate(${c.rotate}deg)`,
            animation: `confetti-fall ${c.duration}s linear ${c.delay}s infinite`,
            ["--confetti-drift" as string]: `${c.drift}px`,
            ["--confetti-rotate" as string]: `${c.rotate + 720}deg`,
            borderRadius: "2px",
            opacity: 0.95,
          }}
        />
      ))}

      {/* Floating emojis */}
      {floaters.map((f) => (
        <div
          key={`f-${f.key}`}
          className="absolute bottom-0"
          style={{
            left: `${f.left}%`,
            fontSize: `${f.size}px`,
            animation: `celebration-float ${f.duration}s ease-in ${f.delay}s infinite`,
            transform: "translateX(-50%)",
          }}
        >
          {f.emoji}
        </div>
      ))}

      {/* Centered headline */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
        <div
          className="font-sans text-sm md:text-base uppercase tracking-[0.5em] text-amber-300 mb-6 animate-celebration-fade-in"
          style={{ animationDelay: "0.2s", animationFillMode: "both" }}
        >
          Goal Reached
        </div>
        <h1
          className="font-serif italic text-amber-300 leading-none animate-celebration-pop"
          style={{
            fontSize: "clamp(4rem, 14vw, 14rem)",
            textShadow:
              "0 0 24px rgba(251,191,36,0.95), 0 0 64px rgba(251,191,36,0.6), 0 0 120px rgba(251,191,36,0.4)",
          }}
        >
          $100,000
        </h1>
        <div
          className="font-serif italic text-stone-100 mt-4 animate-celebration-fade-in"
          style={{
            fontSize: "clamp(1.5rem, 4vw, 4rem)",
            animationDelay: "0.6s",
            animationFillMode: "both",
            textShadow: "0 0 20px rgba(251,191,36,0.5)",
          }}
        >
          RAISED!
        </div>
        <div
          className="font-sans text-base md:text-xl text-stone-300 mt-10 max-w-2xl animate-celebration-fade-in"
          style={{ animationDelay: "1s", animationFillMode: "both" }}
        >
          🎉 Thank you to every donor who made this possible. 🎉
        </div>
      </div>
    </div>
  );
}
