import { CommunityShell } from "@/components/community/community-shell";
import { ComposeForm } from "@/components/community/compose-form";
import { isMaintenanceModeEnabled } from "@/lib/api";

export default function ComposePage() {
  return (
    <CommunityShell
      title="Compose"
      subtitle="Create a scientific discussion, question, project, simulation, research paper, bug report, or announcement."
      maintenanceMode={isMaintenanceModeEnabled()}
    >
      <ComposeForm
        heading="New community draft"
        description="Publishing is deliberate. Start with a draft, review the content, then publish when it is ready."
      />
    </CommunityShell>
  );
}
