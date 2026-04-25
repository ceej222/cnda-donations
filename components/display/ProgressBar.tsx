export function ProgressBar() {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-stone-800/70 bg-stone-900/60 backdrop-blur-sm"
      style={{ paddingTop: "120px", height: "120px" }}
    >
      <iframe
        title="Donation form powered by Zeffy"
        src="https://www.zeffy.com/embed/thermometer/cnda-pac-donation"
        allowTransparency
        style={{
          position: "absolute",
          border: 0,
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          height: "120px",
        }}
      />
    </div>
  );
}
