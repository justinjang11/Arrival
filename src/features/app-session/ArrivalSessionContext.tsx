"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ArrivalSession,
  CompletedOnboarding,
  ShoppingRequest,
} from "./types";

interface ArrivalSessionValue {
  session: ArrivalSession | null;
  completeOnboarding: (completed: CompletedOnboarding) => void;
  submitShoppingRequest: (request: ShoppingRequest) => void;
}

const ArrivalSessionContext = createContext<ArrivalSessionValue | null>(null);

/**
 * Holds the temporary application session above all routes.
 *
 * React state is the only storage mechanism. There are deliberately no
 * localStorage, sessionStorage, cookie, IndexedDB, database, URL-state, or
 * network operations here. A full browser refresh creates a fresh provider
 * and therefore erases the session.
 */
export function ArrivalSessionProvider({
  children,
  initialSession = null,
}: {
  children: ReactNode;
  initialSession?: ArrivalSession | null;
}) {
  const [session, setSession] = useState<ArrivalSession | null>(initialSession);

  const completeOnboarding = useCallback((completed: CompletedOnboarding) => {
    setSession({
      email: completed.email,
      profile: completed.profile,
      wishboneProfile: completed.wishboneProfile,
      onboardingComplete: true,
    });
  }, []);

  const submitShoppingRequest = useCallback((request: ShoppingRequest) => {
    setSession((current) =>
      current ? { ...current, shoppingRequest: request } : current
    );
  }, []);

  const value = useMemo(
    () => ({ session, completeOnboarding, submitShoppingRequest }),
    [session, completeOnboarding, submitShoppingRequest]
  );

  return (
    <ArrivalSessionContext.Provider value={value}>
      {children}
    </ArrivalSessionContext.Provider>
  );
}

export function useArrivalSession(): ArrivalSessionValue {
  const value = useContext(ArrivalSessionContext);
  if (!value) {
    throw new Error(
      "useArrivalSession must be used within an ArrivalSessionProvider"
    );
  }
  return value;
}