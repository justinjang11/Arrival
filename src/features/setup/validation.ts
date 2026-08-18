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
 *     Any non-empty string is accepted. The specification requires a valid
 *     phone number but does not define format, country code, or international
 *     validation rules at this stage.
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
// ProfileDraft is used by validateDelivery, validateSizing, and validateStep.

/**
 * Minimal email pattern — rejects obvious invalids without attempting full
 * RFC 5321 compliance.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  // TEMPORARY ASSUMPTION: any non-empty phone accepted — see file-level comment.
  if (!p.phone.trim()) e.phone = "Phone number is required.";
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

export function validateProductPool(): ValidationErrors {
  // Product pool always has a valid default selection; no validation needed.
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
      return validateProductPool();
    case 3:
      return validateSizing(profile);
    default:
      return {};
  }
}
