export function SavedOutfitsEmptyState() {
  return (
    <div>
      <header className="mb-8">
        <p className="mb-2 text-sm font-medium text-zinc-500">Saved Outfits</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Your saved outfits
        </h1>
      </header>

      <section
        aria-label="No saved outfits"
        className="rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center"
      >
        <h2 className="text-lg font-semibold text-zinc-900">
          No outfits have been saved yet.
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
          Saved outfits will appear here after outfit generation and saving are
          implemented. This prototype does not create sample outfits.
        </p>
      </section>
    </div>
  );
}