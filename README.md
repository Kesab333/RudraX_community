# RudraX Unified Scientific Community Platform

This repository now contains the Phase 1 MVP monorepo scaffold for the RudraX community platform.

## Workspace Layout

- `apps/web`: Next.js community frontend
- `apps/api`: NestJS API and Prisma schema
- `apps/worker`: background job processor for indexing, retention, notifications, and attachment scanning
- `packages/shared`: shared contracts, enums, realtime events, and feature flags
- `RudraX_community-main`: preserved legacy static prototype used as a design reference only

## Platform Focus

The implementation is structured around:

- standalone authentication with email/password plus Google and GitHub hooks
- persistent posts, comments, tags, attachments, notifications, and moderation actions
- real-time fanout over websocket events
- background indexing and malware-scan workflows
- reliability guardrails such as idempotency, timeouts, feature flags, health checks, graceful shutdown, and observability

## Implemented Foundations

- Monorepo workspace with `apps/web`, `apps/api`, `apps/worker`, and `packages/shared`
- Shared contracts for categories, post types, lifecycle states, realtime events, rate limits, pagination, and feature flags
- NestJS API scaffold with:
  - `/health`, `/ready`, `/live`
  - `/api/v1/auth`
  - `/api/v1/users`
  - `/api/v1/posts`
  - `/api/v1/comments`
  - `/api/v1/attachments`
  - `/api/v1/notifications`
  - `/api/v1/search`
  - `/api/v1/moderation`
  - `/api/v1/leaderboard`
  - `/api/v1/integrations/share`
- Prisma schema covering users, posts, versions, tags, comments, attachments, notifications, reports, moderation actions, search documents, idempotency records, share drafts, and refresh tokens
- Worker scaffold for asynchronous indexing, attachment scanning, notification fanout, and retention purge jobs
- Next.js frontend routes for:
  - `/community`
  - `/community/post/[slug]`
  - `/community/compose`
  - `/community/compose/share/[token]`
  - `/community/notifications`
  - `/community/leaderboard`
  - `/community/mod`

## Local Development

Prerequisites:

- Node.js 22+
- pnpm 10+
- Docker Desktop or a compatible container runtime

Suggested flow:

1. Copy `.env.example` to `.env`.
2. Start infrastructure with `docker compose up postgres redis minio mailpit`.
3. Install dependencies with `pnpm install`.
4. Generate Prisma client with `pnpm db:generate`.
5. Run migrations with `pnpm db:migrate`.
6. Start apps with `pnpm dev`.

## Operations Notes

- Health endpoints remain unversioned: `/health`, `/ready`, and `/live`.
- API business routes are versioned under `/api/v1`.
- Quarterly disaster-recovery testing should restore database and object storage backups, boot the application, and verify login plus post retrieval.
- `MAINTENANCE_MODE=true` keeps the frontend visible in read-only mode while the API rejects writes.

## Notes

- All secrets must come from environment variables.
- All schema changes must go through versioned Prisma migrations.
- The current shell environment used for this implementation did not include Node.js, pnpm, or Docker, so runtime verification could not be executed here. The repository was updated to be source-complete and ready for installation in a machine with the required toolchain.
