# Arrival Product Specification

**Version:** 0.4  
**Status:** Pre-development  
**Last updated:** 2026-08-18  
**Authority:** This document is the canonical product specification for Arrival. It overrides older notes, chat summaries, prototypes, and coding prompts when they conflict.

## 0. How to use this document

Every feature in this specification has one status:

| Status | Meaning |
|---|---|
| `BINDING_MVP` | Must work for the private beta to count as complete. |
| `NORTH_STAR` | Arrival should be architected toward this, but it must not be built or claimed as current MVP functionality. |
| `UNRESOLVED` | No implementation tool may silently choose a permanent answer. Use a documented temporary assumption or ask for a decision. |
| `OUT_OF_SCOPE` | Do not implement during the MVP. |

Instructions for AI coding tools:

1. Read this file in full before making changes.
2. Preserve all `BINDING_MVP` requirements and acceptance criteria.
3. Do not implement a `NORTH_STAR` unless a later task explicitly promotes it into the MVP.
4. Do not silently resolve an `UNRESOLVED` decision.
5. Do not implement an `OUT_OF_SCOPE` feature.
6. Inspect the repository before editing and extend the existing architecture rather than recreating the application.
7. When a new product decision is made, update this specification before or alongside the implementation.

---

## 1. Product definition

### 1.1 What Arrival is

Arrival is an occasion-based, outfit-level shopping web application. A user tells Arrival what they are shopping for, the maximum total outfit budget, and when they need it. Arrival returns a limited, coherent ensemble built from real products and lets the user explore compatible alternatives without reconstructing the outfit manually.

Arrival is not primarily a retailer search engine or an open-ended styling chatbot. Its core intelligence is constraint resolution:

> A normal retailer lets the user browse categories. Arrival manages the relationships between them.

Those relationships include:

- The occasion and contextual brief
- The user's learned aesthetic
- The user's sizing and gender-based product preferences
- Compatibility among every piece in the ensemble
- The hard total-outfit budget
- Product and variant availability
- The required delivery date

### 1.2 Core problem

Shoppers often know the context they need clothing for but struggle to translate that need into a complete outfit that fits their body, taste, budget, quality expectations, and deadline. They spend substantial time searching across disconnected retailers, assessing uncertain sizing, and determining whether individually appealing pieces work together.

Arrival compresses that process into a small set of relevant, outfit-level choices.

### 1.3 Initial research basis

The initial research contained 26 survey responses about clothing purchases for specific events. Some questions were added after collection began, so not every respondent answered every question.

Recurring signals included:

- Poor relevance or personalization: approximately 13 of 26
- Fit and sizing difficulty: approximately 10 of 26
- Insufficient confidence in product information: approximately 7 of 26
- In-store friction: approximately 7 of 26
- Price or value concerns: approximately 6 of 26
- Significant time spent shopping: 16 of 26

The research supports further testing of context-sensitive, outfit-level shopping. It does **not** by itself validate:

- Demand for Arrival specifically
- Willingness to pay
- AI as a customer-facing selling point
- Rental or resale functionality
- Switching away from existing shopping habits

### 1.4 MVP purpose

The free private beta must test whether users:

- Complete the setup and Wishbone process
- Submit real shopping requests
- Find generated outfits relevant and coherent
- Use compatible alternatives rather than abandoning the experience
- Save and share outfits
- Begin prepared or guided checkout
- Self-report completed retailer purchases
- Return to Arrival for another shopping need

The MVP is successful when it proves user value and produces behavioral evidence for refinement. It is not required to prove monetization or autonomous purchasing.

### 1.5 Current project state

As of this version:

- The GitHub repository is the canonical codebase.
- A Next.js 16 application foundation exists with TypeScript, Tailwind CSS v4, ESLint, and Vitest.
- The repository contains a minimal placeholder landing screen confirming the app is running. No substantive Arrival product interface has been built.
- Lint, tests, and the production build pass.
- No database, authentication, retailer product data, recommendation system, checkout integration, or deployment exists yet.

---

## 2. Binding MVP requirements

### 2.1 Account creation and setup

#### MVP-ONB-001: One-time setup

**Status:** `BINDING_MVP`

Arrival must provide a one-time setup designed to take no more than three minutes.

The setup must collect:

- Email
- Password
- Full name
- Phone number
- Shipping address:
  - Address line 1
  - Address line 2, optional
  - City
  - State or province
  - ZIP or postal code
  - Country
- Gender-based product preference:
  - Menswear
  - Womenswear
  - Both
- Height, as separate Feet and Inches numeric fields
- Weight in pounds (optional)
- A reference brand the user already shops
- Whether the reference brand uses a letter-size or numeric-size system
- The user's size in that reference brand (letter selected from a dropdown; numeric entered as a number)
- Top size, selected from a letter-size dropdown (XXS–XXXL; no default selection)
- Waist and inseam as separate inch-measurement numeric fields
- Shoe size(s) in US sizing, selected from a dropdown (3–18 in half-size increments):
  - Menswear: men's US shoe size
  - Womenswear: women's US shoe size
  - Both: men's US shoe size and women's US shoe size, collected separately

