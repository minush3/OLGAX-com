# ==============================================================================
# Multi-stage Dockerfile for React Frontend (hr-frontend)
# Optimized for Next.js / React with Tailwind CSS
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Install dependencies
# ------------------------------------------------------------------------------
FROM node:22-slim AS deps
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install dependencies cleanly
RUN npm ci

# ------------------------------------------------------------------------------
# Stage 2: Build the React application
# ------------------------------------------------------------------------------
FROM node:22-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the project
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 3: Production runner
# ------------------------------------------------------------------------------
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Security: Create non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 nextjs

# Copy runtime assets and built bundles
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

# Start server on port 3000
CMD ["npm", "start", "--", "-p", "3000"]
