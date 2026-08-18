/**
 * Labeled form field with inline error display.
 *
 * Shared between the setup flow and, in the future, the Account editing
 * screen. Not a full component library — keep it minimal.
 */

import type { InputHTMLAttributes } from "react";

interface FormFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "id"> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  /** When true, renders an "(optional)" suffix and omits the required attribute. */
  optional?: boolean;
}

export function FormField({
  id,
  label,
  value,
  onChange,
  error,
  optional = false,
  type = "text",
  ...rest
}: FormFieldProps) {
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
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={!optional}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={error ? true : undefined}
        className={[
          "rounded-md border px-3 py-2 text-sm text-zinc-900",
          "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1",
          error ? "border-red-500" : "border-zinc-300",
        ].join(" ")}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
