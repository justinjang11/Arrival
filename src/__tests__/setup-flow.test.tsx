/**
 * Tests for the account-creation and profile-setup flow (/setup).
 *
 * All test data is clearly fictional and must never contain real names,
 * addresses, phone numbers, emails, or passwords.
 *
 * Tests are deterministic — fixed inputs always produce the same result.
 *
 * TEMPORARY ASSUMPTIONS reflected here:
 *   - Non-empty password is accepted (no format policy). Tests note this.
 *   - Phone format: prototype rule — digits, spaces, (), -, . allowed; one
 *     optional leading "+"; 7–15 digits required after stripping formatting.
 *     Not full E.164/libphonenumber validation. Must be updated when spec
 *     defines the final rule.
 *   - Sizing fields are structured: feet/inches, optional weight, letter-size
 *     dropdowns, separate waist/inseam, and conditional US shoe-size dropdowns.
 *
 * These assumptions are temporary prototyping behavior and must be updated
 * when the product specification resolves the open items.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SetupFlow } from "@/features/setup/SetupFlow";
import { validateSizing } from "@/features/setup/validation";
import type { ProfileDraft } from "@/features/setup/types";

// ---------------------------------------------------------------------------
// Fictional test fixtures — all values are invented for test purposes only
// ---------------------------------------------------------------------------

const F = {
  email: "fictional-tester@arrival-sample.example",
  /** TEMPORARY: non-empty password — policy not yet specified by product spec */
  password: "fictional-dev-password-99",
  name: "Fictional Testperson",
  phone: "+15550009876",
  addressLine1: "42 Sample Street",
  // addressLine2 intentionally omitted from required fields (it is optional)
  city: "Testville",
  state: "CA",
  zip: "90001",
  country: "US",
  // Structured height
  heightFeet: "5",
  heightInches: "9",
  // Optional weight (numeric, lb)
  weightLbs: "155",
  // Reference brand
  brand: "Fictional Brand Co",
  refLetterSize: "M",
  // Standard sizes (letter dropdown + separate waist/inseam)
  topLetterSize: "M",
  waistInches: "32",
  inseamInches: "30",
  // Shoe sizes (US, conditional on product pool)
  mensShoeSizeUS: "10",
  womensShoeSizeUS: "8",
} as const;

// ---------------------------------------------------------------------------
// Navigation helpers — fill a step and advance
//
// fillCredentials, fillDelivery, and fillSizing use fireEvent.change for
// deterministic, timing-independent field population. Their sole purpose is
// to place fixture data in the form so that tests can reach a later step.
// userEvent is reserved for interactions whose behavior is under test:
// clicking Continue / Back / Submit and selecting product-pool radio buttons.
// ---------------------------------------------------------------------------

function fillCredentials() {
  fireEvent.change(screen.getByLabelText(/email address/i), {
    target: { value: F.email },
  });
  fireEvent.change(screen.getByLabelText(/^password/i), {
    target: { value: F.password },
  });
}

function fillDelivery() {
  fireEvent.change(screen.getByLabelText(/full name/i), {
    target: { value: F.name },
  });
  fireEvent.change(screen.getByLabelText(/phone number/i), {
    target: { value: F.phone },
  });
  fireEvent.change(screen.getByLabelText(/address line 1/i), {
    target: { value: F.addressLine1 },
  });
  // address line 2 intentionally left empty — it is optional
  fireEvent.change(screen.getByLabelText(/city/i), {
    target: { value: F.city },
  });
  fireEvent.change(screen.getByLabelText(/state or province/i), {
    target: { value: F.state },
  });
  fireEvent.change(screen.getByLabelText(/zip or postal code/i), {
    target: { value: F.zip },
  });
  fireEvent.change(screen.getByLabelText(/country/i), {
    target: { value: F.country },
  });
}

/**
 * Fill the sizing step with all structured fixture data.
 *
 * Shoe-size fields are conditional on productPool — the helper fills
 * whichever dropdowns are currently visible in the DOM.
 *
 * The reference brand size system is selected (Letter size) before the
 * brand letter-size dropdown appears. This is fixture setup, not a test
 * of the radio interaction itself, so fireEvent.click is used.
 */
function fillSizing() {
  // Height
  fireEvent.change(screen.getByLabelText(/^feet$/i), {
    target: { value: F.heightFeet },
  });
  fireEvent.change(screen.getByLabelText(/^inches$/i), {
    target: { value: F.heightInches },
  });
  // Weight (optional — fill with a fixture value; separate tests verify it may be blank)
  fireEvent.change(screen.getByLabelText(/weight \(lb\)/i), {
    target: { value: F.weightLbs },
  });
  // Reference brand
  fireEvent.change(screen.getByLabelText(/a brand you already shop/i), {
    target: { value: F.brand },
  });
  // Reference brand size system — select "Letter size" radio then choose from dropdown
  fireEvent.click(screen.getByRole("radio", { name: /^letter size$/i }));
  fireEvent.change(screen.getByLabelText(/brand letter size/i), {
    target: { value: F.refLetterSize },
  });
  // Top size dropdown
  fireEvent.change(screen.getByLabelText(/^top size$/i), {
    target: { value: F.topLetterSize },
  });
  // Bottom sizing
  fireEvent.change(screen.getByLabelText(/waist \(in\)/i), {
    target: { value: F.waistInches },
  });
  fireEvent.change(screen.getByLabelText(/inseam \(in\)/i), {
    target: { value: F.inseamInches },
  });
  // Shoe sizes — fill whichever are visible based on current productPool
  const menShoe = screen.queryByLabelText(/men.*us shoe size/i);
  if (menShoe) fireEvent.change(menShoe, { target: { value: F.mensShoeSizeUS } });
  const womenShoe = screen.queryByLabelText(/women.*us shoe size/i);
  if (womenShoe)
    fireEvent.change(womenShoe, { target: { value: F.womensShoeSizeUS } });
}

async function clickContinue(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /continue/i }));
}

async function clickSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /submit/i }));
}

/** Advance from step 0 (Credentials) to step 1 (Delivery). */
async function advanceTo_Delivery(user: ReturnType<typeof userEvent.setup>) {
  fillCredentials();
  await clickContinue(user);
}

