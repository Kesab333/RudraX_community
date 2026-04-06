import { CommunityShell } from "@/components/community/community-shell";
import { ComposeForm } from "@/components/community/compose-form";
import { PostCard } from "@/components/community/post-card";
import { getCommunityFeed, getLeaderboard, isMaintenanceModeEnabled } from "@/lib/api";

export default async function CommunityPage() {
  const [feed, leaderboard] = await Promise.all([getCommunityFeed(), getLeaderboard()]);

  return (
    <CommunityShell
      title="Community Hub"
      subtitle="Connect, collaborate, and compute with the global scientific community."
      maintenanceMode={isMaintenanceModeEnabled()}
      rightRail={
        <div className="rail-card">
          <h2>Top contributors</h2>
          {leaderboard.length > 0 ? (
            <ul className="simple-list">
              {leaderboard.slice(0, 5).map((entry) => (
                <li key={entry.id}>
                  <span>{entry.rank}. {entry.name}</span>
                  <span>{entry.xp.toLocaleString()} XP</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Wire /api/v1/leaderboard after XP aggregation is connected.</p>
          )}
        </div>
      }
    >
      <ComposeForm
        heading="Create a draft"
        description="Drafts, private posts, and published posts all begin from the same collaboration editor."
      />
      {feed.data.length > 0 ? (
        <section className="feed-list">
          {feed.data.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      ) : (
        <section className="rail-card">
          <h2>No live posts yet</h2>
          <p>Wire /api/v1/posts and publish the first post to populate the feed.</p>
        </section>
      )}
    </CommunityShell>
  );
}
