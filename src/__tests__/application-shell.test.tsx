import fs from "node:fs";
import path from "node:path";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArrivalSessionProvider, useArrivalSession } from "@/features/app-session/ArrivalSessionContext";
import type { ArrivalSession } from "@/features/app-session/types";
import type { ProfileDraft } from "@/features/setup/types";
import type { WishboneTasteProfile } from "@/features/wishbone/types";
import {
  validateShoppingRequest,
  type ShoppingRequestDraft,
} from "@/features/home/validation";
import { SetupEntry } from "@/features/setup/SetupEntry";
import HomePage from "@/app/home/page";
import SavedOutfitsPage from "@/app/saved-outfits/page";
import AccountPage from "@/app/account/page";

const navigationMock = vi.hoisted(() => ({
  pathname: "/home",
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationMock.pathname,
  useRouter: () => ({
    push: navigationMock.push,
    replace: navigationMock.replace,
  }),
}));

const FIXTURE = {
  email: "shell-tester@arrival-sample.example",
  password: "fictional-password-for-testing",
  fullName: "Fictional Shell Tester",
  phone: "+15550001234",
  addressLine1: "100 Sample Avenue",
  city: "Example City",
  state: "NY",
  zip: "10001",
  country: "US",
} as const;

const PROFILE: ProfileDraft = {
  fullName: FIXTURE.fullName,
  phone: FIXTURE.phone,
  addressLine1: FIXTURE.addressLine1,
  addressLine2: "",
  city: FIXTURE.city,
  stateOrProvince: FIXTURE.state,
  zipOrPostalCode: FIXTURE.zip,
  country: FIXTURE.country,
  productPool: "menswear",
  heightFeet: "5",
  heightInches: "10",
  weightLbs: "",
  referenceBrand: "Fictional Brand",
  refSizeSystem: "letter",
  refLetterSize: "M",
  refNumericSize: "",
  topLetterSize: "M",
  waistInches: "32",
  inseamInches: "30",
  mensShoeSizeUS: "10",
  womensShoeSizeUS: "",
};

const WISHBONE_PROFILE: WishboneTasteProfile = {
  selections: [
    {
      dimension: "minimalExpressive",
      chosenPole: "minimal",
      imageId: "minimal-menswear",
      productPool: "menswear",
    },
    {
      dimension: "tailoredRelaxed",
      chosenPole: "relaxed",
      imageId: "relaxed-menswear",
      productPool: "menswear",
    },
    {
      dimension: "classicDirectional",
      chosenPole: "classic",
      imageId: "classic-menswear",
      productPool: "menswear",
    },
    {
      dimension: "cleanTextured",
      chosenPole: "textured",
      imageId: "textured-menswear",
      productPool: "menswear",
    },
  ],
};

const SESSION: ArrivalSession = {
  email: FIXTURE.email,
  profile: PROFILE,
  wishboneProfile: WISHBONE_PROFILE,
  onboardingComplete: true,
};

function renderWithSession(ui: React.ReactNode, session = SESSION) {
  return render(
    <ArrivalSessionProvider initialSession={session}>
      {ui}
    </ArrivalSessionProvider>
  );
}

function fillProfileFixture() {
  fireEvent.change(screen.getByLabelText(/email address/i), {
    target: { value: FIXTURE.email },
  });
  fireEvent.change(screen.getByLabelText(/^password/i), {
    target: { value: FIXTURE.password },
  });
}

function fillDeliveryFixture() {
  fireEvent.change(screen.getByLabelText(/full name/i), {
    target: { value: FIXTURE.fullName },
  });
  fireEvent.change(screen.getByLabelText(/phone number/i), {
    target: { value: FIXTURE.phone },
  });
  fireEvent.change(screen.getByLabelText(/address line 1/i), {
    target: { value: FIXTURE.addressLine1 },
  });
  fireEvent.change(screen.getByLabelText(/city/i), {
    target: { value: FIXTURE.city },
  });
  fireEvent.change(screen.getByLabelText(/state or province/i), {
    target: { value: FIXTURE.state },
  });
  fireEvent.change(screen.getByLabelText(/zip or postal code/i), {
    target: { value: FIXTURE.zip },
  });
  fireEvent.change(screen.getByLabelText(/country/i), {
    target: { value: FIXTURE.country },
  });
}

