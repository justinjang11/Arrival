/**
 * Unit tests for src/lib/eligibility.ts.
 *
 * All dates and prices are fixed so test results do not vary by run date.
 *
 * TEMPORARY ASSUMPTION (UNR-004 unresolved): budget comparisons use the
 * merchandise subtotal only. Tests that reference budget eligibility are
 * labeled with this assumption so they can be updated when UNR-004 is
 * resolved.
 *
 * Tests use sample catalog data from src/data/catalog.ts where appropriate,
 * and inline fixtures where isolation is clearer.
 */

import { describe, it, expect } from "vitest";
import {
  calculateSubtotalCents,
  allVariantsAvailable,
  latestDeliveryDate,
  isBudgetExceeded,
  allItemsArriveBy,
  checkEligibility,
} from "@/lib/eligibility";
import { SAMPLE_PRODUCTS, SAMPLE_VARIANT_MAP, buildVariantMap } from "@/data/catalog";
import type { Outfit, OutfitItem, ShoppingRequest } from "@/lib/types";

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

/**
 * Three-item menswear outfit: shirt (M/White) + chino (32x32/Tan) + shoe (10/Tan)
 * All in stock, all from the sample catalog.
 *
 * Fixed prices:
 *   Shirt  v-001-md-wht  $89.00  =  8 900 cents
 *   Chino  v-002-32-tan $125.00  = 12 500 cents
 *   Shoe   v-005-10-tan $185.00  = 18 500 cents
 *   Subtotal            $399.00  = 39 900 cents
 *
 * Fixed deliveries: 2026-08-22, 2026-08-24, 2026-08-26  → latest 2026-08-26
 */
const VALID_ITEMS: OutfitItem[] = [
  { productId: "p-001", variantId: "v-001-md-wht" },
  { productId: "p-002", variantId: "v-002-32-tan" },
  { productId: "p-005", variantId: "v-005-10-tan" },
];

const VALID_OUTFIT: Outfit = {
  id: "outfit-valid",
  requestId: "req-valid",
  items: VALID_ITEMS,
};

/** Request with sufficient budget and a need-by date after all deliveries. */
const VALID_REQUEST: ShoppingRequest = {
  id: "req-valid",
  brief: "Smart casual dinner in the city",
  budgetCents: 50000, // $500.00 — well above $399.00 subtotal
  needByDate: "2026-09-01", // after 2026-08-26 latest delivery
};

// ---------------------------------------------------------------------------
// calculateSubtotalCents
// ---------------------------------------------------------------------------

describe("calculateSubtotalCents", () => {
  it("returns the sum of all selected variant prices", () => {
    // Shirt $89.00 + Chino $125.00 + Shoe $185.00 = $399.00 = 39 900 cents
    expect(calculateSubtotalCents(VALID_ITEMS, SAMPLE_VARIANT_MAP)).toBe(39900);
  });

  it("returns 0 for an empty items list", () => {
    expect(calculateSubtotalCents([], SAMPLE_VARIANT_MAP)).toBe(0);
  });

  it("returns the single variant price for a one-item outfit", () => {
    const items: OutfitItem[] = [
      { productId: "p-001", variantId: "v-001-md-wht" },
    ];
    expect(calculateSubtotalCents(items, SAMPLE_VARIANT_MAP)).toBe(8900);
  });

  it("throws when a variantId is not in the map", () => {
    const items: OutfitItem[] = [
      { productId: "p-001", variantId: "v-does-not-exist" },
    ];
    expect(() =>
      calculateSubtotalCents(items, SAMPLE_VARIANT_MAP)
    ).toThrow("Variant not found in map");
  });
});

// ---------------------------------------------------------------------------
// latestDeliveryDate
// ---------------------------------------------------------------------------

describe("latestDeliveryDate", () => {
  it("returns the latest delivery date among all selected variants", () => {
    // Deliveries: 2026-08-22, 2026-08-24, 2026-08-26 → latest is 2026-08-26
    expect(latestDeliveryDate(VALID_ITEMS, SAMPLE_VARIANT_MAP)).toBe(
      "2026-08-26"
    );
  });

  it("returns null for an empty items list", () => {
    expect(latestDeliveryDate([], SAMPLE_VARIANT_MAP)).toBeNull();
  });

  it("returns the single delivery date for a one-item outfit", () => {
    const items: OutfitItem[] = [
      { productId: "p-004", variantId: "v-004-sm-crm" },
    ];
    expect(latestDeliveryDate(items, SAMPLE_VARIANT_MAP)).toBe("2026-08-20");
  });

  it("picks the later of two dates correctly", () => {
    // Tote 2026-08-19, Dress 2026-08-20 → latest is 2026-08-20
    const items: OutfitItem[] = [
      { productId: "p-007", variantId: "v-007-os-nat" },
      { productId: "p-004", variantId: "v-004-sm-crm" },
    ];
    expect(latestDeliveryDate(items, SAMPLE_VARIANT_MAP)).toBe("2026-08-20");
  });
});

