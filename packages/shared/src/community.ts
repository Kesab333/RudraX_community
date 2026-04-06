export const USER_ROLES = [
  "guest",
  "user",
  "contributor",
  "moderator",
  "admin",
  "developer",
  "researcher",
  "student",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const CATEGORIES = [
  "physics",
  "chemistry",
  "mathematics",
  "simulations",
  "research",
  "projects",
  "general",
  "announcements",
  "support",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const POST_TYPES = [
  "discussion",
  "question",
  "project",
  "simulation",
  "research-paper",
  "bug-report",
  "announcement",
] as const;

export type PostType = (typeof POST_TYPES)[number];

export const VISIBILITY_STATES = ["public", "private", "draft"] as const;
export type VisibilityState = (typeof VISIBILITY_STATES)[number];

export const POST_LIFECYCLE_STATES = [
  "draft",
  "published",
  "edited",
  "locked",
  "archived",
  "deleted",
] as const;

export type PostLifecycleState = (typeof POST_LIFECYCLE_STATES)[number];

export const ATTACHMENT_STATUSES = [
  "uploaded",
  "scan_pending",
  "scan_passed",
  "scan_failed",
] as const;

export type AttachmentStatus = (typeof ATTACHMENT_STATUSES)[number];

export const NOTIFICATION_TYPES = [
  "new_post",
  "new_comment",
  "new_reply",
  "like",
  "mention",
  "announcement",
  "system_update",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const XP_EVENT_TYPES = [
  "post_created",
  "comment_created",
  "like_received",
  "answer_accepted",
  "dataset_uploaded",
  "bug_reported",
  "bug_fixed",
  "research_published",
] as const;

export type XpEventType = (typeof XP_EVENT_TYPES)[number];

export const REALTIME_EVENTS = [
  "post.created",
  "post.updated",
  "post.deleted",
  "comment.created",
  "comment.updated",
  "comment.deleted",
  "notification.created",
  "user.presence.changed",
  "user.typing.changed",
  "xp.updated",
] as const;

export type RealtimeEventName = (typeof REALTIME_EVENTS)[number];

export const FEATURE_FLAGS = [
  "ENABLE_EMAIL_NOTIFICATIONS",
  "ENABLE_REALTIME_TYPING",
  "ENABLE_ATTACHMENTS",
  "MAINTENANCE_MODE",
] as const;

export type FeatureFlagName = (typeof FEATURE_FLAGS)[number];

export const PAGINATION_DEFAULT_LIMIT = 20;
export const PAGINATION_MAX_LIMIT = 100;
export const COMMENT_MAX_DEPTH = 4;
export const MAX_TAGS_PER_POST = 5;
export const SOFT_DELETE_RETENTION_DAYS = 30;

export const EXTERNAL_TIMEOUTS_MS = {
  databaseQuery: 5_000,
  httpRequest: 10_000,
  fileUpload: 60_000,
  websocketIdle: 30_000,
} as const;

export const REQUEST_LIMITS = {
  loginPerMinute: 5,
  postsPerMinute: 10,
  commentsPerMinute: 30,
  uploadsPerHour: 20,
  searchPerMinute: 60,
} as const;

export const FILE_SIZE_LIMITS_BYTES = {
  image: 10 * 1024 * 1024,
  document: 25 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  archive: 50 * 1024 * 1024,
} as const;

export const REQUEST_PAYLOAD_LIMIT_BYTES = 5 * 1024 * 1024;

export interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
  limit: number;
}

export interface CommunityUserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  xp: number;
  avatarUrl: string | null;
}

export interface CommunityPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  type: PostType;
  visibility: VisibilityState;
  lifecycleState: PostLifecycleState;
  author: CommunityUserSummary;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  commentCount: number;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
}

export interface CommunityCommentSummary {
  id: string;
  postId: string;
  author: CommunityUserSummary;
  content: string;
  parentId: string | null;
  depth: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isAcceptedAnswer: boolean;
}

export interface AttachmentSummary {
  id: string;
  postId: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string | null;
  status: AttachmentStatus;
  uploadedAt: string;
}

export interface SearchResultDocument {
  id: string;
  kind: "post" | "comment" | "user" | "tag" | "attachment" | "project" | "simulation";
  title: string;
  excerpt: string;
  score: number;
  url: string;
}

export interface FeatureFlagMap {
  ENABLE_EMAIL_NOTIFICATIONS: boolean;
  ENABLE_REALTIME_TYPING: boolean;
  ENABLE_ATTACHMENTS: boolean;
  MAINTENANCE_MODE: boolean;
}

export function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80);
}

export function normalizeTag(tag: string): string {
  return slugifyTitle(tag);
}
