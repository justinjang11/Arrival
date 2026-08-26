"use client";

/**
 * SetupFlow — account-creation and profile-setup flow.
 *
 * TEMPORARY: All form state lives in React useState only. It is not persisted
 * to any storage backend (no database, no localStorage, no sessionStorage, no
 * cookies). Refreshing or closing the browser tab will erase entered data.
 * This is intentional for the current milestone and will change when Supabase
 * authentication and database persistence are added.
 *
 * TEMPORARY: The password is cleared from state immediately after submission.
 * It is never logged, stored, or displayed after that point.
 */

import { useState } from "react";
import type { SetupCredentials, ProfileDraft, ValidationErrors } from "./types";
import { validateStep } from "./validation";
import { ProgressIndicator } from "./ProgressIndicator";
import { CredentialsStep } from "./steps/CredentialsStep";
import { DeliveryStep } from "./steps/DeliveryStep";
import { ProductPoolStep } from "./steps/ProductPoolStep";
import { SizingStep } from "./steps/SizingStep";
import { ReviewStep } from "./steps/ReviewStep";
import { WishboneFlow } from "@/features/wishbone/WishboneFlow";
import { WishboneCompletion } from "@/features/wishbone/WishboneCompletion";
import type { WishboneTasteProfile } from "@/features/wishbone/types";

const STEP_LABELS = ["Credentials", "Delivery", "Products", "Sizing", "Review"];
const TOTAL_STEPS = STEP_LABELS.length;

const EMPTY_CREDENTIALS: SetupCredentials = { email: "", password: "" };

const EMPTY_PROFILE: ProfileDraft = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  stateOrProvince: "",
  zipOrPostalCode: "",
  country: "",
  productPool: null, // null = no selection; user must choose explicitly
  // Structured height
  heightFeet: "",
  heightInches: "",
  // Optional weight
  weightLbs: "",
  // Reference brand and size
  referenceBrand: "",
  refSizeSystem: "",
  refLetterSize: "",
  refNumericSize: "",
  // Standard sizes
  topLetterSize: "",
  waistInches: "",
  inseamInches: "",
  // Shoe sizes — conditional on productPool
  mensShoeSizeUS: "",
  womensShoeSizeUS: "",
};

// ---------------------------------------------------------------------------
// SetupFlow — main export
// ---------------------------------------------------------------------------

/**
 * Explicit setup-flow phase.
 *
 *   "profile"  — the five-step credentials/delivery/products/sizing/review flow
 *   "wishbone" — the nonpersistent this-or-that taste-learning prototype
 *   "complete" — final confirmation screen after Wishbone's fourth round
 *
 * Main application navigation must never be revealed in any phase
 * (MVP-ONB-002).
 */
type SetupPhase = "profile" | "wishbone" | "complete";

/**
 * Renders the full account-creation and profile-setup experience.
 *
 * Structured so that profile form logic (everything except credentials) can
 * be reused by a future Account editing screen. Do not build that screen here.
 */
export function SetupFlow() {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<SetupPhase>("profile");
  const [credentials, setCredentials] =
    useState<SetupCredentials>(EMPTY_CREDENTIALS);
  const [profile, setProfile] = useState<ProfileDraft>(EMPTY_PROFILE);
  const [errors, setErrors] = useState<ValidationErrors>({});
  // Wishbone's completed taste profile — React state only, never persisted.
  const [wishboneProfile, setWishboneProfile] =
    useState<WishboneTasteProfile | null>(null);

  const updateCredentials = (
    field: keyof SetupCredentials,
    value: string
  ) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
    // Clear the error for this field when the user edits it.
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updateProfile = (field: keyof ProfileDraft, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }) as ProfileDraft);
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof ValidationErrors];
        return next;
      });
    }
  };

  const handleContinue = () => {
    const stepErrors = validateStep(step, credentials, profile);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      // Review's final button: "Continue to taste quiz". Immediately clear
      // only the password — it must never be stored, logged, or displayed
      // after this point. The email is preserved so it keeps displaying
      // through Wishbone, a Back-to-Review round trip, and the completion
      // screen.
      setCredentials((prev) => ({ ...prev, password: "" }));
      setPhase("wishbone");
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  // Wishbone's "Back" from round one returns here, to Review, with all
  // profile answers and the submitted email still intact.
  const handleWishboneBack = () => {
    setPhase("profile");
  };

  const handleWishboneComplete = (result: WishboneTasteProfile) => {
    setWishboneProfile(result);
    setPhase("complete");
  };

  if (phase === "wishbone") {
    // productPool is guaranteed non-null here: validateProductPool blocks
    // advancement past the Products step (and therefore past Review) until
    // an explicit menswear/womenswear/both choice has been made.
    const pool = profile.productPool ?? "both";
    return (
      <WishboneFlow
        productPool={pool}
        onBack={handleWishboneBack}
        onComplete={handleWishboneComplete}
      />
    );
  }

  if (phase === "complete" && wishboneProfile) {
    return <WishboneCompletion email={credentials.email} profile={wishboneProfile} />;
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-900">
        Set up Arrival
      </h1>
      <p className="mb-8 text-sm text-zinc-500">
        Takes about three minutes. Progress is not saved between browser
        sessions.
      </p>

      <ProgressIndicator
        currentStep={step}
        totalSteps={TOTAL_STEPS}
        stepLabels={STEP_LABELS}
      />

      <div className="mb-8">
        {step === 0 && (
          <CredentialsStep
            credentials={credentials}
            onChange={updateCredentials}
            errors={errors}
          />
        )}
        {step === 1 && (
          <DeliveryStep
            profile={profile}
            onChange={updateProfile}
            errors={errors}
          />
        )}
        {step === 2 && (
          <ProductPoolStep
            profile={profile}
            onChange={updateProfile}
            errors={errors}
          />
        )}
        {step === 3 && (
          <SizingStep
            profile={profile}
            onChange={updateProfile}
            errors={errors}
          />
        )}
        {step === 4 && (
          <ReviewStep
            email={credentials.email}
            profile={profile}
            helperText="Check your details, then continue to a few quick taste questions. Your password is not shown."
          />
        )}
      </div>

      <div className="flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1"
        >
          {step === TOTAL_STEPS - 1 ? "Continue to taste quiz" : "Continue"}
        </button>
      </div>
    </div>
  );
}
