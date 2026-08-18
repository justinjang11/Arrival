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
        <Row label="Height" value={profile.height} />
        <Row label="Weight" value={profile.weight} />
        <Row label="Reference brand" value={profile.referenceBrand} />
        <Row label="Brand size" value={profile.referenceBrandSize} />
        <Row label="Top size" value={profile.topSize} />
        <Row label="Bottom size" value={profile.bottomSize} />
        <Row label="Shoe size (US)" value={profile.shoeSize} />
      </div>
    </section>
  );
}
