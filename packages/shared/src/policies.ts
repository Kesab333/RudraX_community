import {
  EXTERNAL_TIMEOUTS_MS,
  FEATURE_FLAGS,
  FILE_SIZE_LIMITS_BYTES,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_MAX_LIMIT,
  REQUEST_LIMITS,
  REQUEST_PAYLOAD_LIMIT_BYTES,
} from "./community";

export const RATE_LIMIT_HEADERS = [
  "X-RateLimit-Limit",
  "X-RateLimit-Remaining",
  "X-RateLimit-Reset",
] as const;

export const HEALTH_ENDPOINTS = ["/health", "/ready", "/live"] as const;

export const API_VERSION_PREFIX = "/api/v1";

export const IDEMPOTENCY_REQUIRED_SCOPES = [
  "post:create",
  "comment:create",
  "attachment:upload",
  "share:draft",
] as const;

export type IdempotencyScope = (typeof IDEMPOTENCY_REQUIRED_SCOPES)[number];

export const DEFAULT_PLATFORM_POLICY = {
  featureFlags: FEATURE_FLAGS,
  requestPayloadLimitBytes: REQUEST_PAYLOAD_LIMIT_BYTES,
  fileSizeLimits: FILE_SIZE_LIMITS_BYTES,
  timeouts: EXTERNAL_TIMEOUTS_MS,
  pagination: {
    defaultLimit: PAGINATION_DEFAULT_LIMIT,
    maxLimit: PAGINATION_MAX_LIMIT,
  },
  rateLimits: REQUEST_LIMITS,
} as const;
