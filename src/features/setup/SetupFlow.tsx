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
// Confirmation view — shown after successful submission.
// Profile setup portion is complete; Wishbone taste-learning remains unbuilt.
// Main app navigation must not be revealed here (MVP-ONB-002).
// ---------------------------------------------------------------------------

function ConfirmationView({ email }: { email: string }) {
  return (
    <div className="text-center">
      {/* decorative — aria-hidden */}
      <div className="mb-4 text-4xl" aria-hidden="true">
        ✓
      </div>
      <h2 className="mb-2 text-xl font-semibold text-zinc-900">
        Profile setup complete
      </h2>
      <p className="mb-4 text-sm text-zinc-600">
        You&apos;ve completed the profile portion of the prototype
        {email ? ` (${email})` : ""}. No data has been sent or stored anywhere.
      </p>
      <p className="text-sm text-zinc-500">
        The next step — taste preferences — will complete your Arrival setup.
      </p>
      <p className="mt-8 text-xs text-zinc-400">
        Development prototype: profile data is not persisted and will be lost
        on refresh.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SetupFlow — main export
// ---------------------------------------------------------------------------

/**
 * Renders the full account-creation and profile-setup experience.
 *
 * Structured so that profile form logic (everything except credentials) can
 * be reused by a future Account editing screen. Do not build that screen here.
 */
export function SetupFlow() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [credentials, setCredentials] =
    useState<SetupCredentials>(EMPTY_CREDENTIALS);
  const [profile, setProfile] = useState<ProfileDraft>(EMPTY_PROFILE);
  const [errors, setErrors] = useState<ValidationErrors>({});
  // Preserve the submitted email so the confirmation screen can show it
  // after credentials state is cleared.
  const [submittedEmail, setSubmittedEmail] = useState("");

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
      // TEMPORARY: save email for the confirmation, then discard all
      // credentials — the password must never be stored or logged.
      setSubmittedEmail(credentials.email);
      setCredentials(EMPTY_CREDENTIALS);
      setSubmitted(true);
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <ConfirmationView email={submittedEmail} />
      </div>
    );
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
          <ReviewStep email={credentials.email} profile={profile} />
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
          {step === TOTAL_STEPS - 1 ? "Submit" : "Continue"}
        </button>
      </div>
    </div>
  );
}
