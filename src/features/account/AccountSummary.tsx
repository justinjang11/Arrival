"use client";

import { useArrivalSession } from "@/features/app-session/ArrivalSessionContext";
import { ReviewStep } from "@/features/setup/steps/ReviewStep";
import { DIMENSION_LABELS, poleLabel } from "@/features/wishbone/wishboneData";

export function AccountSummary() {
  const { session } = useArrivalSession();

  if (!session?.onboardingComplete) {
    return null;
  }

  return (
    <div>
      <header className="mb-8">
        <p className="mb-2 text-sm font-medium text-zinc-500">Account</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Your profile
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          This is a read-only view of the current in-memory session. Editing
          and persistence are not implemented yet.
        </p>
      </header>

      <ReviewStep
        email={session.email}
        profile={session.profile}
        helperText="Contact, delivery, product-pool, and sizing information from this browser session."
      />

      <section aria-labelledby="taste-profile-heading" className="mt-8">
        <h2
          id="taste-profile-heading"
          className="mb-2 text-xl font-semibold text-zinc-900"
        >
          Taste profile
        </h2>
        <p className="mb-6 text-sm text-zinc-500">
          Your four Wishbone selections from this browser session.
        </p>
        <dl className="rounded-lg border border-zinc-200 px-4">
          {session.wishboneProfile.selections.map((selection) => (
            <div
              key={selection.dimension}
              className="flex justify-between gap-4 border-b border-zinc-100 py-2 last:border-0"
            >
              <dt className="text-sm text-zinc-500">
                {DIMENSION_LABELS[selection.dimension].title}
              </dt>
              <dd className="text-right text-sm font-medium text-zinc-900">
                {poleLabel(selection.chosenPole)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-8 text-xs leading-5 text-zinc-400">
        Refreshing this page erases the temporary application session and
        returns you to setup.
      </p>
    </div>
  );
}