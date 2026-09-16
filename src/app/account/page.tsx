import { AccountSummary } from "@/features/account/AccountSummary";
import { ProtectedApplicationPage } from "@/features/app-shell/ProtectedApplicationPage";

export default function AccountPage() {
  return (
    <ProtectedApplicationPage>
      <AccountSummary />
    </ProtectedApplicationPage>
  );
}