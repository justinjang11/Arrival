/**
 * Tests for the nonpersistent Wishbone taste-learning prototype
 * (src/features/wishbone/).
 *
 * These exercise WishboneFlow in isolation (via direct props) as well as
 * data-layer invariants in wishboneData.ts. Full-journey integration with
 * the profile flow (Review -> Wishbone -> completion) is covered separately
 * in setup-flow.test.tsx.
 *
 * Deterministic: no Math.random(), no Date.now(), no locale-dependent
 * assertions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import fs from "node:fs";
import path from "node:path";
import { WishboneFlow } from "@/features/wishbone/WishboneFlow";
import { WishboneCompletion } from "@/features/wishbone/WishboneCompletion";
import {
  WISHBONE_IMAGES,
  getWishboneRounds,
  DIMENSION_LABELS,
} from "@/features/wishbone/wishboneData";
import type { WishboneTasteProfile } from "@/features/wishbone/types";

// ===========================================================================
// Data-layer invariants
// ===========================================================================

describe("wishboneData — manifest invariants", () => {
  it("declares exactly sixteen images", () => {
    expect(WISHBONE_IMAGES.length).toBe(16);
  });

  it("gives every image a unique id", () => {
    const ids = WISHBONE_IMAGES.map((img) => img.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every image a unique src path", () => {
    const paths = WISHBONE_IMAGES.map((img) => img.src);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("points every manifest path at a file that actually exists under public/wishbone/", () => {
    for (const img of WISHBONE_IMAGES) {
      // src is like "/wishbone/minimal-menswear.jpg" — public/ is the web root.
      const filePath = path.join(process.cwd(), "public", img.src);
      expect(fs.existsSync(filePath), `${img.src} should exist`).toBe(true);
    }
  });

  it("gives every image nonempty descriptive alt text that is not its filename or pole", () => {
    for (const img of WISHBONE_IMAGES) {
      expect(img.alt.trim().length).toBeGreaterThan(0);
      expect(img.alt.toLowerCase()).not.toBe(img.id.toLowerCase());
      expect(img.alt.toLowerCase()).not.toBe(img.pole.toLowerCase());
    }
  });
});

describe("getWishboneRounds — deterministic round construction", () => {
  it("returns exactly four rounds for menswear", () => {
    expect(getWishboneRounds("menswear").length).toBe(4);
  });

  it("returns exactly four rounds for womenswear", () => {
    expect(getWishboneRounds("womenswear").length).toBe(4);
  });

  it("returns exactly four rounds for both", () => {
    expect(getWishboneRounds("both").length).toBe(4);
  });

  it("uses only menswear-pool images when productPool is menswear", () => {
    const rounds = getWishboneRounds("menswear");
    for (const round of rounds) {
      for (const option of round.options) {
        expect(option.productPool).toBe("menswear");
      }
    }
  });

  it("uses only womenswear-pool images when productPool is womenswear", () => {
    const rounds = getWishboneRounds("womenswear");
    for (const round of rounds) {
      for (const option of round.options) {
        expect(option.productPool).toBe("womenswear");
      }
    }
  });

  it("uses the exact deterministic mixed sequence for both (TEMPORARY PROTOTYPE ASSUMPTION)", () => {
    // TEMPORARY PROTOTYPE ASSUMPTION — not a permanent personalization rule.
    // Round 1: Minimal vs. Expressive — menswear
    // Round 2: Tailored vs. Relaxed — womenswear
    // Round 3: Classic vs. Directional — menswear
    // Round 4: Clean vs. Textured — womenswear
    const rounds = getWishboneRounds("both");
    expect(rounds[0].dimension).toBe("minimalExpressive");
    expect(rounds[0].options.every((o) => o.productPool === "menswear")).toBe(true);
    expect(rounds[1].dimension).toBe("tailoredRelaxed");
    expect(rounds[1].options.every((o) => o.productPool === "womenswear")).toBe(true);
    expect(rounds[2].dimension).toBe("classicDirectional");
    expect(rounds[2].options.every((o) => o.productPool === "menswear")).toBe(true);
    expect(rounds[3].dimension).toBe("cleanTextured");
    expect(rounds[3].options.every((o) => o.productPool === "womenswear")).toBe(true);
  });

  it("presents the four dimensions in the same fixed order for every product pool", () => {
    const expectedOrder = [
      "minimalExpressive",
      "tailoredRelaxed",
      "classicDirectional",
      "cleanTextured",
    ];
    for (const pool of ["menswear", "womenswear", "both"] as const) {
      expect(getWishboneRounds(pool).map((r) => r.dimension)).toEqual(expectedOrder);
    }
  });
});

// ===========================================================================
// WishboneFlow component behavior
// ===========================================================================

function renderFlow(
  pool: "menswear" | "womenswear" | "both" = "menswear"
) {
  const onBack = vi.fn();
  const onComplete = vi.fn();
  render(<WishboneFlow productPool={pool} onBack={onBack} onComplete={onComplete} />);
  return { onBack, onComplete };
}

describe("WishboneFlow — structure and progress", () => {
  it("shows the prescribed heading and helper copy", () => {
    renderFlow();
    expect(
      screen.getByRole("heading", { name: /which feels more like you/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/four quick choices\. there are no wrong answers\./i)
    ).toBeInTheDocument();
  });

  it("shows Round 1 of 4 on the first round", () => {
    renderFlow();
    expect(screen.getByText(/round 1 of 4/i)).toBeInTheDocument();
  });

  it("advances progress text through all four rounds as Continue is clicked with a selection each time", async () => {
    const user = userEvent.setup();
    renderFlow();

    for (let roundNumber = 1; roundNumber <= 4; roundNumber++) {
      expect(screen.getByText(new RegExp(`round ${roundNumber} of 4`, "i"))).toBeInTheDocument();
      const buttons = screen.getAllByRole("button", { pressed: false });
      // Pick the first image-choice button (Back/Continue are not toggle buttons
      // and are excluded because they lack aria-pressed).
      await user.click(buttons[0]);
      const continueLabel = roundNumber === 4 ? /finish setup/i : /^continue$/i;
      await user.click(screen.getByRole("button", { name: continueLabel }));
    }
  });

  it("does not display internal taste-dimension labels during a round", () => {
    renderFlow();
    // "Minimal" / "Expressive" etc. must not appear as visible round labels.
    expect(screen.queryByText(/minimal vs\. expressive/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^minimal$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^expressive$/i)).not.toBeInTheDocument();
  });

  it("renders two real <button type=button> options with nonempty alt text", () => {
    renderFlow();
    const images = screen.getAllByRole("img");
    expect(images.length).toBe(2);
    for (const img of images) {
      expect(img.getAttribute("alt")?.trim().length).toBeGreaterThan(0);
      const button = img.closest("button");
      expect(button).not.toBeNull();
      expect(button?.getAttribute("type")).toBe("button");
    }
  });
});

describe("WishboneFlow — selection and validation", () => {
  it("clicking Continue with no selection shows an inline error and stays on the same round", async () => {
    const user = userEvent.setup();
    renderFlow();
    await user.click(screen.getByRole("button", { name: /^continue$/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/choose one outfit to continue/i);
    // Still round 1 — Continue did not advance.
    expect(screen.getByText(/round 1 of 4/i)).toBeInTheDocument();
  });

  it("selecting a card sets aria-pressed=true on it and false on the other", async () => {
    const user = userEvent.setup();
    renderFlow();
    const [first, second] = screen.getAllByRole("button", { pressed: false });
    await user.click(first);
    expect(first).toHaveAttribute("aria-pressed", "true");
    expect(second).toHaveAttribute("aria-pressed", "false");
  });

  it("selecting a card and clicking Continue advances to round 2 without an error", async () => {
    const user = userEvent.setup();
    renderFlow();
    const [first] = screen.getAllByRole("button", { pressed: false });
    await user.click(first);
    await user.click(screen.getByRole("button", { name: /^continue$/i }));
    expect(screen.getByText(/round 2 of 4/i)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("clears a previously shown error once a selection is made", async () => {
    const user = userEvent.setup();
    renderFlow();
    await user.click(screen.getByRole("button", { name: /^continue$/i }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    const [first] = screen.getAllByRole("button", { pressed: false });
    await user.click(first);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("WishboneFlow — Back navigation", () => {
  it("calls onBack when Back is clicked on round one", async () => {
    const user = userEvent.setup();
    const { onBack } = renderFlow();
    await user.click(screen.getByRole("button", { name: /back/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("returns to the previous round (not onBack) when Back is clicked after round one", async () => {
    const user = userEvent.setup();
    const { onBack } = renderFlow();
    const [first] = screen.getAllByRole("button", { pressed: false });
    await user.click(first);
    await user.click(screen.getByRole("button", { name: /^continue$/i }));
    expect(screen.getByText(/round 2 of 4/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /back/i }));
    expect(screen.getByText(/round 1 of 4/i)).toBeInTheDocument();
    expect(onBack).not.toHaveBeenCalled();
  });

  it("preserves a round's earlier selection when navigating Back to it", async () => {
    const user = userEvent.setup();
    renderFlow();
    const [firstOptionRound1] = screen.getAllByRole("button", { pressed: false });
    await user.click(firstOptionRound1);
    await user.click(screen.getByRole("button", { name: /^continue$/i }));
    expect(screen.getByText(/round 2 of 4/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /back/i }));
    expect(screen.getByText(/round 1 of 4/i)).toBeInTheDocument();
    // The previously selected option must still show aria-pressed="true".
    const pressedButtons = screen.getAllByRole("button", { pressed: true });
    expect(pressedButtons.length).toBe(1);
  });
});

describe("WishboneFlow — completion", () => {
  it("calls onComplete with a typed profile containing all four dimensions after round four", async () => {
    const user = userEvent.setup();
    const { onComplete } = renderFlow("menswear");

    for (let i = 0; i < 4; i++) {
      const [first] = screen.getAllByRole("button", { pressed: false });
      await user.click(first);
      const label = i === 3 ? /finish setup/i : /^continue$/i;
      await user.click(screen.getByRole("button", { name: label }));
    }

    expect(onComplete).toHaveBeenCalledTimes(1);
    const profile: WishboneTasteProfile = onComplete.mock.calls[0][0];
    expect(profile.selections.length).toBe(4);
    const dimensions = profile.selections.map((s) => s.dimension).sort();
    expect(dimensions).toEqual(
      ["classicDirectional", "cleanTextured", "minimalExpressive", "tailoredRelaxed"].sort()
    );
    for (const selection of profile.selections) {
      expect(selection.productPool).toBe("menswear");
      expect(typeof selection.chosenPole).toBe("string");
      expect(typeof selection.imageId).toBe("string");
    }
  });

  it('reads "Finish setup" on the fourth round\'s continue button', async () => {
    const user = userEvent.setup();
    renderFlow();
    for (let i = 0; i < 3; i++) {
      const [first] = screen.getAllByRole("button", { pressed: false });
      await user.click(first);
      await user.click(screen.getByRole("button", { name: /^continue$/i }));
    }
    expect(screen.getByText(/round 4 of 4/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /finish setup/i })).toBeInTheDocument();
  });
});

describe("WishboneCompletion — summary and safety", () => {
  const sampleProfile: WishboneTasteProfile = {
    selections: [
      { dimension: "minimalExpressive", chosenPole: "minimal", imageId: "minimal-menswear", productPool: "menswear" },
      { dimension: "tailoredRelaxed", chosenPole: "relaxed", imageId: "relaxed-menswear", productPool: "menswear" },
      { dimension: "classicDirectional", chosenPole: "classic", imageId: "classic-menswear", productPool: "menswear" },
      { dimension: "cleanTextured", chosenPole: "textured", imageId: "textured-menswear", productPool: "menswear" },
    ],
  };

  it("shows the completion heading and helper copy", () => {
    render(<WishboneCompletion email="fictional@example.test" profile={sampleProfile} />);
    expect(screen.getByText(/you.re all set\./i)).toBeInTheDocument();
    expect(
      screen.getByText(/your starting taste profile is ready for the next stage/i)
    ).toBeInTheDocument();
  });

  it("summarizes all four selected style directions, matching the chosen poles", () => {
    render(<WishboneCompletion email="fictional@example.test" profile={sampleProfile} />);
    for (const selection of sampleProfile.selections) {
      const { title } = DIMENSION_LABELS[selection.dimension];
      expect(screen.getByText(title)).toBeInTheDocument();
    }
    // Chosen poles are shown capitalized (internal labels only revealed here).
    expect(screen.getByText("Minimal")).toBeInTheDocument();
    expect(screen.getByText("Relaxed")).toBeInTheDocument();
    expect(screen.getByText("Classic")).toBeInTheDocument();
    expect(screen.getByText("Textured")).toBeInTheDocument();
  });

  it("does not reveal Home, Saved Outfits, Account, or a <nav> element", () => {
    const { container } = render(
      <WishboneCompletion email="fictional@example.test" profile={sampleProfile} />
    );
    expect(container.querySelector("nav")).toBeNull();
    expect(screen.queryByText(/^home$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/saved outfits/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^account$/i)).not.toBeInTheDocument();
  });

  it("states that no information has been sent or stored", () => {
    render(<WishboneCompletion email="fictional@example.test" profile={sampleProfile} />);
    expect(
      screen.getByText(/no information has been sent or stored/i)
    ).toBeInTheDocument();
  });
});

// ===========================================================================
// No storage / no network — TEMPORARY nonpersistent prototype guarantee
// ===========================================================================

describe("WishboneFlow — nonpersistent guarantees", () => {
  let storageSpy: ReturnType<typeof vi.spyOn>[];
  let fetchSpy: ReturnType<typeof vi.spyOn> | undefined;

  beforeEach(() => {
    storageSpy = [
      vi.spyOn(Storage.prototype, "setItem"),
      vi.spyOn(Storage.prototype, "getItem"),
      vi.spyOn(Storage.prototype, "removeItem"),
    ];
    if (typeof globalThis.fetch === "function") {
      fetchSpy = vi.spyOn(globalThis, "fetch");
    }
  });

  afterEach(() => {
    storageSpy.forEach((s) => s.mockRestore());
    fetchSpy?.mockRestore();
  });

  it("never calls localStorage/sessionStorage APIs while completing all four rounds", async () => {
    const user = userEvent.setup();
    renderFlow("both");
    for (let i = 0; i < 4; i++) {
      const [first] = screen.getAllByRole("button", { pressed: false });
      await user.click(first);
      const label = i === 3 ? /finish setup/i : /^continue$/i;
      await user.click(screen.getByRole("button", { name: label }));
    }
    for (const spy of storageSpy) {
      expect(spy).not.toHaveBeenCalled();
    }
  });

  it("never issues a network request (fetch) while completing all four rounds", async () => {
    const user = userEvent.setup();
    renderFlow("womenswear");
    for (let i = 0; i < 4; i++) {
      const [first] = screen.getAllByRole("button", { pressed: false });
      await user.click(first);
      const label = i === 3 ? /finish setup/i : /^continue$/i;
      await user.click(screen.getByRole("button", { name: label }));
    }
    if (fetchSpy) {
      expect(fetchSpy).not.toHaveBeenCalled();
    }
  });
});