/** Advance from step 0 to step 2 (Products). */
async function advanceTo_Products(user: ReturnType<typeof userEvent.setup>) {
  await advanceTo_Delivery(user);
  fillDelivery();
  await clickContinue(user);
}

/** Advance from step 0 to step 3 (Sizing) with Menswear selected. */
async function advanceTo_Sizing(user: ReturnType<typeof userEvent.setup>) {
  await advanceTo_Products(user);
  // No default selection — user must explicitly choose a product pool.
  await user.click(screen.getByRole("radio", { name: /^menswear$/i }));
  await clickContinue(user);
}

/**
 * Advance from step 0 to step 3 (Sizing) with a specific product pool.
 * Used by shoe-size conditional tests.
 */
async function advanceTo_SizingWithPool(
  user: ReturnType<typeof userEvent.setup>,
  pool: "menswear" | "womenswear" | "both"
) {
  await advanceTo_Products(user);
  await user.click(screen.getByRole("radio", { name: new RegExp(`^${pool}$`, "i") }));
  await clickContinue(user);
}

/** Advance from step 0 to step 4 (Review). */
async function advanceTo_Review(user: ReturnType<typeof userEvent.setup>) {
  await advanceTo_Sizing(user);
  fillSizing();
  await clickContinue(user);
}

// ---------------------------------------------------------------------------
// Browser-storage spy setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.spyOn(Storage.prototype, "setItem");
  vi.spyOn(Storage.prototype, "getItem");
  vi.spyOn(Storage.prototype, "removeItem");
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ===========================================================================
// 1. Setup route renders
// ===========================================================================

describe("SetupFlow — route renders", () => {
  it("renders the setup flow with a visible heading", () => {
    render(<SetupFlow />);
    expect(
      screen.getByRole("heading", { name: /set up arrival/i })
    ).toBeInTheDocument();
  });

  it("starts on the credentials step with email and password fields", () => {
    render(<SetupFlow />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
  });

  it("shows a Continue button on the first step", () => {
    render(<SetupFlow />);
    expect(
      screen.getByRole("button", { name: /continue/i })
    ).toBeInTheDocument();
  });

  it("does not show a Back button on the first step", () => {
    render(<SetupFlow />);
    expect(
      screen.queryByRole("button", { name: /back/i })
    ).not.toBeInTheDocument();
  });

  it("shows a progress indicator", () => {
    render(<SetupFlow />);
    expect(screen.getByLabelText(/setup progress/i)).toBeInTheDocument();
  });
});

// ===========================================================================
// 2–4. Credentials validation
// ===========================================================================

describe("SetupFlow — credentials validation", () => {
  it("prevents progression and shows an error when email is empty", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await clickContinue(user);
    // Must still be on credentials step
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
  });

  it("displays a clear error for an invalid email address", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await user.type(screen.getByLabelText(/email address/i), "not-an-email");
    await user.type(screen.getByLabelText(/^password/i), F.password);
    await clickContinue(user);
    expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
    // Still on credentials
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it(
    "prevents progression when password is empty (TEMPORARY: non-empty only)",
    async () => {
      const user = userEvent.setup();
      render(<SetupFlow />);
      await user.type(screen.getByLabelText(/email address/i), F.email);
      // Intentionally do not fill password
      await clickContinue(user);
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      // Still on credentials
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    }
  );

  it("advances when both credentials fields are valid", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    fillCredentials();
    await clickContinue(user);
    // Now on delivery step
    expect(screen.getByText(/delivery information/i)).toBeInTheDocument();
  });

  it("preserves the email value when password fails", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await user.type(screen.getByLabelText(/email address/i), F.email);
    await clickContinue(user);
    // Email must still be present after failed validation
    expect(
      (screen.getByLabelText(/email address/i) as HTMLInputElement).value
    ).toBe(F.email);
  });
});

// ===========================================================================
// 5–7. Delivery validation
// ===========================================================================

describe("SetupFlow — delivery validation", () => {
  it("shows the required delivery helper copy", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Delivery(user);
    expect(
      screen.getByText(/used to prepare retailer checkouts/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/arrival never completes a purchase without your review/i)
    ).toBeInTheDocument();
  });

  it("requires a phone number before progression", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Delivery(user);
    // Fill everything except phone
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: F.name },
    });
    fireEvent.change(screen.getByLabelText(/address line 1/i), {
      target: { value: F.addressLine1 },
    });
    fireEvent.change(screen.getByLabelText(/city/i), {
      target: { value: F.city },
    });
    fireEvent.change(screen.getByLabelText(/state or province/i), {
      target: { value: F.state },
    });
    fireEvent.change(screen.getByLabelText(/zip or postal code/i), {
      target: { value: F.zip },
    });
    fireEvent.change(screen.getByLabelText(/country/i), {
      target: { value: F.country },
    });
    await clickContinue(user);
    expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
    // Still on delivery
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  it("requires a shipping address (address line 1) before progression", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Delivery(user);
    // Fill everything except address line 1
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: F.name },
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: F.phone },
    });
    fireEvent.change(screen.getByLabelText(/city/i), {
      target: { value: F.city },
    });
    fireEvent.change(screen.getByLabelText(/state or province/i), {
      target: { value: F.state },
    });
    fireEvent.change(screen.getByLabelText(/zip or postal code/i), {
      target: { value: F.zip },
    });
    fireEvent.change(screen.getByLabelText(/country/i), {
      target: { value: F.country },
    });
    await clickContinue(user);
    expect(screen.getByText(/address is required/i)).toBeInTheDocument();
  });

  it("requires city before progression", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Delivery(user);
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: F.name },
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: F.phone },
    });
    fireEvent.change(screen.getByLabelText(/address line 1/i), {
      target: { value: F.addressLine1 },
    });
    fireEvent.change(screen.getByLabelText(/state or province/i), {
      target: { value: F.state },
    });
    fireEvent.change(screen.getByLabelText(/zip or postal code/i), {
      target: { value: F.zip },
    });
    fireEvent.change(screen.getByLabelText(/country/i), {
      target: { value: F.country },
    });
    await clickContinue(user);
    expect(screen.getByText(/city is required/i)).toBeInTheDocument();
  });

  it("accepts a missing address line 2 — it is optional (MVP-ONB-001)", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Delivery(user);
    // fillDelivery does not fill address line 2
    fillDelivery();
    await clickContinue(user);
    // Must advance without address line 2 error
    expect(
      screen.queryByText(/address line 2.*required/i)
    ).not.toBeInTheDocument();
    // Now on products step
    expect(
      screen.getByText(/which products should arrival shop/i)
    ).toBeInTheDocument();
  });
});