function fillSizingFixture() {
  fireEvent.change(screen.getByLabelText(/^feet$/i), {
    target: { value: "5" },
  });
  fireEvent.change(screen.getByLabelText(/^inches$/i), {
    target: { value: "10" },
  });
  fireEvent.change(screen.getByLabelText(/a brand you already shop/i), {
    target: { value: "Fictional Brand" },
  });
  fireEvent.click(screen.getByRole("radio", { name: /^letter size$/i }));
  fireEvent.change(screen.getByLabelText(/brand letter size/i), {
    target: { value: "M" },
  });
  fireEvent.change(screen.getByLabelText(/^top size$/i), {
    target: { value: "M" },
  });
  fireEvent.change(screen.getByLabelText(/waist \(in\)/i), {
    target: { value: "32" },
  });
  fireEvent.change(screen.getByLabelText(/inseam \(in\)/i), {
    target: { value: "30" },
  });
  fireEvent.change(screen.getByLabelText(/men.*us shoe size/i), {
    target: { value: "10" },
  });
}

async function advanceThroughOnboarding(
  user: ReturnType<typeof userEvent.setup>
) {
  fillProfileFixture();
  await user.click(screen.getByRole("button", { name: /^continue$/i }));

  fillDeliveryFixture();
  await user.click(screen.getByRole("button", { name: /^continue$/i }));

  await user.click(screen.getByRole("radio", { name: /^menswear$/i }));
  await user.click(screen.getByRole("button", { name: /^continue$/i }));

  fillSizingFixture();
  await user.click(screen.getByRole("button", { name: /^continue$/i }));
  await user.click(
    screen.getByRole("button", { name: /continue to taste quiz/i })
  );

  for (let round = 0; round < 4; round++) {
    const [firstOption] = screen.getAllByRole("button", { pressed: false });
    await user.click(firstOption);
    await user.click(
      screen.getByRole("button", {
        name: round === 3 ? /finish setup/i : /^continue$/i,
      })
    );
  }
}

function SessionObserver() {
  const { session } = useArrivalSession();
  return (
    <output aria-label="Current session email">
      {session?.email ?? "No session"}
    </output>
  );
}

function fillValidHomeRequest() {
  fireEvent.change(screen.getByLabelText(/what are you shopping for/i), {
    target: { value: "A fictional outdoor autumn wedding" },
  });
  fireEvent.change(screen.getByLabelText(/total outfit budget/i), {
    target: { value: "425.50" },
  });
  fireEvent.change(screen.getByLabelText(/need it by/i), {
    target: { value: "2026-10-15" },
  });
}

beforeEach(() => {
  navigationMock.pathname = "/home";
  navigationMock.push.mockReset();
  navigationMock.replace.mockReset();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Wishbone completion to application session", () => {
  it("keeps Enter Arrival hidden until Wishbone completes, then creates the session and navigates to Home", async () => {
    const user = userEvent.setup();
    render(
      <ArrivalSessionProvider>
        <SetupEntry />
        <SessionObserver />
      </ArrivalSessionProvider>
    );

    expect(
      screen.queryByRole("button", { name: /enter arrival/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: /application navigation/i })
    ).not.toBeInTheDocument();

    await advanceThroughOnboarding(user);

    expect(
      screen.getByRole("button", { name: /enter arrival/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: /application navigation/i })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /enter arrival/i }));

    expect(screen.getByLabelText(/current session email/i)).toHaveTextContent(
      FIXTURE.email
    );
    expect(navigationMock.push).toHaveBeenCalledWith("/home");
  });
});

