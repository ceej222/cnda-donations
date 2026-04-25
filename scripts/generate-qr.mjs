// Generates public/qr-code.png from the Zeffy donation URL.
// Re-run with: npm run qr
import QRCode from "qrcode";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const URL = "https://www.zeffy.com/en-US/donation-form/cnda-pac-donation";
const OUT = "public/qr-code.png";

await mkdir(dirname(OUT), { recursive: true });
await QRCode.toFile(OUT, URL, {
  errorCorrectionLevel: "H",
  margin: 1,
  width: 1200,
  color: {
    dark: "#0c0a09",
    light: "#ffffff",
  },
});
console.log(`Wrote ${OUT}`);
