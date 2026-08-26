/**
 * Deterministic image manifest and round-building logic for the Wishbone
 * taste-learning prototype.
 *
 * Pure and deterministic: no Math.random(), no Date.now(), no locale-
 * dependent output, no browser-width branching. The same product-pool input
 * always produces the same round sequence, so this hydrates identically on
 * server and client.
 */

import type {
  TasteDimension,
  TastePole,
  WishboneImageOption,
  WishboneProductPool,
  WishboneRound,
} from "./types";

// ---------------------------------------------------------------------------
// Image manifest — all sixteen images, one per (pole, productPool) pair.
// Alt text is prescribed verbatim by the product task and must never be the
// filename or the internal taste-dimension label.
// ---------------------------------------------------------------------------

export const WISHBONE_IMAGES: readonly WishboneImageOption[] = [
  {
    id: "minimal-menswear",
    pole: "minimal",
    productPool: "menswear",
    src: "/wishbone/minimal-menswear.jpg",
    alt: "Person wearing a gray crewneck sweater, navy trousers, and burgundy loafers.",
  },
  {
    id: "expressive-menswear",
    pole: "expressive",
    productPool: "menswear",
    src: "/wishbone/expressive-menswear.jpg",
    alt: "Person wearing a layered pink V-neck sweater, distressed denim, and several accessories.",
  },
  {
    id: "tailored-menswear",
    pole: "tailored",
    productPool: "menswear",
    src: "/wishbone/tailored-menswear.jpg",
    alt: "Person wearing a dark double-breasted suit, striped tie, and black shoes.",
  },
  {
    id: "relaxed-menswear",
    pole: "relaxed",
    productPool: "menswear",
    src: "/wishbone/relaxed-menswear.jpg",
    alt: "Person wearing an oversized charcoal blazer, graphic T-shirt, wide gray trousers, and black shoes.",
  },
  {
    id: "classic-menswear",
    pole: "classic",
    productPool: "menswear",
    src: "/wishbone/classic-menswear.jpg",
    alt: "Person wearing a burgundy and navy rugby shirt, dark jeans, and brown boots.",
  },
  {
    id: "directional-menswear",
    pole: "directional",
    productPool: "menswear",
    src: "/wishbone/directional-menswear.jpg",
    alt: "Person wearing a sculptural black leather jacket, gloves, gray trousers, and statement bags.",
  },
  {
    id: "clean-menswear",
    pole: "clean",
    productPool: "menswear",
    src: "/wishbone/clean-menswear.jpg",
    alt: "Person wearing a black peacoat, light straight-leg jeans, and black pointed shoes.",
  },
  {
    id: "textured-menswear",
    pole: "textured",
    productPool: "menswear",
    src: "/wishbone/textured-menswear.jpg",
    alt: "Person wearing a brown leather jacket over layered black tops with faded dark jeans.",
  },
  {
    id: "minimal-womenswear",
    pole: "minimal",
    productPool: "womenswear",
    src: "/wishbone/minimal-womenswear.png",
    alt: "Person wearing a gray turtleneck sweater, relaxed blue jeans, and brown shoes.",
  },
  {
    id: "expressive-womenswear",
    pole: "expressive",
    productPool: "womenswear",
    src: "/wishbone/expressive-womenswear.jpg",
    alt: "Person wearing a patterned pink halter top and matching skirt with a white handbag.",
  },
  {
    id: "tailored-womenswear",
    pole: "tailored",
    productPool: "womenswear",
    src: "/wishbone/tailored-womenswear.jpg",
    alt: "Person wearing a structured black suit with a white shirt and black belt.",
  },
  {
    id: "relaxed-womenswear",
    pole: "relaxed",
    productPool: "womenswear",
    src: "/wishbone/relaxed-womenswear.jpg",
    alt: "Person wearing a loose striped top, wide khaki trousers, black flats, and a woven shoulder bag.",
  },
  {
    id: "classic-womenswear",
    pole: "classic",
    productPool: "womenswear",
    src: "/wishbone/classic-womenswear.jpg",
    alt: "Person wearing a fitted burgundy top with wide white trousers and a white bag.",
  },
  {
    id: "directional-womenswear",
    pole: "directional",
    productPool: "womenswear",
    src: "/wishbone/directional-womenswear.jpg",
    alt: "Person wearing a cropped black military-style jacket, black shorts, and tall black boots.",
  },
  {
    id: "clean-womenswear",
    pole: "clean",
    productPool: "womenswear",
    src: "/wishbone/clean-womenswear.jpg",
    alt: "Person wearing a white boatneck top with white trousers and a black handbag.",
  },
  {
    id: "textured-womenswear",
    pole: "textured",
    productPool: "womenswear",
    src: "/wishbone/textured-womenswear.jpg",
    alt: "Person wearing an embroidered black blouse, tweed shorts, and black knee-high boots.",
  },
] as const;

