import type { ProfileDraft, ValidationErrors } from "../types";
import { FormField } from "../FormField";

interface Props {
  profile: ProfileDraft;
  onChange: (field: keyof ProfileDraft, value: string) => void;
  errors: ValidationErrors;
}

export function DeliveryStep({ profile, onChange, errors }: Props) {
  return (
    <section aria-label="Delivery information">
      <h2 className="mb-2 text-xl font-semibold text-zinc-900">
        Delivery information
      </h2>
      {/* Required helper copy — MVP-ONB-001 */}
      <p className="mb-6 text-sm text-zinc-500">
        Used to prepare retailer checkouts. Arrival never completes a purchase
        without your review.
      </p>
      <div className="flex flex-col gap-4">
        <FormField
          id="fullName"
          label="Full name"
          value={profile.fullName}
          onChange={(v) => onChange("fullName", v)}
          error={errors.fullName}
          autoComplete="name"
        />
        <FormField
          id="phone"
          label="Phone number"
          type="tel"
          value={profile.phone}
          onChange={(v) => onChange("phone", v)}
          error={errors.phone}
          autoComplete="tel"
        />
        <FormField
          id="addressLine1"
          label="Address line 1"
          value={profile.addressLine1}
          onChange={(v) => onChange("addressLine1", v)}
          error={errors.addressLine1}
          autoComplete="address-line1"
        />
        <FormField
          id="addressLine2"
          label="Address line 2"
          value={profile.addressLine2}
          onChange={(v) => onChange("addressLine2", v)}
          error={errors.addressLine2}
          optional
          autoComplete="address-line2"
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            id="city"
            label="City"
            value={profile.city}
            onChange={(v) => onChange("city", v)}
            error={errors.city}
            autoComplete="address-level2"
          />
          <FormField
            id="stateOrProvince"
            label="State or province"
            value={profile.stateOrProvince}
            onChange={(v) => onChange("stateOrProvince", v)}
            error={errors.stateOrProvince}
            autoComplete="address-level1"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            id="zipOrPostalCode"
            label="ZIP or postal code"
            value={profile.zipOrPostalCode}
            onChange={(v) => onChange("zipOrPostalCode", v)}
            error={errors.zipOrPostalCode}
            autoComplete="postal-code"
          />
          <FormField
            id="country"
            label="Country"
            value={profile.country}
            onChange={(v) => onChange("country", v)}
            error={errors.country}
            autoComplete="country-name"
          />
        </div>
      </div>
    </section>
  );
}