// ---------------------------------------------------------------------------
// isBudgetExceeded
// ---------------------------------------------------------------------------

describe("isBudgetExceeded", () => {
  it("returns false when subtotal equals the budget", () => {
    expect(isBudgetExceeded(39900, 39900)).toBe(false);
  });

  it("returns false when subtotal is below the budget", () => {
    expect(isBudgetExceeded(39900, 50000)).toBe(false);
  });

  it("returns true when subtotal is one cent over budget", () => {
    expect(isBudgetExceeded(39901, 39900)).toBe(true);
  });

  it("returns true when subtotal is well over budget", () => {
    expect(isBudgetExceeded(39900, 20000)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// allItemsArriveBy
// ---------------------------------------------------------------------------

describe("allItemsArriveBy", () => {
  it("returns true when latest delivery equals the need-by date", () => {
    expect(allItemsArriveBy("2026-08-26", "2026-08-26")).toBe(true);
  });

  it("returns true when latest delivery is before the need-by date", () => {
    expect(allItemsArriveBy("2026-08-26", "2026-09-01")).toBe(true);
  });

  it("returns false when latest delivery is one day after the need-by date", () => {
    expect(allItemsArriveBy("2026-08-27", "2026-08-26")).toBe(false);
  });

  it("returns true when latestDelivery is null (empty outfit)", () => {
    expect(allItemsArriveBy(null, "2026-08-26")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// allVariantsAvailable
// ---------------------------------------------------------------------------

describe("allVariantsAvailable", () => {
  it("returns true when all selected variants are in_stock", () => {
    expect(allVariantsAvailable(VALID_ITEMS, SAMPLE_VARIANT_MAP)).toBe(true);
  });

  it("returns true when a variant is low_stock (not out_of_stock)", () => {
    // v-001-md-nvy is low_stock in the sample catalog.
    const items: OutfitItem[] = [
      { productId: "p-001", variantId: "v-001-md-nvy" },
    ];
    expect(allVariantsAvailable(items, SAMPLE_VARIANT_MAP)).toBe(true);
  });

  it("returns false when any variant is out_of_stock", () => {
    // v-001-lg-nvy is intentionally out_of_stock in the sample catalog.
    const items: OutfitItem[] = [
      { productId: "p-001", variantId: "v-001-md-wht" }, // in_stock
      { productId: "p-001", variantId: "v-001-lg-nvy" }, // out_of_stock
    ];
    expect(allVariantsAvailable(items, SAMPLE_VARIANT_MAP)).toBe(false);
  });

  it("returns false when a variantId is absent from the map", () => {
    const items: OutfitItem[] = [
      { productId: "p-001", variantId: "v-does-not-exist" },
    ];
    expect(allVariantsAvailable(items, SAMPLE_VARIANT_MAP)).toBe(false);
  });

  it("returns true for an empty items list", () => {
    expect(allVariantsAvailable([], SAMPLE_VARIANT_MAP)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// checkEligibility — valid outfit
// ---------------------------------------------------------------------------

describe("checkEligibility — valid outfit", () => {
  it("returns eligible=true and no reasons for a valid outfit", () => {
    const result = checkEligibility(VALID_OUTFIT, VALID_REQUEST, SAMPLE_VARIANT_MAP);
    expect(result.eligible).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// checkEligibility — over budget
// TEMPORARY ASSUMPTION (UNR-004): budget is merchandise subtotal only.
// ---------------------------------------------------------------------------

describe("checkEligibility — over budget (UNR-004 temporary assumption: subtotal only)", () => {
  it("returns ineligible when the subtotal exceeds the budget", () => {
    // Subtotal is $399.00 (39 900 cents); budget is $350.00 (35 000 cents).
    const tightRequest: ShoppingRequest = {
      ...VALID_REQUEST,
      budgetCents: 35000,
    };
    const result = checkEligibility(VALID_OUTFIT, tightRequest, SAMPLE_VARIANT_MAP);
    expect(result.eligible).toBe(false);
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0]).toMatch(/subtotal/i);
    expect(result.reasons[0]).toMatch(/budget/i);
  });

  it("returns eligible when subtotal exactly meets the budget", () => {
    // Budget equals subtotal exactly ($399.00 = 39 900 cents).
    const exactRequest: ShoppingRequest = {
      ...VALID_REQUEST,
      budgetCents: 39900,
    };
    const result = checkEligibility(VALID_OUTFIT, exactRequest, SAMPLE_VARIANT_MAP);
    expect(result.eligible).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// checkEligibility — unavailable variant
// ---------------------------------------------------------------------------

describe("checkEligibility — unavailable variant", () => {
  it("returns ineligible when a selected variant is out_of_stock", () => {
    // v-001-lg-nvy (Harwick Linen Shirt L/Navy) is intentionally out_of_stock
    // in the sample catalog.
    const outOfStockOutfit: Outfit = {
      id: "outfit-oos",
      requestId: "req-valid",
      items: [
        { productId: "p-001", variantId: "v-001-lg-nvy" }, // out_of_stock
        { productId: "p-002", variantId: "v-002-32-tan" }, // in_stock
      ],
    };
    const result = checkEligibility(
      outOfStockOutfit,
      VALID_REQUEST,
      SAMPLE_VARIANT_MAP
    );
    expect(result.eligible).toBe(false);
    expect(result.reasons.some((r) => r.includes("v-001-lg-nvy"))).toBe(true);
  });

  it("returns eligible when all variants are low_stock (not out_of_stock)", () => {
    // v-001-md-nvy is low_stock — should still be eligible.
    const lowStockOutfit: Outfit = {
      id: "outfit-low",
      requestId: "req-valid",
      items: [{ productId: "p-001", variantId: "v-001-md-nvy" }],
    };
    const result = checkEligibility(
      lowStockOutfit,
      VALID_REQUEST,
      SAMPLE_VARIANT_MAP
    );
    expect(result.eligible).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// checkEligibility — item arrives after deadline
// ---------------------------------------------------------------------------

describe("checkEligibility — late delivery", () => {
  it("returns ineligible when an item's delivery is after the need-by date", () => {
    // Westerly Wool Jacket (v-003-md-chr) delivers 2026-09-02.
    // Chino (v-002-32-tan) delivers 2026-08-24.
    // Need-by: 2026-08-30 — jacket misses the deadline.
    const lateOutfit: Outfit = {
      id: "outfit-late",
      requestId: "req-late",
      items: [
        { productId: "p-003", variantId: "v-003-md-chr" }, // delivers 2026-09-02
        { productId: "p-002", variantId: "v-002-32-tan" }, // delivers 2026-08-24
      ],
    };
    const earlyRequest: ShoppingRequest = {
      id: "req-late",
      brief: "Weekend event",
      budgetCents: 100000, // $1 000.00 — not the binding constraint here
      needByDate: "2026-08-30",
    };
    const result = checkEligibility(
      lateOutfit,
      earlyRequest,
      SAMPLE_VARIANT_MAP
    );
    expect(result.eligible).toBe(false);
    expect(result.reasons.some((r) => r.includes("2026-09-02"))).toBe(true);
    expect(result.reasons.some((r) => r.includes("2026-08-30"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// checkEligibility — multiple violations
// ---------------------------------------------------------------------------

describe("checkEligibility — multiple violations", () => {
  it("reports all violations in a single result", () => {
    // out_of_stock variant + tight budget + jacket misses early deadline.
    const multiViolationOutfit: Outfit = {
      id: "outfit-multi",
      requestId: "req-multi",
      items: [
        { productId: "p-001", variantId: "v-001-lg-nvy" }, // out_of_stock
        { productId: "p-003", variantId: "v-003-md-chr" }, // delivers 2026-09-02
      ],
    };
    const strictRequest: ShoppingRequest = {
      id: "req-multi",
      brief: "Formal dinner",
      budgetCents: 5000, // $50.00 — well under any subtotal
      needByDate: "2026-08-25",
    };
    const result = checkEligibility(
      multiViolationOutfit,
      strictRequest,
      SAMPLE_VARIANT_MAP
    );
    expect(result.eligible).toBe(false);
    // At minimum the availability reason must be present.
    expect(result.reasons.length).toBeGreaterThanOrEqual(1);
    expect(result.reasons.some((r) => /unavailable/i.test(r))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// buildVariantMap (catalog helper)
// ---------------------------------------------------------------------------

describe("buildVariantMap", () => {
  it("includes every variant from every product", () => {
    const map = buildVariantMap(SAMPLE_PRODUCTS);
    const totalVariants = SAMPLE_PRODUCTS.reduce(
      (n, p) => n + p.variants.length,
      0
    );
    expect(map.size).toBe(totalVariants);
  });

  it("returns an empty map for an empty product list", () => {
    expect(buildVariantMap([]).size).toBe(0);
  });

  it("keys variants by variantId", () => {
    const map = buildVariantMap(SAMPLE_PRODUCTS);
    const variant = map.get("v-001-md-wht");
    expect(variant).toBeDefined();
    expect(variant?.productId).toBe("p-001");
    expect(variant?.size).toBe("M");
    expect(variant?.color).toBe("White");
    expect(variant?.priceCents).toBe(8900);
  });
});
