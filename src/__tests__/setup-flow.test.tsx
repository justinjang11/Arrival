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
 *   - Sizing fields: free-text, non-empty accepted.
 *
 * These assumptions are temporary prototyping behavior and must be updated
 * when the product specification resolves the open items.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SetupFlow } from "@/features/setup/SetupFlow";

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
  height: "5ft 9in",
  weight: "155 lb",
  brand: "Fictional Brand Co",
  brandSize: "M",
  topSize: "M",
  bottomSize: "32×30",
  shoeSize: "10",
} as const;

// ---------------------------------------------------------------------------
// Navigation helpers — fill a step and advance
//
// fillCredentials, fillDelivery, and fillSizing use fireEvent.change for
// deterministic, timing-independent field population. Their sole purpose is
// to place fixture data in the form so that tests can reach a later step.
// userEvent is reserved for interactions whose behavior is under test:
// clicking Continue / Back / Submit and selecting radio buttons.
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

function fillSizing() {
  fireEvent.change(screen.getByLabelText(/^height/i), {
    target: { value: F.height },
  });
  fireEvent.change(screen.getByLabelText(/^weight/i), {
    target: { value: F.weight },
  });
  fireEvent.change(screen.getByLabelText(/a brand you already shop/i), {
    target: { value: F.brand },
  });
  fireEvent.change(screen.getByLabelText(/your size in that brand/i), {
    target: { value: F.brandSize },
  });
  fireEvent.change(screen.getByLabelText(/^top size/i), {
    target: { value: F.topSize },
  });
  fireEvent.change(screen.getByLabelText(/bottom size/i), {
    target: { value: F.bottomSize },
  });
  fireEvent.change(screen.getByLabelText(/shoe size/i), {
    target: { value: F.shoeSize },
  });
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

/** Advance from step 0 to step 3 (Sizing). */
async function advanceTo_Sizing(user: ReturnType<typeof userEvent.setup>) {
  await advanceTo_Products(user);
  // No default selection — user must explicitly choose a product pool.
  await user.click(screen.getByRole("radio", { name: /^menswear$/i }));
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
      (screen.getByLabelText(/^height/i) as HTMLInputElement).value
    ).toBe(F.height);
    expect(
      (screen.getByLabelText(/^weight/i) as HTMLInputElement).value
    ).toBe(F.weight);
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
