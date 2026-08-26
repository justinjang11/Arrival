import Image from "next/image";
import type { WishboneImageOption } from "./types";

interface Props {
  option: WishboneImageOption;
  selected: boolean;
  onSelect: () => void;
}

/**
 * A single selectable outfit card used by a Wishbone this-or-that round.
 *
 * A real <button type="button"> so it is keyboard accessible by default;
 * exposes selection state via aria-pressed and a visible border/check
 * indicator rather than relying on color alone.
 */
export function ImageChoiceCard({ option, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        "relative aspect-[3/4] w-full overflow-hidden rounded-lg border-2 transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2",
        selected ? "border-zinc-900" : "border-zinc-200 hover:border-zinc-400",
      ].join(" ")}
    >
      <Image
        src={option.src}
        alt={option.alt}
        fill
        sizes="(min-width: 640px) 50vw, 100vw"
        className="object-cover"
      />
      {selected && (
        <span
          aria-hidden="true"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white shadow"
        >
          ✓
        </span>
      )}
    </button>
  );
}
