/**
 * Deterministic form validation for the account-creation and profile-setup flow.
 *
 * All functions are pure: the same input always produces the same output.
 * No I/O, no Date.now(), no external calls.
 *
 * TEMPORARY ASSUMPTIONS (must be revisited when the spec is resolved):
 *
 *   Password policy:
 *     Only a non-empty value is required. The product specification does not
 *     define a final password policy. Real enforcement is delegated to
 *     Supabase Auth when authentication is connected.
 *
 *   Phone number format:
 *     Prototype rule: permits digits, spaces, parentheses, hyphens, and
 *     periods; permits one optional "+" at the very start; requires 7–15
 *     digits after stripping formatting characters; rejects any alphabetic
 *     or unsupported character. This is international-tolerant prototype
 *     validation, not a production-grade E.164 or libphonenumber check.
 *     A stricter rule (country code detection, carrier validation, etc.)
 *     should be applied when the spec defines one.
 *
 *   Address validation:
 *     No international address format validation is applied. Required fields
 *     must be non-empty; address line 2 is always optional.
 */

import type { SetupCredentials, ProfileDraft, ValidationErrors } from "./types";
import {
  LETTER_SIZE_SET,
  US_SHOE_SIZE_SET,
} from "./sizingConstants";

/**
 * Minimal email pattern — rejects obvious invalids without attempting full
 * RFC 5321 compliance.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone number prototype rule.
 *
 * Allowed characters: optional leading "+", then any combination of digits,
 * spaces, "(", ")", "-", and ".".
 * Digit count (after stripping formatting chars) must be 7–15.
 *
 * TEMPORARY ASSUMPTION — see file-level comment.
 */
const PHONE_ALLOWED_RE = /^\+?[\d\s().\-]+$/;
const PHONE_DIGIT_RE = /\d/g;
const PHONE_MIN_DIGITS = 7;
const PHONE_MAX_DIGITS = 15;

function validatePhone(phone: string): string | undefined {
  const trimmed = phone.trim();
  if (!trimmed) return "Phone number is required.";
  if (!PHONE_ALLOWED_RE.test(trimmed)) {
    return "Enter a valid phone number. Use digits, spaces, parentheses, hyphens, or periods only.";
  }
  const digitCount = (trimmed.match(PHONE_DIGIT_RE) ?? []).length;
  if (digitCount < PHONE_MIN_DIGITS || digitCount > PHONE_MAX_DIGITS) {
    return `Enter a valid phone number with ${PHONE_MIN_DIGITS}–${PHONE_MAX_DIGITS} digits.`;
  }
  return undefined;
}

export function validateCredentials(c: SetupCredentials): ValidationErrors {
  const e: ValidationErrors = {};
  if (!c.email.trim()) {
    e.email = "Email address is required.";
  } else if (!EMAIL_RE.test(c.email.trim())) {
    e.email = "Enter a valid email address.";
  }
  // TEMPORARY ASSUMPTION: non-empty password only — see file-level comment.
  if (!c.password) {
    e.password = "Password is required.";
  }
  return e;
}

export function validateDelivery(p: ProfileDraft): ValidationErrors {
  const e: ValidationErrors = {};
  if (!p.fullName.trim()) e.fullName = "Full name is required.";
  const phoneError = validatePhone(p.phone);
  if (phoneError) e.phone = phoneError;
  if (!p.addressLine1.trim()) e.addressLine1 = "Address is required.";
  // addressLine2 intentionally not validated — optional per MVP-ONB-001.
  if (!p.city.trim()) e.city = "City is required.";
  if (!p.stateOrProvince.trim())
    e.stateOrProvince = "State or province is required.";
  if (!p.zipOrPostalCode.trim())
    e.zipOrPostalCode = "ZIP or postal code is required.";
  if (!p.country.trim()) e.country = "Country is required.";
  return e;
}

/**
 * Validates that the user made an explicit product-pool selection.
 * null means no choice has been made; the flow must block until one is chosen.
 */
export function validateProductPool(
  pool: ProfileDraft["productPool"]
): ValidationErrors {
  if (pool === null) {
    return { productPool: "Please choose a product preference to continue." };
  }
  return {};
}

/**
 * Returns true when n is a finite number (not NaN, not ±Infinity).
 * Number() converts non-numeric strings to NaN, so this covers both
 * bad strings and the special IEEE 754 non-finite values.
 */