// ===========================================================================
// 8. Product-pool choices
// ===========================================================================

describe("SetupFlow — product-pool choices", () => {
  it("renders Menswear, Womenswear, and Both as radio options", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Products(user);
    // Use exact role queries to avoid /menswear/i matching "Womenswear"
    expect(
      screen.getByRole("radio", { name: /^menswear$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: /^womenswear$/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: /^both$/i })
    ).toBeInTheDocument();
  });

  it("does not use gender-identity language (MVP-ONB-001)", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Products(user);
    expect(screen.queryByText(/gender identity/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/your gender/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/which products should arrival shop/i)
    ).toBeInTheDocument();
  });

  it("lets the user select Womenswear", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Products(user);
    const womenswear = screen.getByRole("radio", {
      name: /^womenswear$/i,
    }) as HTMLInputElement;
    await user.click(womenswear);
    expect(womenswear.checked).toBe(true);
  });

  it("lets the user select Both", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Products(user);
    const both = screen.getByRole("radio", {
      name: /^both$/i,
    }) as HTMLInputElement;
    await user.click(both);
    expect(both.checked).toBe(true);
  });
});

// ===========================================================================
// 9. Backward navigation preserves entered data
// ===========================================================================

describe("SetupFlow — backward navigation preserves data", () => {
  it("retains credentials when navigating to delivery and back", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    fillCredentials();
    await clickContinue(user);
    // On delivery step — go back
    await user.click(screen.getByRole("button", { name: /back/i }));
    // Email must still be present
    expect(
      (screen.getByLabelText(/email address/i) as HTMLInputElement).value
    ).toBe(F.email);
  });

  it("retains delivery info when navigating to products and back", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Delivery(user);
    fillDelivery();
    await clickContinue(user);
    // On products — go back
    await user.click(screen.getByRole("button", { name: /back/i }));
    // Full name must still be present
    expect(
      (screen.getByLabelText(/full name/i) as HTMLInputElement).value
    ).toBe(F.name);
    // Phone must still be present
    expect(
      (screen.getByLabelText(/phone number/i) as HTMLInputElement).value
    ).toBe(F.phone);
  });

  it("retains sizing info when navigating back from review", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Sizing(user);
    fillSizing();
    await clickContinue(user); // to review
    // Go back to sizing
    await user.click(screen.getByRole("button", { name: /back/i }));
    expect(
      (screen.getByLabelText(/^feet$/i) as HTMLInputElement).value
    ).toBe(F.heightFeet);
    expect(
      (screen.getByLabelText(/^inches$/i) as HTMLInputElement).value
    ).toBe(F.heightInches);
  });
});

// ===========================================================================
// 10–11. Complete flow with fictional data / confirmation state
// ===========================================================================

describe("SetupFlow — complete flow with fictional data", () => {
  it("advances through all steps and shows a profile completion confirmation", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);

    // Step 0: Credentials
    fillCredentials();
    await clickContinue(user);

    // Step 1: Delivery
    fillDelivery();
    await clickContinue(user);

    // Step 2: Products — must explicitly select (no default)
    await user.click(screen.getByRole("radio", { name: /^menswear$/i }));
    await clickContinue(user);

    // Step 3: Sizing
    fillSizing();
    await clickContinue(user);

    // Step 4: Review — verify it renders, then submit
    expect(screen.getByText(/review your information/i)).toBeInTheDocument();
    await clickSubmit(user);

    // Confirmation must appear
    expect(screen.getByText(/profile setup complete/i)).toBeInTheDocument();
  });

  it("does not reveal the final main application navigation after submission", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    fillCredentials();
    await clickContinue(user);
    fillDelivery();
    await clickContinue(user);
    await user.click(screen.getByRole("radio", { name: /^menswear$/i }));
    await clickContinue(user);
    fillSizing();
    await clickContinue(user);
    await clickSubmit(user);

    // MVP-ONB-002: main nav must be hidden until setup and Wishbone are complete
    expect(
      screen.queryByRole("navigation", { name: /main/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/saved outfits/i)).not.toBeInTheDocument();
  });

  it("makes clear the entire onboarding is not complete (Wishbone pending)", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    fillCredentials();
    await clickContinue(user);
    fillDelivery();
    await clickContinue(user);
    await user.click(screen.getByRole("radio", { name: /^menswear$/i }));
    await clickContinue(user);
    fillSizing();
    await clickContinue(user);
    await clickSubmit(user);

    // Confirmation should reference the next step (taste preferences / Wishbone)
    expect(screen.getByText(/taste preferences/i)).toBeInTheDocument();
  });
});

// ===========================================================================
// 12. Password security — excluded from profile / not displayed after submit
// ===========================================================================

describe("SetupFlow — password security", () => {
  it("does not display the password on the review step", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Review(user);
    expect(screen.queryByText(F.password)).not.toBeInTheDocument();
  });

  it("shows a note that the password is not displayed on the review step", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Review(user);
    expect(screen.getByText(/password is not shown/i)).toBeInTheDocument();
  });

  it("does not display the password in the confirmation view", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    fillCredentials();
    await clickContinue(user);
    fillDelivery();
    await clickContinue(user);
    await user.click(screen.getByRole("radio", { name: /^menswear$/i }));
    await clickContinue(user);
    fillSizing();
    await clickContinue(user);
    await clickSubmit(user);
    expect(screen.queryByText(F.password)).not.toBeInTheDocument();
  });
});

// ===========================================================================
// Phone-number validation (correction)
// ===========================================================================

