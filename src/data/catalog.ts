/**
 * SAMPLE CATALOG — development data only.
 *
 * This file contains deliberately fictional retailers, brands, products,
 * prices, availability states, and delivery estimates. It MUST NOT be
 * presented to users as live shopping information.
 *
 * Purpose: provide enough varied records to exercise eligibility logic and
 * future UI components during Milestone 1 (interface with controlled sample
 * data), before the live catalog pipeline is connected (Milestone 3).
 *
 * Fictional retailers: Verdant, Northmill
 * Fictional brands: Lorne & Co, Halcyon, Fairfield
 *
 * Image paths (imageUrl) are local placeholders under /images/sample/.
 * The files do not need to exist for catalog logic to function; they will
 * be referenced by UI components when static assets are added.
 *
 * lastChecked timestamp used throughout: 2026-08-13T10:00:00Z (spec date)
 */

import type { Product, ProductVariant, Retailer } from "@/lib/types";

// ---------------------------------------------------------------------------
// Retailers
// ---------------------------------------------------------------------------

export const SAMPLE_RETAILERS: Retailer[] = [
  {
    id: "r-verdant",
    name: "Verdant",
    baseUrl: "https://verdant-style.example.com",
  },
  {
    id: "r-northmill",
    name: "Northmill",
    baseUrl: "https://northmill.example.co",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Builds a Map<variantId, ProductVariant> from a product list for O(1) lookup. */
export function buildVariantMap(
  products: Product[]
): Map<string, ProductVariant> {
  const map = new Map<string, ProductVariant>();
  for (const product of products) {
    for (const variant of product.variants) {
      map.set(variant.id, variant);
    }
  }
  return map;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const SAMPLE_PRODUCTS: Product[] = [
  // -------------------------------------------------------------------------
  // p-001 — Harwick Linen Shirt (menswear, top)
  // Retailer: Verdant | Brand: Lorne & Co
  // -------------------------------------------------------------------------
  {
    id: "p-001",
    retailerId: "r-verdant",
    brand: "Lorne & Co",
    name: "Harwick Linen Shirt",
    category: "top",
    genderPool: "menswear",
    variants: [
      {
        id: "v-001-sm-wht",
        productId: "p-001",
        size: "S",
        color: "White",
        priceCents: 8900,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-22",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://verdant-style.example.com/products/harwick-linen-shirt?size=S&color=white",
        imageUrl: "/images/sample/p-001-white.jpg",
      },
      {
        id: "v-001-md-wht",
        productId: "p-001",
        size: "M",
        color: "White",
        priceCents: 8900,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-22",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://verdant-style.example.com/products/harwick-linen-shirt?size=M&color=white",
        imageUrl: "/images/sample/p-001-white.jpg",
      },
      {
        id: "v-001-lg-wht",
        productId: "p-001",
        size: "L",
        color: "White",
        priceCents: 8900,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-22",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://verdant-style.example.com/products/harwick-linen-shirt?size=L&color=white",
        imageUrl: "/images/sample/p-001-white.jpg",
      },
      {
        id: "v-001-sm-nvy",
        productId: "p-001",
        size: "S",
        color: "Navy",
        priceCents: 8900,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-22",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://verdant-style.example.com/products/harwick-linen-shirt?size=S&color=navy",
        imageUrl: "/images/sample/p-001-navy.jpg",
      },
      {
        id: "v-001-md-nvy",
        productId: "p-001",
        size: "M",
        color: "Navy",
        priceCents: 8900,
        availability: "low_stock",
        estimatedDeliveryDate: "2026-08-22",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://verdant-style.example.com/products/harwick-linen-shirt?size=M&color=navy",
        imageUrl: "/images/sample/p-001-navy.jpg",
      },
      // Intentionally out_of_stock — used in unavailability tests.
      {
        id: "v-001-lg-nvy",
        productId: "p-001",
        size: "L",
        color: "Navy",
        priceCents: 8900,
        availability: "out_of_stock",
        estimatedDeliveryDate: "2026-08-22",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://verdant-style.example.com/products/harwick-linen-shirt?size=L&color=navy",
        imageUrl: "/images/sample/p-001-navy.jpg",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // p-002 — Fairlane Chino (menswear, bottom)
  // Retailer: Verdant | Brand: Halcyon
  // -------------------------------------------------------------------------
  {
    id: "p-002",
    retailerId: "r-verdant",
    brand: "Halcyon",
    name: "Fairlane Chino",
    category: "bottom",
    genderPool: "menswear",
    variants: [
      {
        id: "v-002-30-tan",
        productId: "p-002",
        size: "30x30",
        color: "Tan",
        priceCents: 12500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-24",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://verdant-style.example.com/products/fairlane-chino?size=30x30&color=tan",
        imageUrl: "/images/sample/p-002-tan.jpg",
      },
      {
        id: "v-002-32-tan",
        productId: "p-002",
        size: "32x32",
        color: "Tan",
        priceCents: 12500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-24",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://verdant-style.example.com/products/fairlane-chino?size=32x32&color=tan",
        imageUrl: "/images/sample/p-002-tan.jpg",
      },
      {
        id: "v-002-34-tan",
        productId: "p-002",
        size: "34x32",
        color: "Tan",
        priceCents: 12500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-24",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://verdant-style.example.com/products/fairlane-chino?size=34x32&color=tan",
        imageUrl: "/images/sample/p-002-tan.jpg",
      },
      {
        id: "v-002-30-olv",
        productId: "p-002",
        size: "30x30",
        color: "Olive",
        priceCents: 12500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-24",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://verdant-style.example.com/products/fairlane-chino?size=30x30&color=olive",
        imageUrl: "/images/sample/p-002-olive.jpg",
      },
      {
        id: "v-002-32-olv",
        productId: "p-002",
        size: "32x32",
        color: "Olive",
        priceCents: 12500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-24",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://verdant-style.example.com/products/fairlane-chino?size=32x32&color=olive",
        imageUrl: "/images/sample/p-002-olive.jpg",
      },
      // Intentionally out_of_stock — additional unavailability coverage.
      {
        id: "v-002-34-olv",
        productId: "p-002",
        size: "34x32",
        color: "Olive",
        priceCents: 12500,
        availability: "out_of_stock",
        estimatedDeliveryDate: "2026-08-24",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://verdant-style.example.com/products/fairlane-chino?size=34x32&color=olive",
        imageUrl: "/images/sample/p-002-olive.jpg",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // p-003 — Westerly Wool Jacket (both pools, outerwear)
  // Retailer: Northmill | Brand: Lorne & Co
  // Note: latest delivery (2026-09-02) used in deadline-miss tests.
  // -------------------------------------------------------------------------
  {
    id: "p-003",
    retailerId: "r-northmill",
    brand: "Lorne & Co",
    name: "Westerly Wool Jacket",
    category: "outerwear",
    genderPool: "both",
    variants: [
      {
        id: "v-003-sm-chr",
        productId: "p-003",
        size: "S",
        color: "Charcoal",
        priceCents: 24500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-09-02",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://northmill.example.co/products/westerly-wool-jacket?size=S&color=charcoal",
        imageUrl: "/images/sample/p-003-charcoal.jpg",
      },
      {
        id: "v-003-md-chr",
        productId: "p-003",
        size: "M",
        color: "Charcoal",
        priceCents: 24500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-09-02",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://northmill.example.co/products/westerly-wool-jacket?size=M&color=charcoal",
        imageUrl: "/images/sample/p-003-charcoal.jpg",
      },
      {
        id: "v-003-lg-chr",
        productId: "p-003",
        size: "L",
        color: "Charcoal",
        priceCents: 24500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-09-02",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://northmill.example.co/products/westerly-wool-jacket?size=L&color=charcoal",
        imageUrl: "/images/sample/p-003-charcoal.jpg",
      },
      {
        id: "v-003-sm-nvy",
        productId: "p-003",
        size: "S",
        color: "Navy",
        priceCents: 24500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-09-02",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://northmill.example.co/products/westerly-wool-jacket?size=S&color=navy",
        imageUrl: "/images/sample/p-003-navy.jpg",
      },
      {
        id: "v-003-md-nvy",
        productId: "p-003",
        size: "M",
        color: "Navy",
        priceCents: 24500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-09-02",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://northmill.example.co/products/westerly-wool-jacket?size=M&color=navy",
        imageUrl: "/images/sample/p-003-navy.jpg",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // p-004 — Elara Midi Dress (womenswear, dress)
  // Retailer: Verdant | Brand: Fairfield
  // -------------------------------------------------------------------------
  {
    id: "p-004",
    retailerId: "r-verdant",
    brand: "Fairfield",
    name: "Elara Midi Dress",
    category: "dress",
    genderPool: "womenswear",
    variants: [
      {
        id: "v-004-xs-crm",
        productId: "p-004",
        size: "XS",
        color: "Cream",
        priceCents: 17500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-20",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://verdant-style.example.com/products/elara-midi-dress?size=XS&color=cream",
        imageUrl: "/images/sample/p-004-cream.jpg",
      },
      {
        id: "v-004-sm-crm",
        productId: "p-004",
        size: "S",
        color: "Cream",
        priceCents: 17500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-20",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://verdant-style.example.com/products/elara-midi-dress?size=S&color=cream",
        imageUrl: "/images/sample/p-004-cream.jpg",
      },
      {
        id: "v-004-md-crm",
        productId: "p-004",
        size: "M",
        color: "Cream",
        priceCents: 17500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-20",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://verdant-style.example.com/products/elara-midi-dress?size=M&color=cream",
        imageUrl: "/images/sample/p-004-cream.jpg",
      },
      {
        id: "v-004-sm-sge",
        productId: "p-004",
        size: "S",
        color: "Sage",
        priceCents: 17500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-20",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://verdant-style.example.com/products/elara-midi-dress?size=S&color=sage",
        imageUrl: "/images/sample/p-004-sage.jpg",
      },
      {
        id: "v-004-md-sge",
        productId: "p-004",
        size: "M",
        color: "Sage",
        priceCents: 17500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-20",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://verdant-style.example.com/products/elara-midi-dress?size=M&color=sage",
        imageUrl: "/images/sample/p-004-sage.jpg",
      },
      // Intentionally out_of_stock — additional unavailability coverage.
      {
        id: "v-004-lg-sge",
        productId: "p-004",
        size: "L",
        color: "Sage",
        priceCents: 17500,
        availability: "out_of_stock",
        estimatedDeliveryDate: "2026-08-20",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://verdant-style.example.com/products/elara-midi-dress?size=L&color=sage",
        imageUrl: "/images/sample/p-004-sage.jpg",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // p-005 — Cascade Derby Shoe (both pools, shoes)
  // Retailer: Northmill | Brand: Halcyon
  // -------------------------------------------------------------------------
  {
    id: "p-005",
    retailerId: "r-northmill",
    brand: "Halcyon",
    name: "Cascade Derby Shoe",
    category: "shoes",
    genderPool: "both",
    variants: [
      {
        id: "v-005-8-tan",
        productId: "p-005",
        size: "8 US",
        color: "Tan",
        priceCents: 18500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-26",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://northmill.example.co/products/cascade-derby-shoe?size=8&color=tan",
        imageUrl: "/images/sample/p-005-tan.jpg",
      },
      {
        id: "v-005-9-tan",
        productId: "p-005",
        size: "9 US",
        color: "Tan",
        priceCents: 18500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-26",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://northmill.example.co/products/cascade-derby-shoe?size=9&color=tan",
        imageUrl: "/images/sample/p-005-tan.jpg",
      },
      {
        id: "v-005-10-tan",
        productId: "p-005",
        size: "10 US",
        color: "Tan",
        priceCents: 18500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-26",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://northmill.example.co/products/cascade-derby-shoe?size=10&color=tan",
        imageUrl: "/images/sample/p-005-tan.jpg",
      },
      {
        id: "v-005-9-blk",
        productId: "p-005",
        size: "9 US",
        color: "Black",
        priceCents: 18500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-26",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://northmill.example.co/products/cascade-derby-shoe?size=9&color=black",
        imageUrl: "/images/sample/p-005-black.jpg",
      },
      {
        id: "v-005-10-blk",
        productId: "p-005",
        size: "10 US",
        color: "Black",
        priceCents: 18500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-26",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://northmill.example.co/products/cascade-derby-shoe?size=10&color=black",
        imageUrl: "/images/sample/p-005-black.jpg",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // p-006 — Verdant Silk Blouse (womenswear, top)
  // Retailer: Verdant | Brand: Fairfield
  // -------------------------------------------------------------------------
  {
    id: "p-006",
    retailerId: "r-verdant",
    brand: "Fairfield",
    name: "Verdant Silk Blouse",
    category: "top",
    genderPool: "womenswear",
    variants: [
      {
        id: "v-006-xs-wht",
        productId: "p-006",
        size: "XS",
        color: "White",
        priceCents: 14500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-21",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://verdant-style.example.com/products/verdant-silk-blouse?size=XS&color=white",
        imageUrl: "/images/sample/p-006-white.jpg",
      },
      {
        id: "v-006-sm-wht",
        productId: "p-006",
        size: "S",
        color: "White",
        priceCents: 14500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-21",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://verdant-style.example.com/products/verdant-silk-blouse?size=S&color=white",
        imageUrl: "/images/sample/p-006-white.jpg",
      },
      {
        id: "v-006-sm-blh",
        productId: "p-006",
        size: "S",
        color: "Blush",
        priceCents: 14500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-21",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://verdant-style.example.com/products/verdant-silk-blouse?size=S&color=blush",
        imageUrl: "/images/sample/p-006-blush.jpg",
      },
      {
        id: "v-006-md-blh",
        productId: "p-006",
        size: "M",
        color: "Blush",
        priceCents: 14500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-21",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://verdant-style.example.com/products/verdant-silk-blouse?size=M&color=blush",
        imageUrl: "/images/sample/p-006-blush.jpg",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // p-007 — Marlo Canvas Tote (both pools, accessory)
  // Retailer: Northmill | Brand: Halcyon
  // Earliest delivery in the catalog (2026-08-19) — used in delivery tests.
  // -------------------------------------------------------------------------
  {
    id: "p-007",
    retailerId: "r-northmill",
    brand: "Halcyon",
    name: "Marlo Canvas Tote",
    category: "accessory",
    genderPool: "both",
    variants: [
      {
        id: "v-007-os-nat",
        productId: "p-007",
        size: "One Size",
        color: "Natural",
        priceCents: 6500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-19",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://northmill.example.co/products/marlo-canvas-tote?color=natural",
        imageUrl: "/images/sample/p-007-natural.jpg",
      },
      {
        id: "v-007-os-slt",
        productId: "p-007",
        size: "One Size",
        color: "Slate",
        priceCents: 6500,
        availability: "in_stock",
        estimatedDeliveryDate: "2026-08-19",
        lastChecked: "2026-08-13T10:00:00Z",
        productUrl:
          "https://northmill.example.co/products/marlo-canvas-tote?color=slate",
        imageUrl: "/images/sample/p-007-slate.jpg",
      },
    ],
  },
];

/** Pre-built variant map for the full sample catalog. */
export const SAMPLE_VARIANT_MAP: Map<string, ProductVariant> =
  buildVariantMap(SAMPLE_PRODUCTS);
