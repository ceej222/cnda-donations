import { Fragment } from "react";
import type { Donor } from "@/lib/supabase";

type Props = {
  donors: Donor[];
};

export function DonorTicker({ donors }: Props) {
  if (donors.length === 0) return null;

  // Show oldest first so the paragraph reads chronologically
  const ordered = [...donors].reverse();

  return (
    <p className="font-serif text-amber-300 text-xl md:text-2xl leading-relaxed text-center px-8">
      {ordered.map((donor, idx) => (
        <Fragment key={donor.id}>
          {idx > 0 && (
            <span
              aria-hidden
              className="inline-block align-middle mx-4 h-2 w-2 rounded-full bg-amber-400/70 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
            />
          )}
          <span className="align-middle">{donor.name}</span>
        </Fragment>
      ))}
    </p>
  );
}
