# Next.js web — multi-stage. Built from the monorepo root context. (Prod target is Vercel;
# this image is for docker-compose parity and non-Vercel hosts.)
FROM node:22-bookworm-slim AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml package.json .npmrc ./
COPY packages/types/package.json packages/types/
COPY apps/web/package.json apps/web/
COPY pnpm-lock.yaml* ./
# Frozen lockfile for supply-chain safety — requires committed pnpm-lock.yaml.
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
RUN pnpm --filter @pbb/web build

FROM base AS run
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/web/.next ./apps/web/.next
COPY --from=build /repo/apps/web/public ./apps/web/public
COPY --from=build /repo/apps/web/package.json ./apps/web/
COPY --from=build /repo/apps/web/next.config.mjs ./apps/web/
WORKDIR /repo/apps/web
EXPOSE 3000
CMD ["pnpm", "start"]