Helper copy for delivery information:

> Used to prepare retailer checkouts. Arrival never completes a purchase without your review.

**Acceptance criteria**

- A user cannot complete setup without a valid phone number and shipping address.
- Address line 2 remains optional.
- Payment information is not requested or stored.
- Gender identity is not used as a substitute for product preference.
- Menswear, womenswear, or both controls which product pools Arrival may recommend.
- Height is collected as separate Feet and Inches numeric fields. Inches must be a whole number from 0 to 11.
- Weight is optional; an empty weight field does not block progression.
- Top size is selected from a letter-size dropdown (XXS–XXXL); no size is pre-selected.
- Waist and inseam are collected as separate numeric fields measured in inches.
- Shoe size(s) are selected from a US-size dropdown (3–18 in half-size increments). Menswear collects men's US shoe size; Womenswear collects women's US shoe size; Both collects both separately. No shoe size is pre-selected.
- The user can later edit all contact, delivery, sizing, and product-preference information in Account.

#### MVP-ONB-002: Wishbone taste learning

**Status:** `BINDING_MVP`

After profile collection, Arrival must run a short, gamified Wishbone-style taste-learning flow.

- The flow contains three to four this-or-that rounds.
- Each round presents a pair of outfit images.
- The imagery should represent meaningful aesthetic differences and infer a baseline style profile.
- Product preference controls whether the flow shows menswear, womenswear, or both.
- Suitable imagery may be generated, editorial, or properly licensed.
- The MVP must not depend on live Pinterest access.
- The flow ends with a brief, friendly confirmation that setup is complete.
- “Perfect! You’re all set” is an example of the intended tone, not required interface copy.

The initial aesthetic dimensions may include:

- Restrained to expressive
- Tailored to relaxed
- Clean to textured
- Classic to directional

These dimensions are implementation guidance, not immutable customer-facing labels.

**Acceptance criteria**

- Wishbone is hidden after successful completion unless the user deliberately elects to revisit taste settings in a future implementation.
- The selected images produce a stored baseline taste profile.
- The full initial setup, including Wishbone, is optimized for completion in three minutes or less.
- Main application navigation remains hidden until setup and Wishbone are complete.

### 2.2 Persistent application navigation

#### MVP-NAV-001: Three-item bottom navigation

**Status:** `BINDING_MVP`

After setup and Wishbone are complete, every main in-app page must show a minimal persistent bottom navigation containing exactly:

1. **Saved Outfits**
2. **Home**
3. **Account**

Each item must use a small icon, a text label, and a subtle active state.

**Destinations**

- **Saved Outfits:** Saved ensembles, sharing, and checkout re-entry
- **Home:** The main three-field shopping request
- **Account:** Contact information, delivery address, sizing data, and gender-based product preferences

**Acceptance criteria**

- No fourth primary navigation item is introduced during the MVP.
- The navigation is absent during initial setup and Wishbone.
- Home always returns the user to a fresh shopping-request entry point.

### 2.3 Home and shopping request

#### MVP-REQ-001: Three-field shopping intake

**Status:** `BINDING_MVP`

Home must contain exactly three primary fields:

1. **What are you shopping for?**
2. **Total outfit budget**
3. **Need it by**

Rules:

- “What are you shopping for?” accepts a natural-language occasion or contextual brief.
- Arrival may request more detail when the brief lacks enough context to generate a relevant outfit.
- The total outfit budget is a hard maximum for the full ensemble, not a per-item suggestion.
- “Need it by” is a delivery deadline.
- An outfit is eligible only when its longest estimated item-delivery time meets the deadline.

**Acceptance criteria**

- The system cannot return an ensemble whose expected total exceeds the submitted budget.
- The system cannot present an ensemble as deadline-eligible when any required item is expected after the submitted date.
- Clarification is limited to missing context; Arrival does not turn the request into a long conversational interview.

### 2.4 Product data

#### MVP-DAT-001: Real, normalized product catalog

**Status:** `BINDING_MVP`

Recommendations must be generated from a normalized catalog of real products. For the MVP, Arrival may collect product records from the public listings of a deliberately small number of multibrand retailers and from public product APIs where available. This collection must occur through a controlled background pipeline; the user-facing app queries the stored catalog rather than scraping retailers during an outfit-generation request.

The catalog must support, at minimum:

- Retailer
- Brand
- Product name
- Category
- Product URL
- Image
- Current price
- Color
- Available size variants
- Availability status
- Delivery estimate or sufficient data to calculate one
- Last checked timestamp

For products collected from public retailer listings, the catalog pipeline may also collect the public product-image URLs and associated image metadata needed to display those products in Arrival. Product photos should come from the selected retailer's public listing or public API unless another authorized source is documented. Arrival does not need to photograph products or generate substitute product imagery.

