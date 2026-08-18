/**
 * TypeScript types for the account-creation and profile-setup flow.
 *
 * TEMPORARY: All state is non-persistent React state. Data is lost on page
 * refresh or close. Supabase persistence and real authentication are not
 * implemented in this task.
 */

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
 */
export interface ProfileDraft {
  // --- Delivery and contact (MVP-ONB-001) ---
  fullName: string;
  /**
   * TEMPORARY ASSUMPTION: any non-empty string is accepted.
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

  // --- Sizing and fit (MVP-ONB-001) ---
  /**
   * TEMPORARY ASSUMPTION: free-text, non-empty.
   * Exact unit format (imperial / metric) is not specified by the
   * product specification at this stage.
   */
  height: string;
  /**
   * TEMPORARY ASSUMPTION: free-text, non-empty.
   * Exact unit format is not specified at this stage.
   */
  weight: string;
  /** A brand the user already shops (MVP-ONB-001). */
  referenceBrand: string;
  /** The user's size in that reference brand. */
  referenceBrandSize: string;
  /**
   * Standard letter sizing where applicable (S, M, L, XL, …).
   * TEMPORARY ASSUMPTION: free-text; no strict letter-only enforcement.
   */
  topSize: string;
  /**
   * Inch sizing where applicable (e.g., 32×30).
   * TEMPORARY ASSUMPTION: free-text; no strict format enforcement.
   */
  bottomSize: string;
  /**
   * US sizing. EU translation handled behind the scenes when required (spec).
   * TEMPORARY ASSUMPTION: free-text; no strict numeric enforcement.
   */
  shoeSize: string;
}

/** Per-field validation errors keyed by field name. */
export type ValidationErrors = Partial<
  Record<keyof SetupCredentials | keyof ProfileDraft, string>
>;

/** Step index in the setup flow (0 = Credentials … 4 = Review). */
export type SetupStepIndex = 0 | 1 | 2 | 3 | 4;
