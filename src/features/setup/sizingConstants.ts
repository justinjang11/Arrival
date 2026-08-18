/**
 * Shared option lists for letter-size and US shoe-size dropdowns.
 *
 * This file is the single source of truth for both the SizingStep UI and
 * the sizing validator. Keeping them together ensures the dropdown options
 * and the validation whitelist can never drift apart.
 */

import type { LetterSize } from "./types";

// ---------------------------------------------------------------------------
// Letter sizes
// ---------------------------------------------------------------------------

/**
 * Valid letter-size options for dropdowns and whitelist validation.
 * Does not include "" (the "unselected" sentinel used by the LetterSize type).
 */
export const LETTER_SIZES = [
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
] as const satisfies ReadonlyArray<Exclude<LetterSize, "">>;

/** O(1) membership check against the valid letter-size whitelist. */
export const LETTER_SIZE_SET: ReadonlySet<string> = new Set<string>(
  LETTER_SIZES
);

// ---------------------------------------------------------------------------
// US shoe sizes
// ---------------------------------------------------------------------------

/**
 * US shoe sizes from 3 through 18 in half-size increments (31 values).
 * Produces: "3", "3.5", "4", "4.5", …, "18".
 *
 * 0.5 is exactly representable in IEEE 754, so no floating-point drift
 * occurs across the full 3–18 range.
 */
export const US_SHOE_SIZES: readonly string[] = Array.from(
  { length: 31 },
  (_, i) => {
    const v = 3 + i * 0.5;
    return v % 1 === 0 ? String(Math.round(v)) : v.toFixed(1);
  }
);

/** O(1) membership check against the valid US shoe-size whitelist. */
export const US_SHOE_SIZE_SET: ReadonlySet<string> = new Set<string>(
  US_SHOE_SIZES
);