/** Human-readable display labels for the final summary screen only. */
export const DIMENSION_LABELS: Record<
  TasteDimension,
  { poleA: TastePole; poleB: TastePole; title: string }
> = {
  minimalExpressive: { poleA: "minimal", poleB: "expressive", title: "Minimal vs. Expressive" },
  tailoredRelaxed: { poleA: "tailored", poleB: "relaxed", title: "Tailored vs. Relaxed" },
  classicDirectional: { poleA: "classic", poleB: "directional", title: "Classic vs. Directional" },
  cleanTextured: { poleA: "clean", poleB: "textured", title: "Clean vs. Textured" },
};

/** Capitalized display form of a taste pole, for the final summary only. */
export function poleLabel(pole: TastePole): string {
  return pole.charAt(0).toUpperCase() + pole.slice(1);
}

function findImage(pole: TastePole, pool: WishboneProductPool): WishboneImageOption {
  const image = WISHBONE_IMAGES.find(
    (img) => img.pole === pole && img.productPool === pool
  );
  if (!image) {
    // This can only happen if the manifest above is edited incorrectly —
    // every (pole, productPool) pair used by DIMENSION_LABELS must exist.
    throw new Error(`Wishbone image manifest is missing pole="${pole}" pool="${pool}"`);
  }
  return image;
}

function buildRound(dimension: TasteDimension, pool: WishboneProductPool): WishboneRound {
  const { poleA, poleB } = DIMENSION_LABELS[dimension];
  return {
    dimension,
    options: [findImage(poleA, pool), findImage(poleB, pool)] as const,
  };
}

/**
 * Builds the exactly-four-round deterministic sequence for a given
 * product-pool preference.
 *
 * "Both" is a TEMPORARY PROTOTYPE ASSUMPTION: to stay within the
 * specification's four-round maximum while still surfacing both pools, it
 * uses a fixed, hardcoded alternating sequence (menswear, womenswear,
 * menswear, womenswear) rather than any real personalization logic. This is
 * not a permanent product rule and must be revisited when Wishbone becomes
 * a real feature.
 */
export function getWishboneRounds(pool: WishboneProductPool | "both"): WishboneRound[] {
  if (pool === "menswear" || pool === "womenswear") {
    return [
      buildRound("minimalExpressive", pool),
      buildRound("tailoredRelaxed", pool),
      buildRound("classicDirectional", pool),
      buildRound("cleanTextured", pool),
    ];
  }

  // pool === "both"
  // TEMPORARY PROTOTYPE ASSUMPTION — fixed mixed sequence, see doc comment
  // above. Do not treat this ordering as a permanent personalization rule.
  return [
    buildRound("minimalExpressive", "menswear"),
    buildRound("tailoredRelaxed", "womenswear"),
    buildRound("classicDirectional", "menswear"),
    buildRound("cleanTextured", "womenswear"),
  ];
}
