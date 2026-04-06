import {
  AttachmentStatus,
  Category,
  NotificationType,
  PostLifecycleState,
  PostType,
  UserRole,
  VisibilityState,
  XpEventType,
} from "@prisma/client";

export function toPrismaUserRole(value: string): UserRole {
  return value.toUpperCase() as UserRole;
}

export function fromPrismaUserRole(value: UserRole): string {
  return value.toLowerCase();
}

export function toPrismaCategory(value: string): Category {
  return value.toUpperCase() as Category;
}

export function fromPrismaCategory(value: Category): string {
  return value.toLowerCase();
}

export function toPrismaPostType(value: string): PostType {
  return value.replace(/-/g, "_").toUpperCase() as PostType;
}

export function fromPrismaPostType(value: PostType): string {
  return value.toLowerCase().replace(/_/g, "-");
}

export function toPrismaVisibility(value: string): VisibilityState {
  return value.toUpperCase() as VisibilityState;
}

export function fromPrismaVisibility(value: VisibilityState): string {
  return value.toLowerCase();
}

export function toPrismaLifecycle(value: string): PostLifecycleState {
  return value.toUpperCase() as PostLifecycleState;
}

export function fromPrismaLifecycle(value: PostLifecycleState): string {
  return value.toLowerCase();
}

export function toPrismaAttachmentStatus(value: string): AttachmentStatus {
  return value.toUpperCase() as AttachmentStatus;
}

export function fromPrismaAttachmentStatus(value: AttachmentStatus): string {
  return value.toLowerCase();
}

export function toPrismaNotificationType(value: string): NotificationType {
  return value.toUpperCase() as NotificationType;
}

export function toPrismaXpEventType(value: string): XpEventType {
  return value.toUpperCase() as XpEventType;
}
