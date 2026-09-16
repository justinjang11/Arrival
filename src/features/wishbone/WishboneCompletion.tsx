"use client";

import { DIMENSION_LABELS, poleLabel } from "./wishboneData";
import type { WishboneTasteProfile } from "./types";

interface Props {
  email: string;
  profile: WishboneTasteProfile;
  onEnterArrival?: () => void;
}

/**
 * Final confirmation screen shown after the fourth Wishbone round.
 *
 * Internal dimension/pole labels are only ever shown here — never during
 * the this-or-that rounds themselves (per product requirement).
 */
export function WishboneCompletion({
  email,
  profile,
  onEnterArrival = () => undefined,
}: Props) {
  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-center">
      <div className="mb-4 text-4xl" aria-hidden="true">
        ✓
      </div>
      <h1 className="mb-2 text-xl font-semibold text-zinc-900">
        You&apos;re all set.
      </h1>
      <p className="mb-8 text-sm text-zinc-600">
        Your starting taste profile is ready for the next stage of the
        prototype{email ? ` (${email})` : ""}.
      </p>

      <div className="mb-8 rounded-lg border border-zinc-200 px-4 text-left">
        {profile.selections.map((selection) => {
          const { title } = DIMENSION_LABELS[selection.dimension];
          return (
            <div
              key={selection.dimension}
              className="flex justify-between gap-4 border-b border-zinc-100 py-2 last:border-0"
            >
              <span className="text-sm text-zinc-500">{title}</span>
              <span className="text-sm font-medium text-zinc-900">
                {poleLabel(selection.chosenPole)}
              </span>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onEnterArrival}
        className="mb-5 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1"
      >
        Enter Arrival
      </button>

      <p className="text-xs text-zinc-400">
        No information has been sent or stored anywhere. This nonpersistent
        prototype will lose this data on refresh.
      </p>
    </div>
  );
}