describe("SetupFlow — phone number validation", () => {
  it('accepts "+1 (555) 000-9876" as a valid formatted number', async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Delivery(user);
    // Fixture fields populated with fireEvent; phone typed with userEvent
    // because phone-format acceptance is the interaction under test here.
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: F.name },
    });
    await user.type(
      screen.getByLabelText(/phone number/i),
      "+1 (555) 000-9876"
    );
    fireEvent.change(screen.getByLabelText(/address line 1/i), {
      target: { value: F.addressLine1 },
    });
    fireEvent.change(screen.getByLabelText(/city/i), {
      target: { value: F.city },
    });
    fireEvent.change(screen.getByLabelText(/state or province/i), {
      target: { value: F.state },
    });
    fireEvent.change(screen.getByLabelText(/zip or postal code/i), {
      target: { value: F.zip },
    });
    fireEvent.change(screen.getByLabelText(/country/i), {
      target: { value: F.country },
    });
    await clickContinue(user);
    // No phone error should appear; should advance to Products step
    expect(screen.queryByText(/valid phone number/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/which products should arrival shop/i)
    ).toBeInTheDocument();
  });

  it("rejects alphabetic text as a phone number", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Delivery(user);
    await user.type(screen.getByLabelText(/phone number/i), "not-a-phone");
    await clickContinue(user);
    expect(screen.getByText(/valid phone number/i)).toBeInTheDocument();
  });

  it("rejects a phone number with too few digits", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Delivery(user);
    await user.type(screen.getByLabelText(/phone number/i), "12345");
    await clickContinue(user);
    expect(screen.getByText(/valid phone number/i)).toBeInTheDocument();
  });

  it("shows an error message clearly asking for a valid phone number", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Delivery(user);
    await user.type(screen.getByLabelText(/phone number/i), "abc");
    await clickContinue(user);
    const alerts = screen.getAllByRole("alert");
    const phoneAlert = alerts.find((el) =>
      /valid phone number/i.test(el.textContent ?? "")
    );
    expect(phoneAlert).toBeDefined();
  });
});

// ===========================================================================
// Product-pool explicit selection (correction)
// ===========================================================================

describe("SetupFlow — product pool explicit selection", () => {
  it("shows no product pool option selected initially", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Products(user);
    const menswear = screen.getByRole("radio", {
      name: /^menswear$/i,
    }) as HTMLInputElement;
    const womenswear = screen.getByRole("radio", {
      name: /^womenswear$/i,
    }) as HTMLInputElement;
    const both = screen.getByRole("radio", {
      name: /^both$/i,
    }) as HTMLInputElement;
    expect(menswear.checked).toBe(false);
    expect(womenswear.checked).toBe(false);
    expect(both.checked).toBe(false);
  });

  it("blocks Continue until the user explicitly chooses a product pool", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Products(user);
    await clickContinue(user);
    // Should show error and remain on Products step
    expect(
      screen.getByText(/choose a product preference/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/which products should arrival shop/i)
    ).toBeInTheDocument();
  });

  it("allows all three valid product-pool choices to be explicitly selected", async () => {
    // Single render: radio buttons are mutually exclusive, so clicking each
    // option in sequence verifies all three are selectable.
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Products(user);

    await user.click(screen.getByRole("radio", { name: /^menswear$/i }));
    expect(
      (screen.getByRole("radio", { name: /^menswear$/i }) as HTMLInputElement)
        .checked
    ).toBe(true);

    await user.click(screen.getByRole("radio", { name: /^womenswear$/i }));
    expect(
      (screen.getByRole("radio", { name: /^womenswear$/i }) as HTMLInputElement)
        .checked
    ).toBe(true);

    await user.click(screen.getByRole("radio", { name: /^both$/i }));
    expect(
      (screen.getByRole("radio", { name: /^both$/i }) as HTMLInputElement)
        .checked
    ).toBe(true);
  });

  it("retains the selected pool when navigating backward from Sizing", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Products(user);
    await user.click(screen.getByRole("radio", { name: /^womenswear$/i }));
    await clickContinue(user); // advance to Sizing
    await user.click(screen.getByRole("button", { name: /back/i })); // back to Products
    const womenswear = screen.getByRole("radio", {
      name: /^womenswear$/i,
    }) as HTMLInputElement;
    expect(womenswear.checked).toBe(true);
  });
});

// ===========================================================================
// 13. No browser-storage API used
// ===========================================================================

describe("SetupFlow — no browser storage API", () => {
  it("does not call localStorage.setItem at any point during the flow", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    fillCredentials();
    await clickContinue(user);
    fillDelivery();
    await clickContinue(user);
    expect(Storage.prototype.setItem).not.toHaveBeenCalled();
  });

  it("does not call sessionStorage.setItem at any point during the flow", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    fillCredentials();
    await clickContinue(user);
    expect(Storage.prototype.setItem).not.toHaveBeenCalled();
  });

  it("does not call localStorage.getItem at any point during the flow", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    fillCredentials();
    await clickContinue(user);
    expect(Storage.prototype.getItem).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// 14. Height — structured separate fields
// ===========================================================================

describe("SetupFlow — height structured fields", () => {
  it("renders separate Feet and Inches numeric input fields", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Sizing(user);
    const feet = screen.getByLabelText(/^feet$/i);
    const inches = screen.getByLabelText(/^inches$/i);
    expect(feet).toBeInTheDocument();
    expect(inches).toBeInTheDocument();
    expect((feet as HTMLInputElement).type).toBe("number");
    expect((inches as HTMLInputElement).type).toBe("number");
  });

  it("rejects inches below 0", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Sizing(user);
    fireEvent.change(screen.getByLabelText(/^feet$/i), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText(/^inches$/i), { target: { value: "-1" } });
    await clickContinue(user);
    expect(screen.getByText(/0 to 11/i)).toBeInTheDocument();
    // Still on sizing
    expect(screen.getByLabelText(/^feet$/i)).toBeInTheDocument();
  });

  it("rejects inches above 11", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Sizing(user);
    fireEvent.change(screen.getByLabelText(/^feet$/i), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText(/^inches$/i), { target: { value: "12" } });
    await clickContinue(user);
    expect(screen.getByText(/0 to 11/i)).toBeInTheDocument();
  });

  it("rejects a non-integer decimal in the Feet field", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Sizing(user);
    // A decimal like "1.5" is numeric but not a whole number — Number.isInteger(1.5) === false.
    // type="number" inputs sanitize non-numeric strings (e.g. "5ft") to "" in JSDOM/browsers;
    // testing with a decimal verifies the integer-only constraint without relying on sanitization.
    fireEvent.change(screen.getByLabelText(/^feet$/i), { target: { value: "1.5" } });
    fireEvent.change(screen.getByLabelText(/^inches$/i), { target: { value: "9" } });
    await clickContinue(user);
    expect(screen.getByText(/whole number of feet/i)).toBeInTheDocument();
  });
});

