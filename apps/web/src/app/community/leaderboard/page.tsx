import { CommunityShell } from "@/components/community/community-shell";
import { getLeaderboard } from "@/lib/api";

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard();

  return (
    <CommunityShell
      title="Leaderboard"
      subtitle="XP is tracked deterministically and updates in real time, but automatic role promotion stays out of Phase 1."
    >
      <section className="rail-card">
        {leaderboard.length > 0 ? (
          <ul className="simple-list">
            {leaderboard.map((entry) => (
              <li key={entry.id}>
                <span>{entry.rank}. {entry.name}</span>
                <span>{entry.xp.toLocaleString()} XP</span>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <h2>Leaderboard not populated</h2>
            <p>Wire XP ledger aggregation into /api/v1/leaderboard to show contributor rankings.</p>
          </>
        )}
      </section>
    </CommunityShell>
  );
}
