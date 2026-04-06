import { CommunityShell } from "@/components/community/community-shell";

const actions = [
  "Review reports",
  "Pin or unpin posts",
  "Lock or unlock discussion",
  "Soft delete and restore posts",
  "Mute or ban users",
  "Inspect audit logs",
];

export default function ModerationPage() {
  return (
    <CommunityShell
      title="Moderation"
      subtitle="Phase 1 ships manual moderation only. Automated moderation and AI review are explicitly deferred."
    >
      <section className="rail-card">
        <ul className="simple-list">
          {actions.map((action) => (
            <li key={action}>
              <span>{action}</span>
              <span>manual</span>
            </li>
          ))}
        </ul>
      </section>
    </CommunityShell>
  );
}
