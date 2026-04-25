export function ProgressBar() {
  return (
    <div
      className="relative h-[120px] w-full overflow-hidden rounded-2xl border border-stone-700/70 bg-white"
    >
      <iframe
        title="Donation form powered by Zeffy"
        src="https://www.zeffy.com/embed/thermometer/cnda-pac-donation"
        style={{
          position: "absolute",
          border: 0,
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          height: "120px",
          backgroundColor: "#ffffff",
        }}
      />
    </div>
  );
}
