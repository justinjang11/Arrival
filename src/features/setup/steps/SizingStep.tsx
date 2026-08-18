import type { ProfileDraft, ValidationErrors } from "../types";
import { FormField } from "../FormField";
import { LETTER_SIZES, US_SHOE_SIZES } from "../sizingConstants";

// ---------------------------------------------------------------------------
// Local select component (native <select>, no added library)
// ---------------------------------------------------------------------------

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  options: readonly string[];
  optional?: boolean;
}

function SelectField({
  id,
  label,
  value,
  onChange,
  error,
  options,
  optional = false,
}: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-zinc-700">
        {label}
        {optional && (
          <span className="ml-1 text-xs font-normal text-zinc-400">
            (optional)
          </span>
        )}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={!optional}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={error ? true : undefined}
        className={[
          "rounded-md border bg-white px-3 py-2 text-sm text-zinc-900",
          "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1",
          error ? "border-red-500" : "border-zinc-300",
        ].join(" ")}
      >
        <option value="">Select…</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SizingStep
// ---------------------------------------------------------------------------

interface Props {
  profile: ProfileDraft;
  onChange: (field: keyof ProfileDraft, value: string) => void;
  errors: ValidationErrors;
}

export function SizingStep({ profile, onChange, errors }: Props) {
  const pool = profile.productPool;

  return (
    <section aria-label="Sizing and fit">
      <h2 className="mb-6 text-xl font-semibold text-zinc-900">
        Sizing and fit
      </h2>
      <div className="flex flex-col gap-5">

        {/* Height — two adjacent numeric fields */}
        <fieldset className="flex flex-col gap-1">
          <legend className="text-sm font-medium text-zinc-700">Height</legend>
          <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="heightFeet"
              label="Feet"
              value={profile.heightFeet}
              onChange={(v) => onChange("heightFeet", v)}
              error={errors.heightFeet}
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              placeholder="e.g., 5"
            />
            <FormField
              id="heightInches"
              label="Inches"
              value={profile.heightInches}
              onChange={(v) => onChange("heightInches", v)}
              error={errors.heightInches}
              type="number"
              inputMode="numeric"
              min={0}
              max={11}
              step={1}
              placeholder="0–11"
            />
          </div>
        </fieldset>

        {/* Weight — optional */}
        <FormField
          id="weightLbs"
          label="Weight (lb)"
          value={profile.weightLbs}
          onChange={(v) => onChange("weightLbs", v)}
          error={errors.weightLbs}
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          placeholder="e.g., 155"
          optional
        />

        {/* Reference brand */}
        <FormField
          id="referenceBrand"
          label="A brand you already shop"
          value={profile.referenceBrand}
          onChange={(v) => onChange("referenceBrand", v)}
          error={errors.referenceBrand}
          placeholder="e.g., Uniqlo"
        />

        {/* Reference-brand size system + conditional size input */}
        <fieldset
          className="flex flex-col gap-2 rounded-md border border-zinc-200 p-3"
          aria-describedby={
            errors.refSizeSystem ? "refSizeSystem-error" : undefined
          }
        >
          <legend className="px-1 text-sm font-medium text-zinc-700">
            Your size in that brand
          </legend>

          {/* Stack on mobile, two columns at sm */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
              <input
                type="radio"
                name="refSizeSystem"
                value="letter"
                checked={profile.refSizeSystem === "letter"}
                onChange={() => onChange("refSizeSystem", "letter")}
                className="accent-zinc-900"
              />
              Letter size
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
              <input
                type="radio"
                name="refSizeSystem"
                value="numeric"
                checked={profile.refSizeSystem === "numeric"}
                onChange={() => onChange("refSizeSystem", "numeric")}
                className="accent-zinc-900"
              />
              Numeric size
            </label>
          </div>

          {errors.refSizeSystem && (
            <p
              id="refSizeSystem-error"
              role="alert"
              className="text-xs text-red-600"
            >
              {errors.refSizeSystem}
            </p>
          )}

          {profile.refSizeSystem === "letter" && (
            <SelectField
              id="refLetterSize"
              label="Brand letter size"
              value={profile.refLetterSize}
              onChange={(v) => onChange("refLetterSize", v)}
              error={errors.refLetterSize}
              options={LETTER_SIZES}
            />
          )}

          {profile.refSizeSystem === "numeric" && (
            <FormField
              id="refNumericSize"
              label="Brand numeric size"
              value={profile.refNumericSize}
              onChange={(v) => onChange("refNumericSize", v)}
              error={errors.refNumericSize}
              type="number"
              inputMode="numeric"
              min={0}
              step={0.5}
              placeholder="e.g., 32"
            />
          )}
        </fieldset>

        {/* Top size */}
        <SelectField
          id="topLetterSize"
          label="Top size"
          value={profile.topLetterSize}
          onChange={(v) => onChange("topLetterSize", v)}
          error={errors.topLetterSize}
          options={LETTER_SIZES}
        />

        {/* Bottom sizing — waist and inseam */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            id="waistInches"
            label="Waist (in)"
            value={profile.waistInches}
            onChange={(v) => onChange("waistInches", v)}
            error={errors.waistInches}
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            placeholder="e.g., 32"
          />
          <FormField
            id="inseamInches"
            label="Inseam (in)"
            value={profile.inseamInches}
            onChange={(v) => onChange("inseamInches", v)}
            error={errors.inseamInches}
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            placeholder="e.g., 30"
          />
        </div>

        {/* Shoe size(s) — conditional on product pool */}
        {(pool === "menswear" || pool === "both") && (
          <SelectField
            id="mensShoeSizeUS"
            label="Men's US shoe size"
            value={profile.mensShoeSizeUS}
            onChange={(v) => onChange("mensShoeSizeUS", v)}
            error={errors.mensShoeSizeUS}
            options={US_SHOE_SIZES}
          />
        )}
        {(pool === "womenswear" || pool === "both") && (
          <SelectField
            id="womensShoeSizeUS"
            label="Women's US shoe size"
            value={profile.womensShoeSizeUS}
            onChange={(v) => onChange("womensShoeSizeUS", v)}
            error={errors.womensShoeSizeUS}
            options={US_SHOE_SIZES}
          />
        )}
      </div>
    </section>
  );
}