**Acceptance criteria**

- Catalog collection and refresh run separately from the user request.
- Stale or unavailable variants are not knowingly presented as purchasable.
- The MVP begins with a deliberately limited product set sourced from a small number of multibrand retailers.
- Scheduled extraction from public product listings and ingestion from public APIs are explicitly in scope for the MVP.
- Extraction and image use must be reviewed retailer by retailer and respect applicable law, access controls, and documented usage constraints.
- The pipeline must not bypass authentication, CAPTCHAs, paywalls, or other technical access controls.
- Product records are normalized before entering the recommendation system.

### 2.5 Outfit generation and constraint resolution

#### MVP-OUT-001: Coherent ensemble generation

**Status:** `BINDING_MVP`

Arrival must generate a complete outfit appropriate to the user's brief. The outfit must be treated as an ensemble, not as unrelated category search results.

Every generated ensemble must satisfy:

- Occasion and contextual relevance
- Baseline Wishbone taste profile
- Gender-based product preference
- Known sizing constraints
- Aesthetic compatibility among pieces
- Hard total-outfit budget
- Availability of the selected variants
- Delivery by the requested deadline

The number and type of item categories may vary with the shopping request. Arrival must not force the same garment template onto every occasion.

Each selected product must show enough information for an informed decision:

- Product image
- Brand and product name
- Retailer
- Selected color and size
- Price
- Estimated delivery
- Link to the retailer product page

**Acceptance criteria**

- The displayed outfit total equals the sum of its current item prices.
- Each item includes a compatible, available variant for the user's profile.
- The outfit contains no known deadline or budget violation.
- Recommendation explanations, if shown, remain concise and grounded in the user's brief and profile.

#### MVP-OUT-002: Curated compatible alternatives

**Status:** `BINDING_MVP`

Arrival must let the user change individual outfit pieces without returning them to an unrestricted catalog.

Rules:

- Each swappable category may show no more than four alternatives at a time.
- Alternatives must be curated for compatibility with the rest of the current ensemble.
- When the user changes one piece, Arrival must recalculate:
  - Ensemble compatibility
  - Total price
  - Budget eligibility
  - Variant availability
  - Delivery eligibility
- A selection that creates a known budget or deadline violation must not be represented as valid.
- The interface should make the interplay among pieces feel immediate and controlled.

Binding product principle:

> Arrival is a constraint-resolution system with Sudoku-like interplay among pieces, aesthetic coherence, and budget.

**Acceptance criteria**

- Users never face an unbounded product grid within the mix-and-match flow.
- No category displays more than four alternatives at once.
- The total and eligibility state update after every item change.
- Alternatives are filtered in relation to the current ensemble, not ranked independently.

### 2.6 Saving and sharing

#### MVP-SAV-001: Saved outfits

**Status:** `BINDING_MVP`

Users must be able to save an outfit before purchasing it. A saved outfit is paused shopping intent, not a static inspiration image.

From a saved outfit, the user can:

- Review the full ensemble
- Share it outside Arrival
- Continue to checkout using the same flow offered immediately after generation

Before checkout from a saved outfit, Arrival must revalidate:

- Price
- Availability
- Selected size and color
- Delivery eligibility

**Acceptance criteria**

- Saving preserves the ensemble, item selections, and request context.
- A saved outfit can enter prepared or guided checkout without being regenerated first.
- Invalidated items are clearly flagged before checkout.
- A fully completed outfit may transition from `saved` to `purchased`.

#### MVP-SAV-002: External sharing

**Status:** `BINDING_MVP`

Saved outfits must be shareable outside the app through:

- Messages
- Social-network sharing where supported by the device
- A shareable link

**Acceptance criteria**

- A recipient can view the shared outfit without receiving the owner's private account, sizing, contact, or delivery data.
- Sharing does not expose private checkout-session information.

### 2.7 Checkout

#### MVP-CHK-001: Retailer remains merchant of record

**Status:** `BINDING_MVP`

Arrival organizes the purchase journey, while each retailer securely processes its own checkout on its own website.

The user may approve the ensemble as one shopping decision, but the MVP does not claim that one payment completes purchases at unrelated retailers.

**Acceptance criteria**

- Arrival does not charge the user for merchandise.
- Arrival does not distribute merchandise proceeds to retailers.
- Arrival does not become the seller or merchant of record.
- The user completes final review and payment on each retailer's website.

#### MVP-CHK-002: Organized retailer sequence

**Status:** `BINDING_MVP`

When an ensemble contains products from multiple retailers, Arrival must organize the checkouts into a single sequence.

Before each retailer handoff, Arrival presents:

- Retailer name
- Sequence position, such as “Checkout 1 of 3”
- Exact products
- Selected colors and sizes
- Expected subtotal
- Expected delivery

