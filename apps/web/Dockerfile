FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN corepack enable
RUN pnpm install --filter @rudrax/web... --frozen-lockfile=false

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable
RUN pnpm --filter @rudrax/web build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/web/.next ./.next
COPY --from=build /app/apps/web/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/web/package.json ./package.json
EXPOSE 3000
CMD ["node_modules/.bin/next", "start", "-p", "3000"]
