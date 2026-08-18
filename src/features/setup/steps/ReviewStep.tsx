import type { ProfileDraft } from "../types";

type PoolOption = Exclude<ProfileDraft["productPool"], null>;

// Map product-pool values to display labels.
const POOL_LABELS: Record<PoolOption, string> = {
  menswear: "Menswear",
  womenswear: "Womenswear",
  both: "Both",
};

interface Props {
  /** From credentials — only email is passed; password is intentionally excluded. */
  email: string;
  profile: ProfileDraft;
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-zinc-100 py-2 last:border-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="max-w-xs break-words text-right text-sm text-zinc-900">
        {value}
      </span>
    </div>
  );
}

export function ReviewStep({ email, profile }: Props) {
  const address = [
    profile.addressLine1,
    profile.addressLine2,
    profile.city,
    profile.stateOrProvince,
    profile.zipOrPostalCode,
    profile.country,
  ]
    .filter(Boolean)
    .join(", ");

  // productPool is always non-null by the time ReviewStep is rendered
  // (validateProductPool blocks advancement if null).
  const poolDisplay =
    profile.productPool != null ? POOL_LABELS[profile.productPool] : "";

  // Height — structured display.
  const heightDisplay =
    profile.heightFeet && profile.heightInches !== ""
      ? `${profile.heightFeet} ft ${profile.heightInches} in`
      : profile.heightFeet
        ? `${profile.heightFeet} ft`
        : "";

  // Weight — only shown when provided.
  const weightDisplay = profile.weightLbs.trim()
    ? `${profile.weightLbs.trim()} lb`
    : "";

  // Reference brand + size — formatted according to the chosen system.
  let refBrandDisplay = "";
  if (profile.referenceBrand) {
    if (profile.refSizeSystem === "letter" && profile.refLetterSize) {
      refBrandDisplay = `${profile.referenceBrand} — Letter size ${profile.refLetterSize}`;
    } else if (profile.refSizeSystem === "numeric" && profile.refNumericSize) {
      refBrandDisplay = `${profile.referenceBrand} — Numeric size ${profile.refNumericSize}`;
    } else {
      refBrandDisplay = profile.referenceBrand;
    }
  }

  // Bottom — waist and inseam together.
  const bottomDisplay =
    profile.waistInches && profile.inseamInches
      ? `${profile.waistInches} in waist / ${profile.inseamInches} in inseam`
      : "";

  const pool = profile.productPool;

  return (
    <section aria-label="Review your information">
      <h2 className="mb-2 text-xl font-semibold text-zinc-900">
        Review your information
      </h2>
      <p className="mb-6 text-sm text-zinc-500">
        Check your details before submitting. Your password is not shown.
      </p>
      <div className="rounded-lg border border-zinc-200 px-4">
        <Row label="Email" value={email} />
        <Row label="Name" value={profile.fullName} />
        <Row label="Phone" value={profile.phone} />
        <Row label="Address" value={address} />
        <Row label="Products" value={poolDisplay} />
        <Row label="Height" value={heightDisplay} />
        {/* Weight is omitted when not provided (Row already handles empty values). */}
        <Row label="Weight" value={weightDisplay} />
        <Row label="Reference brand" value={refBrandDisplay} />
        <Row label="Top size" value={profile.topLetterSize} />
        <Row label="Bottom" value={bottomDisplay} />
        {(pool === "menswear" || pool === "both") && (
          <Row
            label="Men's US shoe size"
            value={profile.mensShoeSizeUS}
          />
        )}
        {(pool === "womenswear" || pool === "both") && (
          <Row
            label="Women's US shoe size"
            value={profile.womensShoeSizeUS}
          />
        )}
      </div>
    </section>
  );
}
