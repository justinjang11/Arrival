"use client";

import { useRouter } from "next/navigation";
import { useArrivalSession } from "@/features/app-session/ArrivalSessionContext";
import type { CompletedOnboarding } from "@/features/app-session/types";
import { SetupFlow } from "./SetupFlow";

/**
 * Route-level bridge between the reusable setup flow and the temporary
 * application session.
 */
export function SetupEntry() {
  const router = useRouter();
  const { completeOnboarding } = useArrivalSession();

  const handleEnterArrival = (completed: CompletedOnboarding) => {
    completeOnboarding(completed);
    router.push("/home");
  };

  return <SetupFlow onEnterArrival={handleEnterArrival} />;
}