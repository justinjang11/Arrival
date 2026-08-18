interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  stepLabels,
}: ProgressIndicatorProps) {
  return (
    <div className="mb-8">
      <p className="mb-3 text-sm text-zinc-500">
        Step {currentStep + 1} of {totalSteps}
        {" — "}
        <span className="font-medium text-zinc-900">
          {stepLabels[currentStep]}
        </span>
      </p>
      <ol aria-label="Setup progress" className="flex gap-1.5">
        {stepLabels.map((label, i) => (
          <li
            key={label}
            aria-current={i === currentStep ? "step" : undefined}
            className="flex-1"
          >
            <div
              className={[
                "h-1.5 rounded-full transition-colors",
                i <= currentStep ? "bg-zinc-900" : "bg-zinc-200",
              ].join(" ")}
              title={label}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