function isFiniteNumber(n: number): boolean {
  return !isNaN(n) && isFinite(n);
}

export function validateSizing(p: ProfileDraft): ValidationErrors {
  const e: ValidationErrors = {};

  // --- Height ---

  const feetTrimmed = p.heightFeet.trim();
  if (feetTrimmed === "") {
    e.heightFeet = "Feet is required.";
  } else {
    const feet = Number(feetTrimmed);
    if (!Number.isInteger(feet) || feet < 1) {
      e.heightFeet = "Enter a whole number of feet greater than zero.";
    }
  }

  const inchesTrimmed = p.heightInches.trim();
  if (inchesTrimmed === "") {
    e.heightInches = "Inches is required.";
  } else {
    const inches = Number(inchesTrimmed);
    if (!Number.isInteger(inches) || inches < 0 || inches > 11) {
      e.heightInches = "Inches must be a whole number from 0 to 11.";
    }
  }

  // --- Weight (optional) ---

  const weightTrimmed = p.weightLbs.trim();
  if (weightTrimmed !== "") {
    const weight = Number(weightTrimmed);
    if (!isFiniteNumber(weight) || weight <= 0) {
      e.weightLbs = "Enter a positive number for weight, or leave blank.";
    }
  }
  // Empty weight: no error — weight is optional per MVP-ONB-001.

  // --- Reference brand ---

  if (!p.referenceBrand.trim()) e.referenceBrand = "Reference brand is required.";

  // --- Reference-brand size system ---

  if (p.refSizeSystem !== "letter" && p.refSizeSystem !== "numeric") {
    e.refSizeSystem = "Choose a size system for this brand.";
  } else if (p.refSizeSystem === "letter") {
    // Validate against the exact whitelist — non-empty is not sufficient.
    if (!LETTER_SIZE_SET.has(p.refLetterSize)) {
      e.refLetterSize = "Select a letter size for this brand.";
    }
  } else {
    // numeric
    const refNum = p.refNumericSize.trim();
    if (refNum === "") {
      e.refNumericSize = "Enter a numeric size for this brand.";
    } else {
      const n = Number(refNum);
      // Reject NaN, Infinity, -Infinity, and any value below 0.
      if (!isFiniteNumber(n) || n < 0) {
        e.refNumericSize = "Enter a valid numeric size (0 or greater).";
      }
    }
  }

  // --- Top size (must be from the exact whitelist) ---

  if (!LETTER_SIZE_SET.has(p.topLetterSize)) {
    e.topLetterSize = "Select a top size.";
  }

  // --- Waist and inseam ---

  const waistTrimmed = p.waistInches.trim();
  if (waistTrimmed === "") {
    e.waistInches = "Waist measurement is required.";
  } else {
    const waist = Number(waistTrimmed);
    // Reject NaN, Infinity, -Infinity, and non-positive values.
    if (!isFiniteNumber(waist) || waist <= 0) {
      e.waistInches = "Enter a positive number for waist.";
    }
  }

  const inseamTrimmed = p.inseamInches.trim();
  if (inseamTrimmed === "") {
    e.inseamInches = "Inseam measurement is required.";
  } else {
    const inseam = Number(inseamTrimmed);
    // Reject NaN, Infinity, -Infinity, and non-positive values.
    if (!isFiniteNumber(inseam) || inseam <= 0) {
      e.inseamInches = "Enter a positive number for inseam.";
    }
  }

  // --- Shoe sizes — conditional on productPool; validated against exact whitelist ---

  const pool = p.productPool;
  if (pool === "menswear" || pool === "both") {
    if (!US_SHOE_SIZE_SET.has(p.mensShoeSizeUS)) {
      e.mensShoeSizeUS = "Select a men's US shoe size.";
    }
  }
  if (pool === "womenswear" || pool === "both") {
    if (!US_SHOE_SIZE_SET.has(p.womensShoeSizeUS)) {
      e.womensShoeSizeUS = "Select a women's US shoe size.";
    }
  }

  return e;
}

/** Returns validation errors for the given step index. */
export function validateStep(
  step: number,
  credentials: SetupCredentials,
  profile: ProfileDraft
): ValidationErrors {
  switch (step) {
    case 0:
      return validateCredentials(credentials);
    case 1:
      return validateDelivery(profile);
    case 2:
      return validateProductPool(profile.productPool);
    case 3:
      return validateSizing(profile);
    default:
      return {};
  }
}
