import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from "@rudrax/shared";

export function resolveLimit(limit?: number): number {
  if (!limit) {
    return PAGINATION_DEFAULT_LIMIT;
  }

  return Math.max(1, Math.min(limit, PAGINATION_MAX_LIMIT));
}

export function encodeCursor(parts: string[]): string {
  return Buffer.from(parts.join("::"), "utf8").toString("base64url");
}

export function decodeCursor(cursor?: string): string[] | null {
  if (!cursor) {
    return null;
  }

  return Buffer.from(cursor, "base64url").toString("utf8").split("::");
}
