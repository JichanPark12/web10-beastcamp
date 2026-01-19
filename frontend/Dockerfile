# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy root workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages ./packages

# Copy frontend package.json
COPY frontend/package.json ./frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter frontend...

# Stage 2: Builder
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY --from=deps /app/packages ./packages

# Copy source files
COPY frontend ./frontend
COPY pnpm-workspace.yaml package.json ./

# Build application
WORKDIR /app/frontend
RUN pnpm build

# Stage 3: Production with Node.js (for standalone Next.js)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# standalone은 필요한 모든 의존성을 이미 포함하고 있음
# 전체 standalone 구조를 복사
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./

# static 파일들을 올바른 중첩 경로에 복사
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# frontend 디렉토리로 이동해서 server.js 실행
WORKDIR /app/frontend
CMD ["node", "server.js"]
