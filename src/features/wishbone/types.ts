/**
 * TypeScript types for the Wishbone taste-learning prototype.
 *
 * TEMPORARY: All state is non-persistent React state, held by SetupFlow and
 * passed down as props. Nothing here is written to a database, localStorage,
 * sessionStorage, or cookies, and nothing is sent over the network. Refreshing
 * or closing the browser tab erases all Wishbone selections.
 */

/** The four fixed taste dimensions shown as this-or-that rounds. */
export type TasteDimension =
  | "minimalExpressive"
  | "tailoredRelaxed"
  | "classicDirectional"
  | "cleanTextured";

/** Every possible chosen "pole" across all four dimensions. */
export type TastePole =
  | "minimal"
  | "expressive"
  | "tailored"
  | "relaxed"
  | "classic"
  | "directional"
  | "clean"
  | "textured";

/**
 * Wishbone only ever shows a single-gendered image per option (never a
 * "both" image) — "both" product-pool users see a fixed mixed sequence of
 * menswear- and womenswear-sourced rounds instead.
 */
export type WishboneProductPool = "menswear" | "womenswear";

/** One selectable outfit image shown on a this-or-that card. */
export interface WishboneImageOption {
  /** Unique across all sixteen images, e.g. "minimal-menswear". */
  id: string;
  pole: TastePole;
  productPool: WishboneProductPool;
  /** Path under /public, e.g. "/wishbone/minimal-menswear.jpg". */
  src: string;
  /** Accessible description — never the filename or internal taste label. */
  alt: string;
}

/** A single this-or-that round: one dimension, two opposing outfit options. */
export interface WishboneRound {
  dimension: TasteDimension;
  /** Exactly two options — left/right (or stacked) presentation order. */
  options: readonly [WishboneImageOption, WishboneImageOption];
}

/** The user's recorded choice for one round. */
export interface WishboneSelection {
  dimension: TasteDimension;
  chosenPole: TastePole;
  imageId: string;
  productPool: WishboneProductPool;
}

/**
 * The completed, nonpersistent baseline taste profile.
 * Held only in React state — see file header.
 */
export interface WishboneTasteProfile {
  selections: WishboneSelection[];
}
