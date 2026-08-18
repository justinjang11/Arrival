/**
 * TypeScript types for the account-creation and profile-setup flow.
 *
 * TEMPORARY: All state is non-persistent React state. Data is lost on page
 * refresh or close. Supabase persistence and real authentication are not
 * implemented in this task.
 */

/** Standard letter sizes used for top-size and reference-brand-letter-size dropdowns. */
export type LetterSize =
  | "XXS"
  | "XS"
  | "S"
  | "M"
  | "L"
  | "XL"
  | "XXL"
  | "XXXL"
  | "";

/**
 * Whether the reference brand uses a letter or numeric size system.
 * Empty string means no system has been selected yet.
 */
export type RefSizeSystem = "letter" | "numeric" | "";

/**
 * Temporary account credentials.
 *
 * The password must never enter the completed profile object, be logged,
 * stored, or displayed after the form is submitted.
 */
export interface SetupCredentials {
  email: string;
  /**
   * TEMPORARY ASSUMPTION: any non-empty value is accepted.
   * The product specification does not define a final password policy.
   * This field is cleared immediately after form submission and is
   * enforced by Supabase Auth when real authentication is connected.
   */
  password: string;
}

/**
 * All editable profile fields collected during setup.
 *
 * Intentionally separated from SetupCredentials so the password never
 * enters this object. Structured for reuse by a future Account editing
 * screen.
 *
 * Numeric sizing fields are stored as strings while the user is editing
 * (to allow partial input such as an empty box or a leading minus sign)
 * and are validated as numbers when Continue is clicked.
 */
export interface ProfileDraft {
  // --- Delivery and contact (MVP-ONB-001) ---
  fullName: string;
  /**
   * TEMPORARY ASSUMPTION: prototype phone validation only.
   * The specification requires a valid phone number but does not define
   * a format, country code, or international validation rule at this stage.
   */
  phone: string;
  addressLine1: string;
  /** Optional — may remain empty (MVP-ONB-001 acceptance criterion). */
  addressLine2: string;
  city: string;
  stateOrProvince: string;
  zipOrPostalCode: string;
  country: string;

  // --- Product-pool preference (MVP-ONB-001) ---
  /**
   * Controls which product pools Arrival may recommend.
   * Must not be described as the user's gender or gender identity.
   * Label: "Which products should Arrival shop?"
   *
   * null = no selection made yet. The user must choose explicitly; the flow
   * provides no default to ensure the preference is always deliberately set.
   */
  productPool: "menswear" | "womenswear" | "both" | null;

  // --- Height (MVP-ONB-001, structured) ---
  /** Feet portion of height. Required; must be a positive whole number. */
  heightFeet: string;
  /**
   * Inches portion of height. Required; must be a whole number from 0 to 11.
   * "0" is a valid entry (e.g., exactly 5 ft 0 in).
   */
  heightInches: string;

  // --- Weight (MVP-ONB-001, optional) ---
  /**
   * Weight in pounds. Optional; if provided must be a positive number.
   * An empty string means the user left weight blank.
   */
  weightLbs: string;

  // --- Reference brand and size (MVP-ONB-001) ---
  /** A brand the user already shops (free text). */
  referenceBrand: string;
  /**
   * Whether the reference brand uses a letter-size or numeric-size system.
   * The user must choose before the applicable size field is shown.
   * Empty string means no selection has been made.
   */
  refSizeSystem: RefSizeSystem;
  /**
   * User's letter size in the reference brand.
   * Relevant only when refSizeSystem === "letter".
   * Empty string means no size has been selected.
   */
  refLetterSize: LetterSize;
  /**
   * User's numeric size in the reference brand.
   * Relevant only when refSizeSystem === "numeric".
   * Non-negative value; zero is permitted (some apparel systems include size 0).
   */
  refNumericSize: string;

  // --- Standard sizes (MVP-ONB-001, structured) ---
  /** Top size selected from a letter-size dropdown. Empty string = not selected. */
  topLetterSize: LetterSize;
  /** Waist measurement in inches. Required; must be a positive number. */
  waistInches: string;
  /** Inseam measurement in inches. Required; must be a positive number. */
  inseamInches: string;

  // --- Shoe sizes (MVP-ONB-001, conditional on productPool) ---
  /**
   * Men's US shoe size selected from a dropdown (3–18 in half-size increments).
   * Required when productPool is "menswear" or "both". Empty string = not selected.
   */
  mensShoeSizeUS: string;
  /**
   * Women's US shoe size selected from a dropdown (3–18 in half-size increments).
   * Required when productPool is "womenswear" or "both". Empty string = not selected.
   */
  womensShoeSizeUS: string;
}

/** Per-field validation errors keyed by field name. */
export type ValidationErrors = Partial<
  Record<keyof SetupCredentials | keyof ProfileDraft, string>
>;

/** Step index in the setup flow (0 = Credentials … 4 = Review). */
export type SetupStepIndex = 0 | 1 | 2 | 3 | 4;
