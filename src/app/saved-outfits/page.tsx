import { ProtectedApplicationPage } from "@/features/app-shell/ProtectedApplicationPage";
import { SavedOutfitsEmptyState } from "@/features/saved-outfits/SavedOutfitsEmptyState";

export default function SavedOutfitsPage() {
  return (
    <ProtectedApplicationPage>
      <SavedOutfitsEmptyState />
    </ProtectedApplicationPage>
  );
}