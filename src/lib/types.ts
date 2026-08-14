/**
 * Core domain types for Arrival.
 *
 * These types mirror the data model in ARRIVAL_PRODUCT_SPEC.md §5.5 and the
 * catalog requirements of MVP-DAT-001. They are intentionally free of
 * persistence concerns (no Supabase row types, no ORM annotations).
 */

// ---------------------------------------------------------------------------
// Shared enumerations
// ---------------------------------------------------------------------------

/**
 * Controls which product pools may be recommended to a user.
 * Maps to the gender-based product preference collected in MVP-ONB-001.
 * Gender identity is explicitly not used as a substitute (see spec §2.1).
 */
export type GenderPool = "menswear" | "womenswear" | "both";

/**
 * High-level garment slot used for ensemble composition.
 * The spec requires flexible slot assignment — not every outfit uses the same
 * template (MVP-OUT-001).
 */
export type ProductCategory =
  | "top"
  | "bottom"
  | "outerwear"
  | "dress"
  | "shoes"
  | "accessory";

/**
 * Variant-level inventory state. MVP-DAT-001 requires that stale or
 * unavailable variants are not presented as purchasable.
 */
export type AvailabilityStatus = "in_stock" | "low_stock" | "out_of_stock";

// ---------------------------------------------------------------------------
// Retailer
// ---------------------------------------------------------------------------

/** A normalized retailer record. */
export interface Retailer {
  id: string;
  name: string;
  /** Base URL of the retailer's public storefront. */
  baseUrl: string;
}

// ---------------------------------------------------------------------------
// Product and variant
// ---------------------------------------------------------------------------

/**
 * A specific size-and-color version of a product.
 *
 * Captures every per-variant field required by MVP-DAT-001:
 *   - color, size — the variant selector
 *   - priceCents — current price in USD cents (avoids floating-point errors)
 *   - availability — in_stock | low_stock | out_of_stock
 *   - estimatedDeliveryDate — enforces the §4.2 delivery rule
 *   - lastChecked — detects catalog staleness (MVP-DAT-001)
 *   - productUrl — deep link to this variant on the retailer's site
 *   - imageUrl — product image (local placeholder for sample data;
 *                live catalog will use the retailer's public image URL)
 */
export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  /** Merchandise price in USD cents. */
  priceCents: number;
  availability: AvailabilityStatus;
  /**
   * ISO 8601 date (YYYY-MM-DD): earliest expected delivery date to the
   * customer. Used to enforce the delivery deadline from MVP-REQ-001 and §4.2.
   */
  estimatedDeliveryDate: string;
  /**
   * ISO 8601 timestamp: when this variant's data was last confirmed accurate.
   * Required by MVP-DAT-001 to support staleness detection.
   */
  lastChecked: string;
  /** URL of this variant's page on the retailer's site. */
  productUrl: string;
  /**
   * Image URL or local placeholder path. For the sample catalog this is a
   * local path under /images/sample/. Live catalog data will use the
   * retailer's public image URL (MVP-DAT-001).
   */
  imageUrl: string;
}

/**
 * A normalized retailer product independent of any specific size/color
 * selection. Matches the "Product" definition in ARRIVAL_PRODUCT_SPEC.md §4.
 */
export interface Product {
  id: string;
  retailerId: string;
  brand: string;
  name: string;
  category: ProductCategory;
  /** Which gender product pool(s) this product belongs to (MVP-ONB-001). */
  genderPool: GenderPool;
  variants: ProductVariant[];
}

// ---------------------------------------------------------------------------
// Shopping request
// ---------------------------------------------------------------------------

/**
 * The three fields a user submits from the Home screen (MVP-REQ-001).
 */
export interface ShoppingRequest {
  id: string;
  /** Natural-language occasion or contextual brief. */
  brief: string;
  /**
   * Hard maximum for the complete outfit in USD cents.
   *
   * TEMPORARY ASSUMPTION (UNR-004 unresolved): enforced as a merchandise
   * subtotal limit only. Tax and shipping are excluded until UNR-004 is
   * resolved. This assumption is labeled in every function that uses it.
   */
  budgetCents: number;
  /**
   * ISO 8601 date (YYYY-MM-DD): every required item must arrive by this date.
   * Enforces the delivery rule from §4.2.
   */
  needByDate: string;
}

// ---------------------------------------------------------------------------
// Outfit
// ---------------------------------------------------------------------------

/** One selected variant within a generated or saved outfit. */
export interface OutfitItem {
  productId: string;
  variantId: string;
}

/**
 * A set of mutually compatible product variants produced for one shopping
 * request. "Outfit" and "ensemble" are equivalent in the MVP (§4).
 */
export interface Outfit {
  id: string;
  requestId: string;
  items: OutfitItem[];
}
