export interface AppEnv {
  nodeEnv: string;
  appOrigin: string;
  apiOrigin: string;
  maintenanceMode: boolean;
  enableEmailNotifications: boolean;
  enableRealtimeTyping: boolean;
  enableAttachments: boolean;
  requestPayloadLimitBytes: number;
  maxUploadsPerUser: number;
  maxUploadsPerInstance: number;
  httpTimeoutMs: number;
  fileUploadTimeoutMs: number;
  websocketIdleTimeoutMs: number;
  databaseQueryTimeoutMs: number;
  slowQueryThresholdMs: number;
  softDeleteRetentionDays: number;
  jwtAccessTtlSeconds: number;
  jwtRefreshTtlSeconds: number;
  jwtIssuer: string;
  jwtAudience: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  databaseUrl: string;
  redisUrl: string;
  s3Endpoint: string;
  s3Bucket: string;
}

function toBoolean(value: string | undefined, defaultValue = false): boolean {
  if (value === undefined) {
    return defaultValue;
  }

  return value.toLowerCase() === "true";
}

function toNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function readAppEnv(env: NodeJS.ProcessEnv = process.env): AppEnv {
  return {
    nodeEnv: env.NODE_ENV ?? "development",
    appOrigin: env.APP_ORIGIN ?? "http://localhost:3000",
    apiOrigin: env.API_ORIGIN ?? "http://localhost:4000",
    maintenanceMode: toBoolean(env.MAINTENANCE_MODE),
    enableEmailNotifications: toBoolean(env.ENABLE_EMAIL_NOTIFICATIONS),
    enableRealtimeTyping: toBoolean(env.ENABLE_REALTIME_TYPING, true),
    enableAttachments: toBoolean(env.ENABLE_ATTACHMENTS, true),
    requestPayloadLimitBytes: toNumber(env.REQUEST_PAYLOAD_LIMIT_BYTES, 5 * 1024 * 1024),
    maxUploadsPerUser: toNumber(env.MAX_UPLOADS_PER_USER, 3),
    maxUploadsPerInstance: toNumber(env.MAX_UPLOADS_PER_INSTANCE, 12),
    httpTimeoutMs: toNumber(env.HTTP_TIMEOUT_MS, 10_000),
    fileUploadTimeoutMs: toNumber(env.FILE_UPLOAD_TIMEOUT_MS, 60_000),
    websocketIdleTimeoutMs: toNumber(env.WEBSOCKET_IDLE_TIMEOUT_MS, 30_000),
    databaseQueryTimeoutMs: toNumber(env.DATABASE_QUERY_TIMEOUT_MS, 5_000),
    slowQueryThresholdMs: toNumber(env.SLOW_QUERY_THRESHOLD_MS, 200),
    softDeleteRetentionDays: toNumber(env.SOFT_DELETE_RETENTION_DAYS, 30),
    jwtAccessTtlSeconds: toNumber(env.JWT_ACCESS_TTL_SECONDS, 900),
    jwtRefreshTtlSeconds: toNumber(env.JWT_REFRESH_TTL_SECONDS, 2_592_000),
    jwtIssuer: env.JWT_ISSUER ?? "rudrax-community",
    jwtAudience: env.JWT_AUDIENCE ?? "rudrax-community-users",
    jwtAccessSecret: env.JWT_ACCESS_SECRET ?? "replace-me",
    jwtRefreshSecret: env.JWT_REFRESH_SECRET ?? "replace-me",
    databaseUrl: env.DATABASE_URL ?? "",
    redisUrl: env.REDIS_URL ?? "redis://localhost:6379",
    s3Endpoint: env.S3_ENDPOINT ?? "http://localhost:9000",
    s3Bucket: env.S3_BUCKET ?? "rudrax-community",
  };
}