// ===========================================================================
// 15. Weight — optional
// ===========================================================================

describe("SetupFlow — weight optional", () => {
  it("allows weight to remain empty and still advances to review", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Sizing(user);
    // Fill all sizing fields except weight
    fireEvent.change(screen.getByLabelText(/^feet$/i), { target: { value: F.heightFeet } });
    fireEvent.change(screen.getByLabelText(/^inches$/i), { target: { value: F.heightInches } });
    // Intentionally leave Weight (lb) empty
    fireEvent.change(screen.getByLabelText(/a brand you already shop/i), { target: { value: F.brand } });
    fireEvent.click(screen.getByRole("radio", { name: /^letter size$/i }));
    fireEvent.change(screen.getByLabelText(/brand letter size/i), { target: { value: F.refLetterSize } });
    fireEvent.change(screen.getByLabelText(/^top size$/i), { target: { value: F.topLetterSize } });
    fireEvent.change(screen.getByLabelText(/waist \(in\)/i), { target: { value: F.waistInches } });
    fireEvent.change(screen.getByLabelText(/inseam \(in\)/i), { target: { value: F.inseamInches } });
    fireEvent.change(screen.getByLabelText(/\bmen's us shoe size/i), { target: { value: F.mensShoeSizeUS } });
    await clickContinue(user);
    // Must advance to review without a weight error
    expect(screen.queryByText(/positive number for weight/i)).not.toBeInTheDocument();
    expect(screen.getByText(/review your information/i)).toBeInTheDocument();
  });

  it("rejects a provided weight that is not a positive number", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Sizing(user);
    fireEvent.change(screen.getByLabelText(/weight \(lb\)/i), { target: { value: "-5" } });
    await clickContinue(user);
    expect(screen.getByText(/positive number for weight/i)).toBeInTheDocument();
  });
});

// ===========================================================================
// 16. Bottom sizing — separate waist and inseam fields
// ===========================================================================

describe("SetupFlow — bottom sizing structured fields", () => {
  it("renders separate Waist (in) and Inseam (in) numeric fields", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Sizing(user);
    const waist = screen.getByLabelText(/waist \(in\)/i);
    const inseam = screen.getByLabelText(/inseam \(in\)/i);
    expect(waist).toBeInTheDocument();
    expect(inseam).toBeInTheDocument();
    expect((waist as HTMLInputElement).type).toBe("number");
    expect((inseam as HTMLInputElement).type).toBe("number");
  });

  it("requires both waist and inseam before advancing", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Sizing(user);
    // Fill everything except bottom fields
    fireEvent.change(screen.getByLabelText(/^feet$/i), { target: { value: F.heightFeet } });
    fireEvent.change(screen.getByLabelText(/^inches$/i), { target: { value: F.heightInches } });
    fireEvent.change(screen.getByLabelText(/a brand you already shop/i), { target: { value: F.brand } });
    fireEvent.click(screen.getByRole("radio", { name: /^letter size$/i }));
    fireEvent.change(screen.getByLabelText(/brand letter size/i), { target: { value: F.refLetterSize } });
    fireEvent.change(screen.getByLabelText(/^top size$/i), { target: { value: F.topLetterSize } });
    // Intentionally leave waist and inseam empty
    fireEvent.change(screen.getByLabelText(/\bmen's us shoe size/i), { target: { value: F.mensShoeSizeUS } });
    await clickContinue(user);
    expect(screen.getByText(/waist measurement is required/i)).toBeInTheDocument();
    expect(screen.getByText(/inseam measurement is required/i)).toBeInTheDocument();
  });

  it("rejects a negative number in the Waist field", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Sizing(user);
    // Negative values are not valid waist measurements.
    // Combined strings like "30x32" are sanitized to "" by type="number" inputs in JSDOM/browsers,
    // so a negative number is used instead to verify the positive-value constraint reliably.
    fireEvent.change(screen.getByLabelText(/waist \(in\)/i), { target: { value: "-5" } });
    await clickContinue(user);
    expect(screen.getByText(/positive number for waist/i)).toBeInTheDocument();
  });
});

// ===========================================================================
// 17. Top size — letter dropdown
// ===========================================================================

describe("SetupFlow — top size dropdown", () => {
  it("is an unselected dropdown initially", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Sizing(user);
    const topSelect = screen.getByLabelText(/^top size$/i) as HTMLSelectElement;
    expect(topSelect.tagName).toBe("SELECT");
    expect(topSelect.value).toBe("");
  });

  it("contains all required letter-size options", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Sizing(user);
    const topSelect = screen.getByLabelText(/^top size$/i) as HTMLSelectElement;
    const optionValues = Array.from(topSelect.options).map((o) => o.value);
    for (const size of ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"]) {
      expect(optionValues).toContain(size);
    }
  });
});

// ===========================================================================
// 18. Reference brand size system
// ===========================================================================

