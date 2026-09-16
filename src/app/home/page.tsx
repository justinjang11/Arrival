import { ProtectedApplicationPage } from "@/features/app-shell/ProtectedApplicationPage";
import { HomeRequestIntake } from "@/features/home/HomeRequestIntake";

export default function HomePage() {
  return (
    <ProtectedApplicationPage>
      <HomeRequestIntake />
    </ProtectedApplicationPage>
  );
}