/**
 * Deterministic eligibility functions for Arrival outfits.
 *
 * These functions evaluate the hard constraints defined in:
 *   - MVP-REQ-001: budget cap and delivery deadline
 *   - MVP-OUT-001: availability of every selected variant
 *   - §4.1 (budget rule) and §4.2 (delivery rule)
 *
 * TEMPORARY ASSUMPTION (UNR-004 unresolved):
 *   `budgetCents` in ShoppingRequest is compared only against the merchandise
 *   subtotal. Tax and shipping are not factored in. This assumption applies to
 *   the sample-catalog milestone only and must be revisited when UNR-004 is
 *   resolved. It is labeled on every function that depends on it.
 *
 * These functions deliberately contain no AI model calls, recommendation
 * ranking, or aesthetic compatibility scoring (UNR-006 is unresolved and is
 * not implemented here).
 *
 * Determinism guarantee: given the same inputs these functions always return
 * the same result. They are pure — no external I/O, no randomness, no Date.now().
 */

import type {
  Outfit,
  OutfitItem,
  ProductVariant,
  ShoppingRequest,
} from "./types";

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

export interface EligibilityResult {
  eligible: boolean;
  /**
   * Human-readable reasons why the outfit is ineligible.
   * Empty array when eligible === true.
   */
  reasons: string[];
}

// ---------------------------------------------------------------------------
// Individual calculations
// ---------------------------------------------------------------------------

/**
 * Returns the merchandise subtotal in USD cents for the selected outfit items.
 *
 * TEMPORARY ASSUMPTION (UNR-004): subtotal is merchandise-only.
 *
 * @throws if any variantId referenced by an OutfitItem is absent from the map.
 *         Callers must supply a map that covers every variant in the outfit.
 */
export function calculateSubtotalCents(
  items: OutfitItem[],
  variantMap: Map<string, ProductVariant>
): number {
  return items.reduce((sum, item) => {
    const variant = variantMap.get(item.variantId);
    if (!variant) {
      throw new Error(
        `Variant not found in map: variantId="${item.variantId}" productId="${item.productId}"`
      );
    }
    return sum + variant.priceCents;
  }, 0);
}

/**
 * Returns true when every selected variant has availability "in_stock" or
 * "low_stock". Returns false when any variant is "out_of_stock" or is absent
 * from the map (treated as unavailable per MVP-DAT-001).
 */
export function allVariantsAvailable(
  items: OutfitItem[],
  variantMap: Map<string, ProductVariant>
): boolean {
  return items.every((item) => {
    const variant = variantMap.get(item.variantId);
    return variant !== undefined && variant.availability !== "out_of_stock";
  });
}

/**
 * Returns the latest estimatedDeliveryDate (ISO date string YYYY-MM-DD) among
 * all selected variants, or null when items is empty.
 *
 * Implements the delivery rule from §4.2: the ensemble delivery estimate is
 * the latest expected delivery among its required items.
 *
 * @throws if any variantId is absent from the map.
 */
export function latestDeliveryDate(
  items: OutfitItem[],
  variantMap: Map<string, ProductVariant>
): string | null {
  if (items.length === 0) return null;

  return items.reduce<string | null>((latest, item) => {
    const variant = variantMap.get(item.variantId);
    if (!variant) {
      throw new Error(
        `Variant not found in map: variantId="${item.variantId}" productId="${item.productId}"`
      );
    }
    if (latest === null) return variant.estimatedDeliveryDate;
    return variant.estimatedDeliveryDate > latest
      ? variant.estimatedDeliveryDate
      : latest;
  }, null);
}

/**
 * Returns true when the merchandise subtotal exceeds the budget.
 *
 * TEMPORARY ASSUMPTION (UNR-004): subtotal is merchandise-only.
 */
export function isBudgetExceeded(
  subtotalCents: number,
  budgetCents: number
): boolean {
  return subtotalCents > budgetCents;
}