describe("protected application routes", () => {
  it.each([
    ["/home", <HomePage key="home" />],
    ["/saved-outfits", <SavedOutfitsPage key="saved" />],
    ["/account", <AccountPage key="account" />],
  ])("redirects %s to setup when a fresh provider has no session", async (route, page) => {
    navigationMock.pathname = route;
    render(<ArrivalSessionProvider>{page}</ArrivalSessionProvider>);

    await waitFor(() => {
      expect(navigationMock.replace).toHaveBeenCalledWith("/setup");
    });
    expect(
      screen.queryByRole("navigation", { name: /application navigation/i })
    ).not.toBeInTheDocument();
  });

  it.each([
    ["/home", <HomePage key="home" />, "Home"],
    ["/saved-outfits", <SavedOutfitsPage key="saved" />, "Saved Outfits"],
    ["/account", <AccountPage key="account" />, "Account"],
  ])("shows navigation on %s and marks only %s active", (route, page, activeLabel) => {
    navigationMock.pathname = route;
    renderWithSession(page);

    const navigation = screen.getByRole("navigation", {
      name: /application navigation/i,
    });
    const links = Array.from(navigation.querySelectorAll("a"));
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      "Saved Outfits",
      "Home",
      "Account",
    ]);
    expect(
      screen.getByRole("link", { name: activeLabel }).getAttribute("aria-current")
    ).toBe("page");
    expect(
      links.filter((link) => link.getAttribute("aria-current") === "page")
    ).toHaveLength(1);
  });
});

