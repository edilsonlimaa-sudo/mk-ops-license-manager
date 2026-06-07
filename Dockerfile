# ======================================
# Stage 1: Dependencies
# ======================================
FROM node:22-alpine AS deps
WORKDIR /app

# Force cache invalidation - change this comment to rebuild: v2
# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Validate Prisma version before install
RUN echo "📦 Checking package.json Prisma version..." && \
    grep -A 1 '@prisma/client' package.json && \
    echo "📦 Installing dependencies with npm ci (respects lock file)..."

# Install ALL dependencies (needed for build) - using npm ci to respect lock file
RUN npm ci && \
    echo "✅ Prisma version installed:" && \
    npm list @prisma/client prisma --depth=0 && \
    npm cache clean --force

# ======================================
# Stage 2: Builder
# ======================================
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Set dummy DATABASE_URL for build (Next.js runs code during build that imports db.ts)
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"

RUN npm run build

# ======================================
# Stage 3: Runner (Production)
# ======================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install OpenSSL 3.x (Alpine default)
RUN apk add --no-cache bind-tools netcat-openbsd postgresql-client openssl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Install ONLY Prisma dependencies in production
RUN npm install prisma@5.22.0 @prisma/client@5.22.0 --omit=dev

# Generate Prisma Client with correct binary targets
RUN npx prisma generate

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
