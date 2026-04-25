import Image from "next/image";

export function QRPanel() {
  return (
    <div
      className="relative bg-white rounded-2xl border border-stone-300 shadow-[0_30px_80px_-20px_rgba(251,191,36,0.25),0_10px_30px_-10px_rgba(0,0,0,0.6)] p-5 flex items-center justify-center"
      style={{
        width: "min(40vh, 40vw)",
        height: "min(40vh, 40vw)",
      }}
    >
      <Image
        src="/qr-code.png"
        alt="Scan to donate"
        fill
        priority
        sizes="40vh"
        className="object-contain p-5"
      />
    </div>
  );
}
