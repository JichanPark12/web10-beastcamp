# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy root workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.json ./
COPY packages ./packages

# Copy ticket-server package.json
COPY backend/ticket-server/package.json ./backend/ticket-server/

# Install dependencies (including workspace dependencies)
RUN pnpm install --frozen-lockfile --filter @beastcamp/ticket-server...

# Stage 2: Builder
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/ticket-server/node_modules ./backend/ticket-server/node_modules
COPY --from=deps /app/packages ./packages

# Copy source files
COPY backend/ticket-server ./backend/ticket-server
COPY pnpm-workspace.yaml package.json tsconfig.json ./

# Build application
WORKDIR /app/backend/ticket-server
RUN pnpm build

# Stage 3: Production
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application and dependencies
COPY --from=builder --chown=nestjs:nodejs /app/backend/ticket-server/dist ./backend/ticket-server/dist
COPY --from=builder --chown=nestjs:nodejs /app/backend/ticket-server/package.json ./backend/ticket-server/package.json
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nestjs:nodejs /app/backend/ticket-server/node_modules ./backend/ticket-server/node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages

USER nestjs

EXPOSE 3001

WORKDIR /app/backend/ticket-server
CMD ["node", "dist/main.js"]