The retailer site should open while preserving the Arrival session so the user can return and continue.

Arrival does not repeatedly prompt the user to restate choices or substitution rules. Exact product, color, and size selections are already established and treated as locked.

**Acceptance criteria**

- Retailer orders are grouped by retailer.
- The current and remaining retailer steps remain visible in Arrival.
- Material changes in price, availability, or delivery are surfaced before continuation.
- Arrival does not substitute products, colors, sizes, shipping methods, or remaining items without explicit user action.

#### MVP-CHK-003: Prepared checkout with guided fallback

**Status:** `BINDING_MVP`

Arrival must attempt prepared checkout whenever technically permitted and fall back to guided checkout when preparation is unavailable or fails.

**Prepared checkout**

- Adds the exact selected product variants to the retailer cart
- Prefills the user's authorized contact and delivery information
- Selects an appropriate standard shipping option that meets the deadline when technically safe
- Stops before final payment
- Sends the user to the retailer to review and pay

Prepared-checkout call to action:

> Review and pay on [Retailer]

**Guided checkout**

- Presents the exact products, variants, expected prices, and delivery information
- Opens the appropriate retailer product or cart pages
- Lets the user complete steps Arrival cannot prepare
- Does not imply that a cart or form has been prepared when it has not

**Acceptance criteria**

- Every retailer checkout step records `prepared` or `guided`.
- A failed or unavailable prepared checkout transitions visibly and gracefully to guided checkout.
- Prepared checkout uses the user's saved delivery information only with their permission.
- Arrival stops before payment.
- Arrival never collects, enters, transmits, or stores a raw card number or retailer payment credential.
- Existing retailer login, CAPTCHA, SMS verification, or validation requirements are allowed to interrupt automation safely.

#### MVP-CHK-004: Customer-confirmed purchase

**Status:** `BINDING_MVP`

After returning from each retailer, the user must be able to select:

> I completed the purchase

This action:

- Marks the retailer step complete
- Advances the user to the next retailer checkout
- Updates the ensemble's purchase progress
- Creates an MVP-level self-reported conversion signal

Internally, this state is `user_confirmed_purchase`, not a verified retailer transaction.

**Acceptance criteria**

- Arrival never represents self-reporting as retailer-verified payment.
- The outfit becomes `purchased` only after all required retailer steps are user-confirmed.
- Partial completion remains visible if only some retailer orders are confirmed.

### 2.8 Account

#### MVP-ACC-001: Editable profile

**Status:** `BINDING_MVP`

Account must let the user edit:

- Full name
- Email
- Phone number
- Shipping address
- Height (feet and inches) and weight (optional, in pounds)
- Reference brand and its letter or numeric size
- Top size (letter-size dropdown), waist and inseam (numeric, in inches), and shoe size(s) (US-size dropdown, conditional on product preference)
- Menswear, womenswear, or both product preference

**Acceptance criteria**

- Updates affect future recommendations and checkout preparation.
- Payment information is not part of Account.
- Private profile data is not exposed through shared outfits.

### 2.9 Beta access and analytics

#### MVP-BET-001: Free private beta

**Status:** `BINDING_MVP`

The MVP is free for:

- Beta testers
- User research and product validation
- Live demos
- Pitch presentations

There is no subscription screen, paywall, Arrival transaction fee, or charge for using the beta. Users pay retailers directly for merchandise they elect to purchase.

#### MVP-BET-002: Behavioral instrumentation

**Status:** `BINDING_MVP`

The MVP must measure:

- Setup starts and completions
- Wishbone completions
- Shopping requests submitted
- Outfits generated
- Alternative-item interactions
- Outfits saved
- Outfit shares
- Checkout starts
- Prepared versus guided checkout use
- User-confirmed retailer purchases
- Fully user-confirmed purchased outfits
- Repeat usage
- Feature-value or willingness-to-pay feedback when explicitly requested from the user

**Acceptance criteria**

- Self-reported purchase events remain distinguishable from verified transactions.
- Analytics do not require storing payment credentials.
- Instrumentation supports funnel analysis without exposing private user data unnecessarily.

### 2.10 Security and privacy

#### MVP-SEC-001: Data boundaries

**Status:** `BINDING_MVP`

- Secret API keys must remain server-side and must never be committed to GitHub or exposed in browser code.
- Delivery and contact information may be used only for account functionality and authorized checkout preparation.
- Arrival must never give an LLM access to a raw credit-card number.
- Arrival must never complete a purchase without the user's final retailer-side review and payment.
- Shared outfits must exclude private account and delivery information.
- Checkout automation must use deterministic, retailer-specific controls rather than unconstrained autonomous purchasing.

---

## 3. Core user journeys

### 3.1 New user to completed setup

1. User creates an account with email and password.
2. User supplies sizing, fit, product-preference, contact, and delivery information.
3. User completes three to four Wishbone comparisons.
4. Arrival stores the baseline taste profile.
5. Arrival displays a brief, friendly setup-complete confirmation.
6. Arrival reveals the three-item bottom navigation and opens Home.

