import type { Metadata } from "next";
import { SetupFlow } from "@/features/setup/SetupFlow";

export const metadata: Metadata = {
  title: "Set up Arrival",
};

/**
 * /setup — account-creation and initial profile-setup page.
 *
 * The existing landing page at / is unchanged.
 * This route renders a fully client-side, non-persistent setup flow.
 */
export default function SetupPage() {
  return <SetupFlow />;
}
