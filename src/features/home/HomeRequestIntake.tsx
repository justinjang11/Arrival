"use client";

import { useState, type FormEvent } from "react";
import { useArrivalSession } from "@/features/app-session/ArrivalSessionContext";
import {
  createShoppingRequest,
  validateShoppingRequest,
  type ShoppingRequestDraft,
  type ShoppingRequestErrors,
} from "./validation";

const EMPTY_REQUEST: ShoppingRequestDraft = {
  shoppingFor: "",
  totalOutfitBudget: "",
  needBy: "",
};

export function HomeRequestIntake() {
  const { session, submitShoppingRequest } = useArrivalSession();
  const [draft, setDraft] = useState<ShoppingRequestDraft>(EMPTY_REQUEST);
  const [errors, setErrors] = useState<ShoppingRequestErrors>({});

  const updateField = (field: keyof ShoppingRequestDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateShoppingRequest(draft);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    submitShoppingRequest(createShoppingRequest(draft));
    setErrors({});
  };

  const submittedRequest = session?.shoppingRequest;

  return (
    <div>
      <header className="mb-8">
        <p className="mb-2 text-sm font-medium text-zinc-500">Home</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          What can we help you dress for?
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
          Share the occasion, your total outfit budget, and your delivery
          deadline.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6 rounded-xl border border-zinc-200 p-5 sm:p-6"
      >
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="shopping-for"
            className="text-sm font-medium text-zinc-700"
          >
            What are you shopping for?
          </label>
          <textarea
            id="shopping-for"
            name="shoppingFor"
            rows={4}
            value={draft.shoppingFor}
            onChange={(event) =>
              updateField("shoppingFor", event.target.value)
            }
            aria-invalid={errors.shoppingFor ? true : undefined}
            aria-describedby={
              errors.shoppingFor ? "shopping-for-error" : undefined
            }
            className={[
              "resize-y rounded-md border px-3 py-2 text-sm text-zinc-900",
              "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1",
              errors.shoppingFor ? "border-red-500" : "border-zinc-300",
            ].join(" ")}
          />
          {errors.shoppingFor && (
            <p
              id="shopping-for-error"
              role="alert"
              className="text-xs text-red-600"
            >
              {errors.shoppingFor}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="total-outfit-budget"
            className="text-sm font-medium text-zinc-700"
          >
            Total outfit budget
          </label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-zinc-500"
            >
              $
            </span>
            <input
              id="total-outfit-budget"
              name="totalOutfitBudget"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={draft.totalOutfitBudget}
              onChange={(event) =>
                updateField("totalOutfitBudget", event.target.value)
              }
              aria-invalid={errors.totalOutfitBudget ? true : undefined}
              aria-describedby={
                errors.totalOutfitBudget
                  ? "total-outfit-budget-error"
                  : "total-outfit-budget-help"
              }
              className={[
                "w-full rounded-md border py-2 pl-7 pr-3 text-sm text-zinc-900",
                "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1",
                errors.totalOutfitBudget
                  ? "border-red-500"
                  : "border-zinc-300",
              ].join(" ")}
            />
          </div>
          <p id="total-outfit-budget-help" className="text-xs text-zinc-500">
            Hard maximum for the complete outfit.
          </p>
          {errors.totalOutfitBudget && (
            <p
              id="total-outfit-budget-error"
              role="alert"
              className="text-xs text-red-600"
            >
              {errors.totalOutfitBudget}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="need-by"
            className="text-sm font-medium text-zinc-700"
          >
            Need it by
          </label>
          <input
            id="need-by"
            name="needBy"
            type="date"
            value={draft.needBy}
            onChange={(event) => updateField("needBy", event.target.value)}
            aria-invalid={errors.needBy ? true : undefined}
            aria-describedby={errors.needBy ? "need-by-error" : undefined}
            className={[
              "rounded-md border px-3 py-2 text-sm text-zinc-900",
              "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1",
              errors.needBy ? "border-red-500" : "border-zinc-300",
            ].join(" ")}
          />
          {errors.needBy && (
            <p id="need-by-error" role="alert" className="text-xs text-red-600">
              {errors.needBy}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1"
        >
          Submit request
        </button>
      </form>

      {submittedRequest && (
        <section
          aria-label="Submitted shopping request"
          aria-live="polite"
          className="mt-8 rounded-xl bg-zinc-100 p-5 sm:p-6"
        >
          <h2 className="text-lg font-semibold text-zinc-900">
            Request received
          </h2>
          <dl className="mt-4 divide-y divide-zinc-200">
            <div className="py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                What are you shopping for?
              </dt>
              <dd className="mt-1 text-sm text-zinc-900">
                {submittedRequest.shoppingFor}
              </dd>
            </div>
            <div className="py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Total outfit budget
              </dt>
              <dd className="mt-1 text-sm text-zinc-900">
                ${submittedRequest.totalOutfitBudget.toFixed(2)}
              </dd>
            </div>
            <div className="py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Need it by
              </dt>
              <dd className="mt-1 text-sm text-zinc-900">
                {submittedRequest.needBy}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm leading-6 text-zinc-600">
            Outfit generation and retailer matching are not implemented yet.
            No products were searched.
          </p>
        </section>
      )}
    </div>
  );
}