/**
 * Returns true when every required item is expected to arrive on or before
 * the need-by date. Implements the delivery rule from §4.2.
 *
 * ISO date string lexicographic order matches chronological order for
 * YYYY-MM-DD strings, so string comparison is correct here.
 *
 * @param latestDelivery - ISO date from latestDeliveryDate(), or null for
 *                         empty outfits (treated as on time)
 * @param needByDate     - ISO date from ShoppingRequest.needByDate
 */
export function allItemsArriveBy(
  latestDelivery: string | null,
  needByDate: string
): boolean {
  if (latestDelivery === null) return true;
  return latestDelivery <= needByDate;
}

// ---------------------------------------------------------------------------
// Composite eligibility check
// ---------------------------------------------------------------------------

/**
 * Evaluates all hard eligibility constraints for an outfit against a shopping
 * request. Returns an EligibilityResult with a non-empty reasons array when
 * the outfit is ineligible.
 *
 * Constraints checked (in order):
 *   0. Outfit must contain at least one item.
 *   1. Every OutfitItem.variantId must exist in variantMap and its
 *      variant.productId must match the OutfitItem.productId.
 *      Out-of-stock variants are a separate availability failure.
 *   2. All selected variants must be available (not out_of_stock) — MVP-OUT-001
 *   3. Merchandise subtotal ≤ budget — §4.1, UNR-004 temporary assumption
 *   4. Every item arrives by the need-by date — §4.2
 *
 * Budget and delivery checks (3 & 4) only run when all variants are
 * resolvable (check 1 passes). Out-of-stock variants are resolvable — they
 * still have known prices and delivery dates — so checks 3 & 4 always run
 * alongside check 2 when no data-integrity problems exist.
 */
export function checkEligibility(
  outfit: Outfit,
  request: ShoppingRequest,
  variantMap: Map<string, ProductVariant>
): EligibilityResult {
  const reasons: string[] = [];

  // --- 0. Empty outfit ---
  if (outfit.items.length === 0) {
    return {
      eligible: false,
      reasons: [
        "Outfit contains no items. The specification does not define a fixed " +
          "item template; add the appropriate items for the occasion before " +
          "checking eligibility.",
      ],
    };
  }

  // --- 1. Item integrity: variant existence and productId/variantId consistency ---
  const integrityFailures: string[] = [];
  const outOfStockIds: string[] = [];

  for (const item of outfit.items) {
    const variant = variantMap.get(item.variantId);
    if (!variant) {
      integrityFailures.push(
        `Variant "${item.variantId}" was not found in the catalog.`
      );
    } else if (variant.productId !== item.productId) {
      integrityFailures.push(
        `Variant "${item.variantId}" belongs to product "${variant.productId}", ` +
          `not "${item.productId}".`
      );
    } else if (variant.availability === "out_of_stock") {
      outOfStockIds.push(item.variantId);
    }
  }

  if (integrityFailures.length > 0) {
    reasons.push(...integrityFailures);
  }

  // --- 2. Availability (business rule — separate from integrity) ---
  if (outOfStockIds.length > 0) {
    reasons.push(
      `One or more selected variants are unavailable: ${outOfStockIds.join(", ")}`
    );
  }

  // Budget and delivery checks require all variants to be resolvable.
  // Out-of-stock variants are still resolvable (price and delivery are known).
  if (integrityFailures.length === 0) {
    // --- 3. Budget (TEMPORARY ASSUMPTION: merchandise subtotal only — UNR-004) ---
    const subtotalCents = calculateSubtotalCents(outfit.items, variantMap);
    if (isBudgetExceeded(subtotalCents, request.budgetCents)) {
      const subtotalStr = (subtotalCents / 100).toFixed(2);
      const budgetStr = (request.budgetCents / 100).toFixed(2);
      reasons.push(
        `Merchandise subtotal $${subtotalStr} exceeds budget $${budgetStr}` +
          " (UNR-004 assumption: tax and shipping excluded from this check)"
      );
    }

    // --- 4. Delivery deadline (§4.2) ---
    const latest = latestDeliveryDate(outfit.items, variantMap);
    if (!allItemsArriveBy(latest, request.needByDate)) {
      reasons.push(
        `Latest item delivery ${latest} is after need-by date ${request.needByDate}`
      );
    }
  }

  return { eligible: reasons.length === 0, reasons };
}
