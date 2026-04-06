import type { UserRole } from "@rudrax/shared";

export interface RequestUser {
  id: string;
  email: string;
  role: UserRole;
}
