import type { ShoppingRequest } from "@/features/app-session/types";

export interface ShoppingRequestDraft {
  shoppingFor: string;
  totalOutfitBudget: string;
  needBy: string;
}

export type ShoppingRequestErrors = Partial<
  Record<keyof ShoppingRequestDraft, string>
>;

/**
 * Validates YYYY-MM-DD without locale parsing or current-time comparisons.
 * Calendar round-tripping rejects impossible dates such as 2026-02-31.
 */
function isValidDateValue(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Pure, deterministic validation for the three-field Home request. */
export function validateShoppingRequest(
  draft: ShoppingRequestDraft
): ShoppingRequestErrors {
  const errors: ShoppingRequestErrors = {};

  if (!draft.shoppingFor.trim()) {
    errors.shoppingFor = "Tell us what you are shopping for.";
  }

  const budgetText = draft.totalOutfitBudget.trim();
  if (!budgetText) {
    errors.totalOutfitBudget = "Enter a total outfit budget.";
  } else {
    const budget = Number(budgetText);
    if (!Number.isFinite(budget) || budget <= 0) {
      errors.totalOutfitBudget =
        "Enter a finite total outfit budget greater than zero.";
    }
  }

  if (!draft.needBy.trim()) {
    errors.needBy = "Choose when you need the outfit.";
  } else if (!isValidDateValue(draft.needBy)) {
    errors.needBy = "Enter a valid need-by date.";
  }

  return errors;
}

export function createShoppingRequest(
  draft: ShoppingRequestDraft
): ShoppingRequest {
  return {
    shoppingFor: draft.shoppingFor.trim(),
    totalOutfitBudget: Number(draft.totalOutfitBudget.trim()),
    needBy: draft.needBy,
  };
}