describe("Home request intake", () => {
  it("contains exactly the three required user fields", () => {
    renderWithSession(<HomePage />);
    const form = screen.getByRole("button", { name: /submit request/i }).closest("form");
    expect(form).not.toBeNull();
    expect(form?.querySelectorAll("input, textarea")).toHaveLength(3);
    expect(
      screen.getByLabelText(/what are you shopping for/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/total outfit budget/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/need it by/i)).toBeInTheDocument();
  });

  it("shows accessible inline errors when all three fields are empty", async () => {
    const user = userEvent.setup();
    renderWithSession(<HomePage />);
    await user.click(screen.getByRole("button", { name: /submit request/i }));

    expect(screen.getAllByRole("alert")).toHaveLength(3);
    expect(screen.getByLabelText(/what are you shopping for/i)).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    expect(screen.getByLabelText(/total outfit budget/i)).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    expect(screen.getByLabelText(/need it by/i)).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("keeps entered values when validation fails", async () => {
    const user = userEvent.setup();
    renderWithSession(<HomePage />);
    fireEvent.change(screen.getByLabelText(/what are you shopping for/i), {
      target: { value: "A fictional gallery opening" },
    });
    await user.click(screen.getByRole("button", { name: /submit request/i }));

    expect(screen.getByLabelText(/what are you shopping for/i)).toHaveValue(
      "A fictional gallery opening"
    );
  });

  it.each(["0", "-1", "not-a-number", "NaN", "Infinity"])(
    "rejects budget %s at the pure validation layer",
    (budget) => {
      const draft: ShoppingRequestDraft = {
        shoppingFor: "A fictional event",
        totalOutfitBudget: budget,
        needBy: "2026-10-15",
      };
      expect(validateShoppingRequest(draft).totalOutfitBudget).toBeDefined();
    }
  );

  it("rejects an impossible calendar date deterministically", () => {
    expect(
      validateShoppingRequest({
        shoppingFor: "A fictional event",
        totalOutfitBudget: "100",
        needBy: "2026-02-31",
      }).needBy
    ).toBeDefined();
  });

  it("shows the exact submitted values and an honest implementation boundary", async () => {
    const user = userEvent.setup();
    renderWithSession(<HomePage />);
    fillValidHomeRequest();
    await user.click(screen.getByRole("button", { name: /submit request/i }));

    const summary = screen.getByRole("region", {
      name: /submitted shopping request/i,
    });
    expect(summary).toHaveTextContent("A fictional outdoor autumn wedding");
    expect(summary).toHaveTextContent("$425.50");
    expect(summary).toHaveTextContent("2026-10-15");
    expect(summary).toHaveTextContent(
      /outfit generation and retailer matching are not implemented yet/i
    );
    expect(summary).toHaveTextContent(/no products were searched/i);
  });

  it("submits without network requests or storage operations", async () => {
    const user = userEvent.setup();
    const fetchSpy =
      typeof globalThis.fetch === "function"
        ? vi.spyOn(globalThis, "fetch")
        : undefined;
    const storageSpies = [
      vi.spyOn(Storage.prototype, "getItem"),
      vi.spyOn(Storage.prototype, "setItem"),
      vi.spyOn(Storage.prototype, "removeItem"),
    ];

    renderWithSession(<HomePage />);
    fillValidHomeRequest();
    await user.click(screen.getByRole("button", { name: /submit request/i }));

    expect(fetchSpy).not.toHaveBeenCalled();
    for (const spy of storageSpies) {
      expect(spy).not.toHaveBeenCalled();
    }
  });
});

describe("application route content and client navigation", () => {
  it("shows an honest Saved Outfits empty state without fabricated outfits", () => {
    navigationMock.pathname = "/saved-outfits";
    renderWithSession(<SavedOutfitsPage />);
    expect(screen.getByText(/no outfits have been saved yet/i)).toBeInTheDocument();
    expect(screen.getByText(/does not create sample outfits/i)).toBeInTheDocument();
  });

  it("shows the profile and all four Wishbone selections in Account without a password", () => {
    navigationMock.pathname = "/account";
    renderWithSession(<AccountPage />);

    expect(screen.getByText(FIXTURE.email)).toBeInTheDocument();
    expect(screen.getByText(FIXTURE.fullName)).toBeInTheDocument();
    expect(screen.getByText(FIXTURE.addressLine1, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/^menswear$/i)).toBeInTheDocument();
    expect(screen.getByText(/minimal vs\. expressive/i)).toBeInTheDocument();
    expect(screen.getByText(/tailored vs\. relaxed/i)).toBeInTheDocument();
    expect(screen.getByText(/classic vs\. directional/i)).toBeInTheDocument();
    expect(screen.getByText(/clean vs\. textured/i)).toBeInTheDocument();
    expect(screen.queryByText(FIXTURE.password)).not.toBeInTheDocument();
  });

  it("preserves the in-memory request while navigating Home to Saved Outfits to Account and back", async () => {
    const user = userEvent.setup();
    navigationMock.pathname = "/home";
    const view = renderWithSession(<HomePage />);
    fillValidHomeRequest();
    await user.click(screen.getByRole("button", { name: /submit request/i }));
    expect(screen.getByText("$425.50")).toBeInTheDocument();

    navigationMock.pathname = "/saved-outfits";
    view.rerender(
      <ArrivalSessionProvider initialSession={SESSION}>
        <SavedOutfitsPage />
      </ArrivalSessionProvider>
    );
    expect(screen.getByText(/no outfits have been saved yet/i)).toBeInTheDocument();

    navigationMock.pathname = "/account";
    view.rerender(
      <ArrivalSessionProvider initialSession={SESSION}>
        <AccountPage />
      </ArrivalSessionProvider>
    );
    expect(screen.getByText(FIXTURE.email)).toBeInTheDocument();

    navigationMock.pathname = "/home";
    view.rerender(
      <ArrivalSessionProvider initialSession={SESSION}>
        <HomePage />
      </ArrivalSessionProvider>
    );
    expect(screen.getByText("$425.50")).toBeInTheDocument();
  });

  it("does not introduce hydration-unstable time, randomness, or locale formatting", () => {
    const files = [
      "src/features/app-session/ArrivalSessionContext.tsx",
      "src/features/app-shell/ProtectedApplicationPage.tsx",
      "src/features/home/validation.ts",
      "src/features/home/HomeRequestIntake.tsx",
    ];
    const source = files
      .map((file) => fs.readFileSync(path.join(process.cwd(), file), "utf8"))
      .join("\n");

    expect(source).not.toContain("Math.random");
    expect(source).not.toContain("Date.now");
    expect(source).not.toContain("toLocale");
  });
});