describe("SetupFlow — reference brand size system", () => {
  it("has no size system selected initially", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Sizing(user);
    const letterRadio = screen.getByRole("radio", {
      name: /^letter size$/i,
    }) as HTMLInputElement;
    const numericRadio = screen.getByRole("radio", {
      name: /^numeric size$/i,
    }) as HTMLInputElement;
    expect(letterRadio.checked).toBe(false);
    expect(numericRadio.checked).toBe(false);
  });

  it("shows the brand letter-size dropdown when Letter size is selected", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Sizing(user);
    // Before selection: dropdown absent
    expect(screen.queryByLabelText(/brand letter size/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: /^letter size$/i }));
    // After selection: dropdown appears
    const select = screen.getByLabelText(/brand letter size/i) as HTMLSelectElement;
    expect(select.tagName).toBe("SELECT");
    // Requires a selection before advancing
    await clickContinue(user);
    expect(screen.getByText(/select a letter size/i)).toBeInTheDocument();
  });

  it("shows the brand numeric-size field when Numeric size is selected", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Sizing(user);
    // Before selection: numeric input absent
    expect(screen.queryByLabelText(/brand numeric size/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: /^numeric size$/i }));
    // After selection: numeric input appears
    const input = screen.getByLabelText(/brand numeric size/i) as HTMLInputElement;
    expect(input.type).toBe("number");
    // Requires a value before advancing
    await clickContinue(user);
    expect(screen.getByText(/enter a numeric size/i)).toBeInTheDocument();
  });

  it("switching from letter to numeric does not produce a hidden letter-size error", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Sizing(user);
    // Select letter, then switch to numeric
    fireEvent.click(screen.getByRole("radio", { name: /^letter size$/i }));
    fireEvent.click(screen.getByRole("radio", { name: /^numeric size$/i }));
    // Letter size dropdown should no longer be visible
    expect(screen.queryByLabelText(/brand letter size/i)).not.toBeInTheDocument();
    // Fill everything else and click Continue — only the numeric field should error
    fireEvent.change(screen.getByLabelText(/^feet$/i), { target: { value: F.heightFeet } });
    fireEvent.change(screen.getByLabelText(/^inches$/i), { target: { value: F.heightInches } });
    fireEvent.change(screen.getByLabelText(/a brand you already shop/i), { target: { value: F.brand } });
    fireEvent.change(screen.getByLabelText(/^top size$/i), { target: { value: F.topLetterSize } });
    fireEvent.change(screen.getByLabelText(/waist \(in\)/i), { target: { value: F.waistInches } });
    fireEvent.change(screen.getByLabelText(/inseam \(in\)/i), { target: { value: F.inseamInches } });
    fireEvent.change(screen.getByLabelText(/men.*us shoe size/i), { target: { value: F.mensShoeSizeUS } });
    await clickContinue(user);
    // Brand numeric size error (empty) should appear; no letter-size error should appear
    expect(screen.getByText(/enter a numeric size/i)).toBeInTheDocument();
    expect(screen.queryByText(/select a letter size/i)).not.toBeInTheDocument();
  });
});

// ===========================================================================
// 19. Shoe sizes — conditional dropdowns
// ===========================================================================

