import type { SetupCredentials, ValidationErrors } from "../types";
import { FormField } from "../FormField";

interface Props {
  credentials: SetupCredentials;
  onChange: (field: keyof SetupCredentials, value: string) => void;
  errors: ValidationErrors;
}

export function CredentialsStep({ credentials, onChange, errors }: Props) {
  return (
    <section aria-label="Account credentials">
      <h2 className="mb-6 text-xl font-semibold text-zinc-900">
        Create your account
      </h2>
      <div className="flex flex-col gap-4">
        <FormField
          id="email"
          label="Email address"
          type="email"
          value={credentials.email}
          onChange={(v) => onChange("email", v)}
          error={errors.email}
          autoComplete="email"
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          value={credentials.password}
          onChange={(v) => onChange("password", v)}
          error={errors.password}
          autoComplete="new-password"
        />
      </div>
    </section>
  );
}
