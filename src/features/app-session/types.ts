import type { ProfileDraft } from "@/features/setup/types";
import type { WishboneTasteProfile } from "@/features/wishbone/types";

/**
 * A submitted Home request held only for the lifetime of the current React
 * tree. The budget is normalized to a number after deterministic validation.
 */
export interface ShoppingRequest {
  shoppingFor: string;
  totalOutfitBudget: number;
  needBy: string;
}

/** Data transferred from completed onboarding into the application session. */
export interface CompletedOnboarding {
  email: string;
  profile: ProfileDraft;
  wishboneProfile: WishboneTasteProfile;
}

/**
 * TEMPORARY PROTOTYPE SESSION
 *
 * This object lives only in React state. It is intentionally erased by a page
 * refresh and must never contain the setup password.
 */
export interface ArrivalSession extends CompletedOnboarding {
  onboardingComplete: boolean;
  shoppingRequest?: ShoppingRequest;
}