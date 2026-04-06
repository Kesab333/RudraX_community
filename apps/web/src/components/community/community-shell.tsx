import Link from "next/link";
import type { ReactNode } from "react";
import { MaintenanceBanner } from "./maintenance-banner";
import { RealtimeStatus } from "./realtime-status";

interface CommunityShellProps {
  title: string;
  subtitle: string;
  rightRail?: ReactNode;
  children: ReactNode;
  maintenanceMode?: boolean;
}

const categories = [
  "physics",
  "chemistry",
  "mathematics",
  "simulations",
  "research",
  "projects",
  "general",
  "announcements",
  "support",
];

export function CommunityShell({
  title,
  subtitle,
  rightRail,
  children,
  maintenanceMode = false,
}: CommunityShellProps) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">RX</div>
          <div>
            <div className="brand-title">RudraX Community</div>
            <div className="brand-subtitle">PhysicX | ChemistrY | MathematicX</div>
          </div>
        </div>
        <nav className="product-nav" aria-label="Products">
          <span>PhysicX</span>
          <span>ChemistrY</span>
          <span>MathematicX</span>
        </nav>
        <div className="topbar-meta">
          <RealtimeStatus />
          <div className="user-pill">
            <span className="avatar">RX</span>
            <span>Auth not wired</span>
          </div>
        </div>
      </header>

      {maintenanceMode ? <MaintenanceBanner /> : null}

      <div className="layout-root">
        <aside className="left-rail">
          <div className="rail-card">
            <h2>Navigation</h2>
            <nav className="rail-nav">
              <Link href="/community">Feed</Link>
              <Link href="/community/compose">Compose</Link>
              <Link href="/community/notifications">Notifications</Link>
              <Link href="/community/leaderboard">Leaderboard</Link>
              <Link href="/community/mod">Moderation</Link>
            </nav>
          </div>
          <div className="rail-card">
            <h2>Categories</h2>
            <div className="chip-list">
              {categories.map((category) => (
                <span className="chip" key={category}>
                  {category}
                </span>
              ))}
            </div>
          </div>
          <div className="rail-card">
            <h2>Profile</h2>
            <p>Session unavailable</p>
            <p className="muted">Wire auth and /api/v1/users/me</p>
            <p className="metric">0 XP</p>
          </div>
        </aside>

        <main className="main-column">
          <div className="section-heading">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
        </main>

        <aside className="right-rail">
          <div className="rail-card">
            <h2>Community Pulse</h2>
            <div className="stats-grid">
              <div>
                <strong>0</strong>
                <span>Members</span>
              </div>
              <div>
                <strong>0</strong>
                <span>Posts</span>
              </div>
              <div>
                <strong>0</strong>
                <span>Online</span>
              </div>
              <div>
                <strong>0</strong>
                <span>Today</span>
              </div>
            </div>
          </div>
          <div className="rail-card">
            <h2>Trending</h2>
            <p className="muted">No live trends yet. Wire search analytics and post activity.</p>
          </div>
          {rightRail}
        </aside>
      </div>
    </div>
  );
}
