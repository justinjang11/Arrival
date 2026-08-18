import type { ProfileDraft, ValidationErrors } from "../types";

type PoolOption = Exclude<ProfileDraft["productPool"], null>;

interface Props {
  profile: ProfileDraft;
  onChange: (field: keyof ProfileDraft, value: string) => void;
  errors: ValidationErrors;
}

const OPTIONS: { value: PoolOption; label: string }[] = [
  { value: "menswear", label: "Menswear" },
  { value: "womenswear", label: "Womenswear" },
  { value: "both", label: "Both" },
];

export function ProductPoolStep({ profile, onChange, errors }: Props) {
  return (
    <section aria-label="Product preference">
      <h2 className="mb-2 text-xl font-semibold text-zinc-900">
        Which products should Arrival shop?
      </h2>
      {/* MVP-ONB-001: must not use gender/gender-identity language */}
      <p className="mb-6 text-sm text-zinc-500">
        This controls which product pools Arrival may recommend. You can update
        it later in your profile.
      </p>
      <fieldset aria-describedby={errors.productPool ? "productPool-error" : undefined}>
        <legend className="sr-only">Product pool preference</legend>
        <div className="flex flex-col gap-3">
          {OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className={[
                "flex cursor-pointer items-center gap-3 rounded-lg border p-4",
                profile.productPool === value
                  ? "border-zinc-900 bg-zinc-50"
                  : "border-zinc-200 hover:border-zinc-400",
              ].join(" ")}
            >
              <input
                type="radio"
                name="productPool"
                value={value}
                checked={profile.productPool === value}
                onChange={() => onChange("productPool", value)}
                className="h-4 w-4 accent-zinc-900"
              />
              <span className="text-sm font-medium text-zinc-900">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {errors.productPool && (
        <p
          id="productPool-error"
          role="alert"
          className="mt-2 text-xs text-red-600"
        >
          {errors.productPool}
        </p>
      )}
    </section>
  );
}