describe("SetupFlow — shoe sizes conditional dropdowns", () => {
  it("shows only Men's US shoe size for Menswear", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_SizingWithPool(user, "menswear");
    expect(screen.getByLabelText(/\bmen's us shoe size/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/women.*us shoe size/i)).not.toBeInTheDocument();
  });

  it("shows only Women's US shoe size for Womenswear", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_SizingWithPool(user, "womenswear");
    expect(screen.getByLabelText(/women.*us shoe size/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/\bmen's us shoe size/i)).not.toBeInTheDocument();
  });

  it("shows both Men's and Women's US shoe sizes for Both", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_SizingWithPool(user, "both");
    expect(screen.getByLabelText(/\bmen's us shoe size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/women.*us shoe size/i)).toBeInTheDocument();
  });

  it("shoe size selects are dropdowns containing whole and half sizes", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_SizingWithPool(user, "menswear");
    const select = screen.getByLabelText(/\bmen's us shoe size/i) as HTMLSelectElement;
    expect(select.tagName).toBe("SELECT");
    const optionValues = Array.from(select.options).map((o) => o.value);
    // Whole sizes
    expect(optionValues).toContain("3");
    expect(optionValues).toContain("10");
    expect(optionValues).toContain("18");
    // Half sizes
    expect(optionValues).toContain("3.5");
    expect(optionValues).toContain("10.5");
    // No preselection
    expect(select.value).toBe("");
  });

  it("menswear requires men's shoe size and blocks without it", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_SizingWithPool(user, "menswear");
    // Fill everything except shoe
    fireEvent.change(screen.getByLabelText(/^feet$/i), { target: { value: F.heightFeet } });
    fireEvent.change(screen.getByLabelText(/^inches$/i), { target: { value: F.heightInches } });
    fireEvent.change(screen.getByLabelText(/a brand you already shop/i), { target: { value: F.brand } });
    fireEvent.click(screen.getByRole("radio", { name: /^letter size$/i }));
    fireEvent.change(screen.getByLabelText(/brand letter size/i), { target: { value: F.refLetterSize } });
    fireEvent.change(screen.getByLabelText(/^top size$/i), { target: { value: F.topLetterSize } });
    fireEvent.change(screen.getByLabelText(/waist \(in\)/i), { target: { value: F.waistInches } });
    fireEvent.change(screen.getByLabelText(/inseam \(in\)/i), { target: { value: F.inseamInches } });
    // Intentionally leave men's shoe empty
    await clickContinue(user);
    expect(screen.getByText(/select a men.*shoe size/i)).toBeInTheDocument();
    expect(screen.queryByText(/women.*shoe size/i)).not.toBeInTheDocument();
  });

  it("womenswear requires women's shoe size and blocks without it", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_SizingWithPool(user, "womenswear");
    fireEvent.change(screen.getByLabelText(/^feet$/i), { target: { value: F.heightFeet } });
    fireEvent.change(screen.getByLabelText(/^inches$/i), { target: { value: F.heightInches } });
    fireEvent.change(screen.getByLabelText(/a brand you already shop/i), { target: { value: F.brand } });
    fireEvent.click(screen.getByRole("radio", { name: /^letter size$/i }));
    fireEvent.change(screen.getByLabelText(/brand letter size/i), { target: { value: F.refLetterSize } });
    fireEvent.change(screen.getByLabelText(/^top size$/i), { target: { value: F.topLetterSize } });
    fireEvent.change(screen.getByLabelText(/waist \(in\)/i), { target: { value: F.waistInches } });
    fireEvent.change(screen.getByLabelText(/inseam \(in\)/i), { target: { value: F.inseamInches } });
    // Intentionally leave women's shoe empty
    await clickContinue(user);
    expect(screen.getByText(/select a women.*shoe size/i)).toBeInTheDocument();
    expect(screen.queryByText(/men.*us shoe size.*required/i)).not.toBeInTheDocument();
  });

  it("both pool requires separate men's and women's shoe sizes", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_SizingWithPool(user, "both");
    fireEvent.change(screen.getByLabelText(/^feet$/i), { target: { value: F.heightFeet } });
    fireEvent.change(screen.getByLabelText(/^inches$/i), { target: { value: F.heightInches } });
    fireEvent.change(screen.getByLabelText(/a brand you already shop/i), { target: { value: F.brand } });
    fireEvent.click(screen.getByRole("radio", { name: /^letter size$/i }));
    fireEvent.change(screen.getByLabelText(/brand letter size/i), { target: { value: F.refLetterSize } });
    fireEvent.change(screen.getByLabelText(/^top size$/i), { target: { value: F.topLetterSize } });
    fireEvent.change(screen.getByLabelText(/waist \(in\)/i), { target: { value: F.waistInches } });
    fireEvent.change(screen.getByLabelText(/inseam \(in\)/i), { target: { value: F.inseamInches } });
    // Leave both shoe sizes empty
    await clickContinue(user);
    expect(screen.getByText(/select a men.*shoe size/i)).toBeInTheDocument();
    expect(screen.getByText(/select a women.*shoe size/i)).toBeInTheDocument();
  });

  it("changing product preference to womenswear changes the required shoe fields", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    // Start with menswear selected
    await advanceTo_SizingWithPool(user, "menswear");
    // Men's shoe visible; women's shoe absent
    expect(screen.getByLabelText(/\bmen's us shoe size/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/women.*us shoe size/i)).not.toBeInTheDocument();
    // Navigate back to products and switch to womenswear
    await user.click(screen.getByRole("button", { name: /back/i }));
    await user.click(screen.getByRole("radio", { name: /^womenswear$/i }));
    await clickContinue(user);
    // Now women's shoe visible; men's shoe absent
    expect(screen.getByLabelText(/women.*us shoe size/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/\bmen's us shoe size/i)).not.toBeInTheDocument();
  });
});

// ===========================================================================
// 20. Review step — structured display format
// ===========================================================================

describe("SetupFlow — review structured display", () => {
  it("displays height, weight, reference brand, bottom, and shoe size in structured format", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Sizing(user);
    fillSizing();
    await clickContinue(user); // advance to review

    // Height: "5 ft 9 in"
    expect(screen.getByText(`${F.heightFeet} ft ${F.heightInches} in`)).toBeInTheDocument();
    // Weight: "155 lb"
    expect(screen.getByText(`${F.weightLbs} lb`)).toBeInTheDocument();
    // Reference brand with letter size: "Fictional Brand Co — Letter size M"
    expect(
      screen.getByText(`${F.brand} — Letter size ${F.refLetterSize}`)
    ).toBeInTheDocument();
    // Bottom: "32 in waist / 30 in inseam"
    expect(
      screen.getByText(`${F.waistInches} in waist / ${F.inseamInches} in inseam`)
    ).toBeInTheDocument();
    // Men's US shoe size (menswear pool)
    expect(screen.getByText(F.mensShoeSizeUS)).toBeInTheDocument();
    // Weight label present
    expect(screen.getByText(/^weight$/i)).toBeInTheDocument();
  });
});

// ===========================================================================
// Unit-test helpers for validateSizing
// ===========================================================================

/**
 * Returns a fully valid ProfileDraft with menswear pool.
 * Pass field overrides to test specific validation paths without
 * navigating through the UI.
 */
function makeProfile(overrides: Partial<ProfileDraft> = {}): ProfileDraft {
  return {
    fullName: "Fictional Testperson",
    phone: "+15550009876",
    addressLine1: "42 Sample Street",
    addressLine2: "",
    city: "Testville",
    stateOrProvince: "CA",
    zipOrPostalCode: "90001",
    country: "US",
    productPool: "menswear",
    heightFeet: "5",
    heightInches: "9",
    weightLbs: "155",
    referenceBrand: "Fictional Brand Co",
    refSizeSystem: "letter",
    refLetterSize: "M",
    refNumericSize: "",
    topLetterSize: "M",
    waistInches: "32",
    inseamInches: "30",
    mensShoeSizeUS: "10",
    womensShoeSizeUS: "",
    ...overrides,
  };
}

// ===========================================================================
// 21. Validation whitelist — non-finite values
// ===========================================================================

describe("validateSizing — non-finite numeric values rejected", () => {
  it("rejects Infinity as a weight value", () => {
    const errors = validateSizing(makeProfile({ weightLbs: "Infinity" }));
    expect(errors.weightLbs).toBeDefined();
    expect(errors.weightLbs).toMatch(/positive number for weight/i);
  });

  it("rejects -Infinity as a weight value", () => {
    const errors = validateSizing(makeProfile({ weightLbs: "-Infinity" }));
    expect(errors.weightLbs).toBeDefined();
    expect(errors.weightLbs).toMatch(/positive number for weight/i);
  });

  it("rejects Infinity as a reference-brand numeric size", () => {
    const errors = validateSizing(
      makeProfile({ refSizeSystem: "numeric", refLetterSize: "", refNumericSize: "Infinity" })
    );
    expect(errors.refNumericSize).toBeDefined();
    expect(errors.refNumericSize).toMatch(/valid numeric size/i);
  });

  it("rejects Infinity as a waist value", () => {
    const errors = validateSizing(makeProfile({ waistInches: "Infinity" }));
    expect(errors.waistInches).toBeDefined();
    expect(errors.waistInches).toMatch(/positive number for waist/i);
  });

  it("rejects -Infinity as an inseam value", () => {
    const errors = validateSizing(makeProfile({ inseamInches: "-Infinity" }));
    expect(errors.inseamInches).toBeDefined();
    expect(errors.inseamInches).toMatch(/positive number for inseam/i);
  });

  it("accepts a normal finite weight", () => {
    const errors = validateSizing(makeProfile({ weightLbs: "155" }));
    expect(errors.weightLbs).toBeUndefined();
  });
});

// ===========================================================================
// 22. Validation whitelist — letter-size values
// ===========================================================================

describe("validateSizing — unsupported letter-size values rejected", () => {
  it("rejects an unsupported top size like XXXXL", () => {
    const errors = validateSizing(makeProfile({ topLetterSize: "XXXXL" as never }));
    expect(errors.topLetterSize).toBeDefined();
    expect(errors.topLetterSize).toMatch(/select a top size/i);
  });

  it("rejects an empty-string top size", () => {
    const errors = validateSizing(makeProfile({ topLetterSize: "" }));
    expect(errors.topLetterSize).toBeDefined();
  });

  it("rejects an unsupported reference brand letter size", () => {
    const errors = validateSizing(
      makeProfile({ refSizeSystem: "letter", refLetterSize: "XXXXL" as never })
    );
    expect(errors.refLetterSize).toBeDefined();
    expect(errors.refLetterSize).toMatch(/select a letter size/i);
  });

  it("accepts all eight valid letter sizes for top size", () => {
    for (const size of ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const) {
      const errors = validateSizing(makeProfile({ topLetterSize: size }));
      expect(errors.topLetterSize).toBeUndefined();
    }
  });

  it("accepts all eight valid letter sizes for reference brand", () => {
    for (const size of ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const) {
      const errors = validateSizing(
        makeProfile({ refSizeSystem: "letter", refLetterSize: size })
      );
      expect(errors.refLetterSize).toBeUndefined();
    }
  });
});

// ===========================================================================
// 23. Validation whitelist — shoe-size values
// ===========================================================================

describe("validateSizing — unsupported shoe-size values rejected", () => {
  it("rejects a men's shoe size below the valid range (e.g. 2)", () => {
    const errors = validateSizing(makeProfile({ mensShoeSizeUS: "2" }));
    expect(errors.mensShoeSizeUS).toBeDefined();
    expect(errors.mensShoeSizeUS).toMatch(/men.*shoe size/i);
  });

  it("rejects a men's shoe size above the valid range (e.g. 99)", () => {
    const errors = validateSizing(makeProfile({ mensShoeSizeUS: "99" }));
    expect(errors.mensShoeSizeUS).toBeDefined();
  });

  it("rejects a non-half-step men's shoe size (e.g. 10.3)", () => {
    const errors = validateSizing(makeProfile({ mensShoeSizeUS: "10.3" }));
    expect(errors.mensShoeSizeUS).toBeDefined();
  });

  it("rejects an empty men's shoe size", () => {
    const errors = validateSizing(makeProfile({ mensShoeSizeUS: "" }));
    expect(errors.mensShoeSizeUS).toBeDefined();
  });

  it("accepts whole-number US shoe sizes within range (3 and 18)", () => {
    expect(validateSizing(makeProfile({ mensShoeSizeUS: "3" })).mensShoeSizeUS).toBeUndefined();
    expect(validateSizing(makeProfile({ mensShoeSizeUS: "18" })).mensShoeSizeUS).toBeUndefined();
  });

  it("accepts half-step US shoe sizes (3.5 and 10.5)", () => {
    expect(validateSizing(makeProfile({ mensShoeSizeUS: "3.5" })).mensShoeSizeUS).toBeUndefined();
    expect(validateSizing(makeProfile({ mensShoeSizeUS: "10.5" })).mensShoeSizeUS).toBeUndefined();
  });

  it("rejects a women's shoe size outside the valid range", () => {
    const errors = validateSizing(
      makeProfile({
        productPool: "womenswear",
        mensShoeSizeUS: "",
        womensShoeSizeUS: "2",
      })
    );
    expect(errors.womensShoeSizeUS).toBeDefined();
  });

  it("accepts a valid women's shoe size within range", () => {
    const errors = validateSizing(
      makeProfile({
        productPool: "womenswear",
        mensShoeSizeUS: "",
        womensShoeSizeUS: "8",
      })
    );
    expect(errors.womensShoeSizeUS).toBeUndefined();
  });
});

// ===========================================================================
// 24. Reference-size-system error is programmatically associated (aria)
// ===========================================================================

describe("SetupFlow — ref size system error aria association", () => {
  it("associates the size-system error with the fieldset via aria-describedby", async () => {
    const user = userEvent.setup();
    render(<SetupFlow />);
    await advanceTo_Sizing(user);
    // Do not select a size system, then try to advance — triggers refSizeSystem error.
    fireEvent.change(screen.getByLabelText(/^feet$/i), { target: { value: F.heightFeet } });
    fireEvent.change(screen.getByLabelText(/^inches$/i), { target: { value: F.heightInches } });
    fireEvent.change(screen.getByLabelText(/a brand you already shop/i), { target: { value: F.brand } });
    // Intentionally leave refSizeSystem unselected
    fireEvent.change(screen.getByLabelText(/^top size$/i), { target: { value: F.topLetterSize } });
    fireEvent.change(screen.getByLabelText(/waist \(in\)/i), { target: { value: F.waistInches } });
    fireEvent.change(screen.getByLabelText(/inseam \(in\)/i), { target: { value: F.inseamInches } });
    fireEvent.change(screen.getByLabelText(/\bmen's us shoe size/i), { target: { value: F.mensShoeSizeUS } });
    await clickContinue(user);

    // Error element must have the expected id.
    const errorEl = document.getElementById("refSizeSystem-error");
    expect(errorEl).not.toBeNull();
    expect(errorEl?.textContent).toMatch(/choose a size system/i);

    // The fieldset must reference that error via aria-describedby.
    const fieldset = errorEl?.closest("fieldset");
    expect(fieldset).not.toBeNull();
    expect(fieldset?.getAttribute("aria-describedby")).toBe("refSizeSystem-error");
  });
});
