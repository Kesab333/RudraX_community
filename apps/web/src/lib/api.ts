import type {
  CommunityCommentSummary,
  CommunityPostSummary,
  CursorPage,
} from "@rudrax/shared";

const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_ORIGIN ??
  process.env.API_ORIGIN ??
  "http://localhost:4000";

interface NotificationSummary {
  id: string;
  type: string;
  message: string;
  metadata?: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  role: string;
  xp: number;
  avatarUrl: string | null;
}

interface ShareDraftPayload {
  token: string;
  sourceProduct: string;
  category: string;
  postType: string;
  title: string | null;
  content: string;
  tags: string[];
  attachmentIds: string[];
  expiresAt: string;
}

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_ORIGIN}${path}`, {
      cache: "no-store",
      headers: {
        "X-Request-ID": crypto.randomUUID(),
      },
    });

    if (!response.ok) {
      return fallback;
    }

    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function getCommunityFeed(): Promise<CursorPage<CommunityPostSummary>> {
  return fetchJson("/api/v1/posts", {
    data: [],
    nextCursor: null,
    limit: 20,
  });
}

export async function getPostBySlug(slug: string): Promise<CommunityPostSummary | null> {
  return fetchJson(`/api/v1/posts/slug/${slug}`, null);
}

export async function getCommentsForPostId(postId: string): Promise<CommunityCommentSummary[]> {
  const response = await fetchJson<CursorPage<CommunityCommentSummary>>(
    `/api/v1/comments/post/${postId}`,
    {
      data: [],
      nextCursor: null,
      limit: 20,
    },
  );

  return response.data;
}

export async function getNotifications(): Promise<NotificationSummary[]> {
  return fetchJson("/api/v1/notifications", []);
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  return fetchJson("/api/v1/leaderboard", []);
}

export async function getShareDraft(token: string): Promise<ShareDraftPayload | null> {
  return fetchJson(`/api/v1/integrations/share/${token}`, null);
}

export function isMaintenanceModeEnabled() {
  return process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
}