### 3.2 Shopping request to generated ensemble

1. User describes what they are shopping for.
2. User enters a hard total-outfit budget.
3. User selects “Need it by.”
4. Arrival asks for more context only if the brief is insufficient.
5. Arrival searches the normalized product catalog.
6. Arrival resolves occasion, taste, fit, compatibility, price, availability, and delivery constraints.
7. Arrival presents a coherent outfit.

### 3.3 Outfit exploration

1. User selects a category or piece to change.
2. Arrival presents no more than four compatible alternatives.
3. User selects an alternative.
4. Arrival updates the outfit, total, compatibility, availability, and delivery eligibility.
5. User saves the outfit or proceeds to checkout.

### 3.4 Outfit to checkout

1. Arrival revalidates all items and variants.
2. Arrival groups items by retailer.
3. Arrival presents the ordered checkout itinerary.
4. For each retailer, Arrival attempts prepared checkout.
5. When preparation is unavailable or fails, Arrival uses guided checkout.
6. User reviews and pays on the retailer's website.
7. User returns to Arrival and selects “I completed the purchase.”
8. Arrival advances to the next retailer.
9. After every step is confirmed, Arrival marks the outfit `purchased`.

### 3.5 Saved outfit to checkout

1. User opens Saved Outfits.
2. User selects an outfit.
3. Arrival revalidates price, availability, selected variants, and delivery.
4. User replaces invalid items if necessary.
5. User enters the identical prepared/guided checkout flow.

---

## 4. Business rules and data definitions

| Term | Definition |
|---|---|
| **Shopping request** | The user's contextual brief, hard total-outfit budget, and need-by date. |
| **Product** | A normalized retailer product independent of a specific size/color selection. |
| **Variant** | A specific product color and size with its own availability. |
| **Outfit / ensemble** | A set of mutually compatible product variants produced for one shopping request. The terms are equivalent in the MVP. |
| **Alternative** | One of no more than four products offered as a compatible replacement for a current outfit category. |
| **Eligible outfit** | An outfit within budget whose required variants are available and whose slowest delivery estimate meets the deadline. |
| **Saved outfit** | A persisted ensemble that can be shared, revalidated, changed, or taken to checkout. |
| **Prepared checkout** | Arrival adds exact variants and permitted non-payment information, then stops before retailer review and payment. |
| **Guided checkout** | Arrival presents locked selections and opens the appropriate retailer pages when it cannot prepare the checkout. |
| **Checkout session** | The ordered collection of retailer checkout steps for an outfit. |
| **User-confirmed purchase** | The user's statement that a retailer checkout was completed; not retailer-verified. |
| **Purchased outfit** | An outfit for which all required retailer steps have been user-confirmed. |

### 4.1 Budget rule

The submitted budget applies to the complete outfit. The displayed item prices and total must remain consistent. Tax and shipping treatment is unresolved in `UNR-004`; until resolved, the interface must clearly state what the displayed total includes.

### 4.2 Delivery rule

The relevant ensemble delivery estimate is the latest expected delivery among its required items. Every required item must be expected by the user's deadline.

### 4.3 No silent substitution

Arrival may not silently change:

- Product
- Color
- Size
- Retailer
- Shipping method
- Price tolerance
- Whether to purchase remaining pieces after a partial failure

Any material change requires visible user action.

---

## 5. Technical architecture

### 5.1 Architecture status

The architecture below is the accepted starting plan for the MVP. Product behavior in Section 2 is binding; individual vendors may be changed later if a documented decision preserves that behavior.

### 5.2 Canonical systems

| Concern | Starting choice |
|---|---|
| Code ownership and version history | One GitHub repository |
| Frontend foundation | Next.js interface, with v0 available as a focused UI-design tool |
| Primary full-stack AI coding environment | Replit Agent working from the GitHub repository |
| Authentication and persistent database | Supabase/Postgres |
| Catalog extraction | Apify using Python/JavaScript scraping tools such as Scrapy or Crawlee |
| Catalog refresh | Scheduled background jobs, separate from customer requests |
| Recommendation and compatibility logic | Arrival backend |
| Prepared checkout | Retailer-specific Playwright automation, potentially hosted with Browserbase |
| Hosting | Replit or Vercel, to be finalized |

### 5.3 Integration principle

These tools do not create separate versions of Arrival:

- GitHub is the single source of truth for code.
- v0 may create or refine interface components, which must be incorporated into the repository.
- Replit Agent edits and integrates the canonical repository.
- Supabase stores durable application data.
- Apify or an equivalent worker refreshes normalized product data.
- Checkout adapters prepare supported retailer sessions.
- The user experiences one Arrival web application.

### 5.4 Service flow

