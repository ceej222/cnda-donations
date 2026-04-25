export function ProgressBar() {
  return (
    <div
      className="relative h-[120px] w-full overflow-hidden rounded-2xl border border-stone-800/70 bg-stone-900/60 backdrop-blur-sm"
    >
      <iframe
        title="Donation form powered by Zeffy"
        src="https://www.zeffy.com/embed/thermometer/cnda-pac-donation"
        style={{
          position: "absolute",
          border: 0,
          top: "18px",
          left: 0,
          right: 0,
          width: "100%",
          height: "120px",
          // Cross-origin embed: use filter to improve label contrast on dark background.
          filter: "invert(1) hue-rotate(180deg) brightness(1.25)",
        }}
      />
    </div>
  );
}
