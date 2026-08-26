"use client";

/**
 * WishboneFlow — nonpersistent this-or-that taste-learning prototype.
 *
 * TEMPORARY: Selections live in React state only (see types.ts). Nothing is
 * written to a database, localStorage, sessionStorage, or cookies, and no
 * network request is made. Refreshing or leaving the page erases all
 * Wishbone progress.
 *
 * Deterministic by construction: rounds come from getWishboneRounds(), which
 * takes no random or time-based input, so this component renders identically
 * on the server and the client (no hydration mismatch).
 */

import { useMemo, useState } from "react";
import { ImageChoiceCard } from "./ImageChoiceCard";
import { getWishboneRounds } from "./wishboneData";
import type { WishboneSelection, WishboneTasteProfile } from "./types";

interface Props {
  productPool: "menswear" | "womenswear" | "both";
  /** Called when the user presses Back from round one — returns to Review. */
  onBack: () => void;
  /** Called after the fourth round's Finish setup click. */
  onComplete: (profile: WishboneTasteProfile) => void;
}

export function WishboneFlow({ productPool, onBack, onComplete }: Props) {
  const rounds = useMemo(() => getWishboneRounds(productPool), [productPool]);
  const totalRounds = rounds.length;

  const [roundIndex, setRoundIndex] = useState(0);
  const [selections, setSelections] = useState<(WishboneSelection | undefined)[]>(
    () => Array(totalRounds).fill(undefined)
  );
  const [showError, setShowError] = useState(false);

  const round = rounds[roundIndex];
  const currentSelection = selections[roundIndex];
  const isLastRound = roundIndex === totalRounds - 1;

  const handleSelect = (optionIndex: 0 | 1) => {
    const option = round.options[optionIndex];
    setSelections((prev) => {
      const next = [...prev];
      next[roundIndex] = {
        dimension: round.dimension,
        chosenPole: option.pole,
        imageId: option.id,
        productPool: option.productPool,
      };
      return next;
    });
    setShowError(false);
  };

  const handleContinue = () => {
    if (!currentSelection) {
      setShowError(true);
      return;
    }
    setShowError(false);
    if (isLastRound) {
      onComplete({ selections: selections as WishboneSelection[] });
    } else {
      setRoundIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    setShowError(false);
    if (roundIndex === 0) {
      onBack();
    } else {
      setRoundIndex((i) => i - 1);
    }
  };

  return (
    <section aria-label="Taste preferences" className="mx-auto max-w-lg px-6 py-12">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-900">
        Which feels more like you?
      </h1>
      <p className="mb-6 text-sm text-zinc-500">
        Four quick choices. There are no wrong answers.
      </p>

      <p className="mb-4 text-sm font-medium text-zinc-700">
        Round {roundIndex + 1} of {totalRounds}
      </p>

      <div className="mb-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ImageChoiceCard
          option={round.options[0]}
          selected={currentSelection?.imageId === round.options[0].id}
          onSelect={() => handleSelect(0)}
        />
        <ImageChoiceCard
          option={round.options[1]}
          selected={currentSelection?.imageId === round.options[1].id}
          onSelect={() => handleSelect(1)}
        />
      </div>

      {showError && !currentSelection && (
        <p role="alert" className="mb-4 mt-3 text-sm text-red-600">
          Choose one outfit to continue.
        </p>
      )}

      <p className="mb-8 mt-6 text-xs text-zinc-400">
        No information has been sent or stored. This is a nonpersistent
        prototype step.
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1"
        >
          {isLastRound ? "Finish setup" : "Continue"}
        </button>
      </div>
    </section>
  );
}