1. Scheduled extraction collects retailer products.
2. The pipeline normalizes products and variants into the database.
3. The Arrival backend searches the normalized catalog.
4. The constraint system composes eligible outfits.
5. The frontend displays and updates the ensemble.
6. A retailer-specific adapter attempts prepared checkout.
7. Arrival falls back to guided checkout when required.
8. The retailer processes final payment.

### 5.5 Initial data model

The initial schema should support:

| Entity | Purpose |
|---|---|
| `users` | Account identity |
| `delivery_profiles` | Name, phone, and shipping address |
| `size_profiles` | Body and brand-reference sizing data |
| `product_preferences` | Menswear, womenswear, or both |
| `wishbone_profiles` | Learned baseline taste attributes |
| `products` | Normalized retailer products |
| `product_variants` | Color, size, availability, and delivery data |
| `shopping_requests` | Brief, budget, and deadline |
| `outfits` | Generated, saved, and purchased ensembles |
| `outfit_items` | Selected variants within each outfit |
| `checkout_sessions` | Multi-retailer purchase sequences |
| `checkout_steps` | Prepared or guided retailer steps |
| `purchase_confirmations` | User-confirmed completion events |
| `analytics_events` | Beta funnel and interaction events |

### 5.6 Environment variables

Private credentials must be stored as server-side environment variables. Likely variables include:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
APIFY_API_TOKEN
BROWSERBASE_API_KEY
```

Actual names may change with implementation. Service-role or automation secrets must never enter client-side code.

---

## 6. Future north stars

### NS-001: Agentic one-confirmation purchasing

**Status:** `NORTH_STAR`

One authenticated user approval triggers multiple secure retailer purchases while each retailer remains merchant of record.

The intended architecture uses permissioned, tightly scoped agentic payment credentials or participating checkout protocols. Arrival must not expose raw card data to an LLM or collect the full ensemble payment itself.

This may be described in a future pitch as a goal. It must not be represented as MVP functionality.

### NS-002: Retailer and affiliate partnerships

**Status:** `NORTH_STAR`

As Arrival demonstrates traction, it should pursue:

- Authorized retailer catalog feeds
- Affiliate programs and tracked links
- More reliable cart construction
- Direct availability and delivery data
- Retailer-reported conversion

Safeguards:

- Affiliate status never determines aesthetic ranking.
- Sponsored placement is clearly identified.
- The user is never charged more because of an affiliate relationship.
- Arrival may recommend a superior non-affiliate item.
- Commissions are disclosed.

### NS-003: Direct transaction verification

**Status:** `NORTH_STAR`

Affiliate reporting, retailer APIs, or participating checkout protocols should eventually replace `user_confirmed_purchase` with verified transaction status.

### NS-004: Public-launch monetization

**Status:** `NORTH_STAR`

Monetization begins only after the private beta demonstrates reliable value and repeat use. The leading model is a subscription or membership aligned with the shopper rather than a merchandise transaction surcharge.

The exact model and price must be informed by beta behavior. Between-purchase value may eventually include:

- Persistent wardrobe or shopping history
- Ongoing taste learning
- Reusable ensembles
- Availability or price monitoring
- Recurring shopping support

Affiliate revenue may remain supplemental and must not distort recommendations.

### NS-005: Broader retailer checkout support

**Status:** `NORTH_STAR`

Prepared checkout should expand retailer by retailer through maintained adapters, authorized APIs, shared cart protocols, or agentic checkout infrastructure. The architecture should support multiple fulfillment modes:

- `retailer_link`
- `prepared_cart`
- `retailer_api`
- `agentic_checkout`

---

## 7. Decisions still unresolved

| ID | Question | Current possibilities | Blocks MVP? | Decision point |
|---|---|---|---|---|
| `UNR-001` | Who is the narrow initial beta target? | Broad occasion shoppers; college-age shoppers; another defined early segment | Yes, for recruitment and messaging | Before beta recruitment |
| `UNR-002` | Which retailer and categories seed the first live catalog? | One multibrand retailer and a deliberately limited category set | Yes, for catalog implementation | Before product-pipeline milestone |
| `UNR-003` | How many complete starting ensembles should one request return? | One primary ensemble; a small set of complete ensembles | Yes, for results-page design | Before results UI |
| `UNR-004` | Does the hard budget include estimated tax and shipping? | Merchandise subtotal only; estimated landed total | Yes, for eligibility calculations | Before recommendation logic |
| `UNR-005` | Which retailer receives the first prepared-checkout adapter? | Choose based on technical permission, checkout stability, and catalog relevance | Yes, for prepared checkout | After guided checkout works |
| `UNR-006` | What is the exact recommendation implementation? | Deterministic filters plus scoring; LLM-assisted ranking; hybrid | Yes, for outfit generation | Before recommendation engine |
| `UNR-007` | Which approved in-scope collection method should be used for each initial retailer? | Scheduled extraction from public listings; public API; authorized feed; third-party extraction service | Yes, retailer by retailer | Before ingesting live data |
| `UNR-008` | Which hosting provider serves the beta? | Replit; Vercel | No, until deployment | Before first external beta |
| `UNR-009` | What visual identity and component system govern Arrival? | To be defined through the initial frontend design process | Yes, for polished UI | Before frontend build |
| `UNR-010` | Can users retake or manually refine Wishbone after setup? | Retake flow; editable taste controls; neither during MVP | No | Before Account is finalized |
| `UNR-011` | What sharing preview and permissions should a shareable outfit link use? | Public unlisted link; expiring link; link with owner controls | Yes, for external sharing | Before sharing implementation |
| `UNR-012` | What public-launch pricing structure will Arrival use? | Monthly membership; annual membership; occasion pass; hybrid | No | After beta evidence |

No coding tool may permanently resolve these decisions without an explicit specification update.

---

## 8. Explicitly out of scope for the MVP

### 8.1 Payment and commerce

**Status:** `OUT_OF_SCOPE`

- One payment confirmation that purchases from arbitrary unrelated retailers
- Fully autonomous live purchasing
- Raw payment-card storage or entry by an LLM
- Arrival collecting the ensemble total and distributing proceeds
- Arrival acting as merchant of record
- Stripe Connect marketplace settlement merely to simulate unified checkout
- Arrival merchandise transaction surcharges
- Automatic substitutions or acceptance of price increases
- Assuming Apple Pay can be collected once and replayed across retailer websites

### 8.2 Monetization

**Status:** `OUT_OF_SCOPE`

- Subscription screen
- Paywall
- Paid beta access
- Final public pricing
- Recommendation ranking influenced by commission

### 8.3 Data and integrations

**Status:** `OUT_OF_SCOPE`

- Scraping a retailer live in response to a user selecting Generate
- Broad, indiscriminate crawling beyond the deliberately selected MVP retailers and product categories
- Extraction that bypasses authentication, CAPTCHAs, paywalls, or other technical access controls
- Supporting every retailer at launch
- Claiming every retailer supports prepared checkout
- Treating `user_confirmed_purchase` as verified conversion
- Depending on a live Pinterest integration for Wishbone
- Premature direct retailer integrations without access

This section does not prohibit the controlled, scheduled collection of public product listings, including public product-image URLs and metadata, from the small number of multibrand retailers selected for the MVP. It also does not prohibit use of public product APIs. Those methods are explicitly in scope under `MVP-DAT-001`.

### 8.4 Product expansion

**Status:** `OUT_OF_SCOPE`

- Rental marketplace
- Resale marketplace
- In-store occupancy, lines, or fitting-room tools
- An unbounded general shopping search engine
- A chat-heavy stylist flow that repeatedly asks users to restate established preferences
- A separate independent v0 app, Replit app, and downloaded ZIP maintained as competing versions

---

## 9. Build sequence

### Milestone 0: Canonical foundation

- Create the GitHub repository.
- Add this specification at `/docs/ARRIVAL_PRODUCT_SPEC.md`.
- Establish contribution, environment-variable, and migration conventions.

**Complete when:** The repository is the single source of truth and every coding prompt references this specification.

### Milestone 1: Interface with controlled sample data

- Establish Arrival's visual system.
- Build account creation and setup.
- Build Wishbone.
- Build Home, Saved Outfits, Account, and persistent bottom navigation.
- Build the outfit and compatible-alternative interface using controlled sample products.

**Complete when:** A test user can complete the entire pre-checkout journey with sample data.

### Milestone 2: Persistence

- Add Supabase authentication and the initial schema.
- Persist delivery, sizing, preference, Wishbone, request, outfit, and saved-outfit data.
- Enforce user-level data access.

**Complete when:** A returning user can retrieve and edit their profile and saved outfits.

### Milestone 3: Controlled live catalog

- Select one retailer and limited category set.
- Build scheduled extraction and normalization.
- Track variants, availability, delivery data, and last-checked time.
- Remove or invalidate stale products safely.

**Complete when:** The app can reliably query a maintained catalog without scraping during the user request.

### Milestone 4: Recommendation and constraint system

- Implement brief interpretation.
- Apply profile, fit, budget, availability, and delivery constraints.
- Generate coherent ensembles.
- Implement no-more-than-four compatible alternatives per category.
- Recalculate total and eligibility after changes.

**Complete when:** Generated and modified outfits remain within all hard constraints in automated and manual tests.

### Milestone 5: Guided checkout

- Group items by retailer.
- Build the sequential checkout itinerary.
- Present locked selections.
- Open the correct retailer pages.
- Implement “I completed the purchase.”
- Persist partial and full completion status.

**Complete when:** A user can move through a multi-retailer guided sequence and Arrival records self-reported completion accurately.

### Milestone 6: First prepared-checkout adapter

- Select one technically permitted retailer.
- Add exact variants to cart.
- Prefill permitted contact and delivery fields.
- Stop before payment.
- Recheck price, availability, and delivery.
- Fall back gracefully to guided checkout.

**Complete when:** The supported retailer works reliably in tested scenarios and every failure preserves a usable guided path.

### Milestone 7: Private beta readiness

- Add required analytics.
- Test privacy and access controls.
- Test responsive design and critical failure states.
- Seed realistic data.
- Prepare feedback collection and demo accounts.

**Complete when:** Beta testers can complete the full journey for free without unsupported claims or payment-risk exposure.

---

## 10. Decision log

| Date | Decision | Reason | Supersedes |
|---|---|---|---|
| 2026-07-28 | Position Arrival as context-sensitive, outfit-level constraint resolution. | Research points to relevance, fit, information, price, and time friction; managing relationships among pieces is the differentiated value. | Category-browser and generic stylist concepts |
| 2026-07-28 | Use a one-time setup of no more than three minutes, followed by three to four Wishbone comparisons. | Establishes fit and taste without repeating a long intake for every request. | Repeated taste interrogation during shopping |
| 2026-07-28 | Limit Home to the brief, hard total-outfit budget, and need-by date. | Keeps the recurring request fast and centers the three essential constraints. | Longer recurring questionnaire |
| 2026-07-28 | Limit alternatives to four per category and recalculate the whole ensemble after changes. | Preserves curation and makes the product manage relationships rather than expose a catalog. | Unbounded mix-and-match browsing |
| 2026-07-28 | Allow saving, external sharing, and checkout re-entry from saved outfits. | Users may want another person's opinion before purchasing; saving should preserve active shopping intent. | Static inspiration-only saves |
| 2026-07-28 | Require delivery and contact information during setup. | Enables prepared checkout without repeated address entry. | Collecting delivery information separately at every Arrival checkout |
| 2026-07-28 | Use prepared checkout whenever technically permitted and guided checkout as fallback. | Reduces repetitive work while keeping final review and payment with the retailer. | Product-link dumping and autonomous payment |
| 2026-07-28 | Use “I completed the purchase” as the MVP confirmation. | Produces a self-reported conversion signal before direct retailer verification is available. | Pretending Arrival can verify arbitrary retailer orders |
| 2026-07-28 | Make the private beta and demos free. | The MVP exists to validate behavior and value before selecting monetization. | MVP subscription or paywall |
| 2026-07-28 | Treat agentic one-confirmation purchasing and retailer affiliate partnerships as future pitch north stars. | Both can strengthen the mature product but are not dependable MVP requirements. | Present-tense one-click and affiliate claims |
| 2026-07-28 | Use one GitHub repository with specialized services around one application. | Prevents competing app versions and lets UI, data, extraction, and checkout systems coexist. | Independent v0/Replit versions |
| 2026-07-28 | Begin from the specification, not from an assumed existing prototype. | Arrival has not yet been coded in any form. | References to preserving an existing v0 implementation |
| 2026-08-13 | Establish the canonical Next.js 16 foundation in the GitHub repository. | Milestone 0 requires a single source of truth with documented conventions before product interfaces are built. App Router, TypeScript, Tailwind CSS v4, ESLint, and Vitest are confirmed. Lint, tests, and production build pass. | N/A |
| 2026-08-18 | Replace free-text biometric/sizing fields with structured controls. | Height (feet + inches), top size (letter dropdown), bottom (waist + inseam), and shoe sizes (US dropdown 3–18 half-step, conditional on product pool) are specific enough to drive size recommendations without ambiguity. Weight remains optional. Reference-brand size system (letter vs. numeric) must be explicitly chosen before the size field is shown — no silent default. | Free-text height, weight, topSize, bottomSize, shoeSize fields (v0.3) |
| 2026-07-28 | Treat the Wishbone completion message as friendly flexible copy, not a required phrase. | Preserves the intended tone without hard-coding an early copy idea into the product contract. | Requiring the exact phrase “perfect! you’re all set” |
| 2026-07-28 | Source MVP product records and photos through controlled collection of selected multibrand retailers' public listings and public APIs. | Makes the real-catalog pipeline implementable and clarifies that only live, indiscriminate, or access-control-bypassing extraction is excluded. | Treating all scraping or public-listing image collection as out of scope |

---

## 11. Reusable coding-prompt preamble

Use this at the beginning of future implementation prompts:

```text
Read /docs/ARRIVAL_PRODUCT_SPEC.md in full before making changes.

It is the authoritative product specification. Preserve every applicable
BINDING_MVP requirement and acceptance criterion. Do not implement or claim
NORTH_STAR features unless this task explicitly promotes one. Do not silently
resolve UNRESOLVED items. Do not implement OUT_OF_SCOPE features.

Inspect the existing repository before editing. Extend the current architecture
rather than recreating the application. Limit changes to the task below,
document any schema or environment-variable changes, and verify the affected
user journey against the specification before finishing.
```
