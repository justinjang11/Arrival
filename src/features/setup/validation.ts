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
 *   Sizing formats (height, weight, topSize, bottomSize, shoeSize):
 *     Free-text, non-empty values are accepted. The specification references
 *     standard letter sizing, inch sizing, and US shoe sizing as guidance
 *     but does not define exact validation rules or units at this stage.
 *
 *   Address validation:
 *     No international address format validation is applied. Required fields
 *     must be non-empty; address line 2 is always optional.
 */

import type { SetupCredentials, ProfileDraft, ValidationErrors } from "./types";

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

export function validateSizing(p: ProfileDraft): ValidationErrors {
  const e: ValidationErrors = {};
  // TEMPORARY ASSUMPTION: free-text, non-empty — see file-level comment.
  if (!p.height.trim()) e.height = "Height is required.";
  if (!p.weight.trim()) e.weight = "Weight is required.";
  if (!p.referenceBrand.trim()) e.referenceBrand = "Reference brand is required.";
  if (!p.referenceBrandSize.trim())
    e.referenceBrandSize = "Reference brand size is required.";
  if (!p.topSize.trim()) e.topSize = "Top size is required.";
  if (!p.bottomSize.trim()) e.bottomSize = "Bottom size is required.";
  if (!p.shoeSize.trim()) e.shoeSize = "Shoe size (US) is required.";
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
