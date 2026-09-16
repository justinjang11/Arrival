"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useArrivalSession } from "@/features/app-session/ArrivalSessionContext";
import { ApplicationNavigation } from "./ApplicationNavigation";

/**
 * Shared guard and layout for post-onboarding routes.
 *
 * A missing in-memory session is expected after refresh. The initial render is
 * deterministic on both server and client; redirection happens after mount so
 * no hydration-unstable browser state is read during rendering.
 */
export function ProtectedApplicationPage({
  children,
}: {
  children: ReactNode;
}) {
  const { session } = useArrivalSession();
  const router = useRouter();
  const canEnterApplication = session?.onboardingComplete === true;

  useEffect(() => {
    if (!canEnterApplication) {
      router.replace("/setup");
    }
  }, [canEnterApplication, router]);

  if (!canEnterApplication) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <p className="text-sm text-zinc-500" aria-live="polite">
          Returning to setup…
        </p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main className="mx-auto max-w-2xl px-6 pb-32 pt-10 sm:pt-14">
        {children}
      </main>
      <ApplicationNavigation />
    </div>
  );
}