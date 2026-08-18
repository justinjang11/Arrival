import type { ProfileDraft, ValidationErrors } from "../types";
import { FormField } from "../FormField";

interface Props {
  profile: ProfileDraft;
  onChange: (field: keyof ProfileDraft, value: string) => void;
  errors: ValidationErrors;
}

export function SizingStep({ profile, onChange, errors }: Props) {
  return (
    <section aria-label="Sizing and fit">
      <h2 className="mb-6 text-xl font-semibold text-zinc-900">
        Sizing and fit
      </h2>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            id="height"
            label="Height"
            value={profile.height}
            onChange={(v) => onChange("height", v)}
            error={errors.height}
            placeholder="e.g., 5ft 10in"
          />
          <FormField
            id="weight"
            label="Weight"
            value={profile.weight}
            onChange={(v) => onChange("weight", v)}
            error={errors.weight}
            placeholder="e.g., 160 lb"
          />
        </div>
        <FormField
          id="referenceBrand"
          label="A brand you already shop"
          value={profile.referenceBrand}
          onChange={(v) => onChange("referenceBrand", v)}
          error={errors.referenceBrand}
          placeholder="e.g., Uniqlo"
        />
        <FormField
          id="referenceBrandSize"
          label="Your size in that brand"
          value={profile.referenceBrandSize}
          onChange={(v) => onChange("referenceBrandSize", v)}
          error={errors.referenceBrandSize}
          placeholder="e.g., M"
        />
        <div className="grid grid-cols-3 gap-4">
          <FormField
            id="topSize"
            label="Top size"
            value={profile.topSize}
            onChange={(v) => onChange("topSize", v)}
            error={errors.topSize}
            placeholder="e.g., M"
          />
          <FormField
            id="bottomSize"
            label="Bottom size (inches)"
            value={profile.bottomSize}
            onChange={(v) => onChange("bottomSize", v)}
            error={errors.bottomSize}
            placeholder="e.g., 32×30"
          />
          <FormField
            id="shoeSize"
            label="Shoe size (US)"
            value={profile.shoeSize}
            onChange={(v) => onChange("shoeSize", v)}
            error={errors.shoeSize}
            placeholder="e.g., 10"
          />
        </div>
      </div>
    </section>
  );
}
