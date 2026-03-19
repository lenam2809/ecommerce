# Stage 1: Build ứng dụng
FROM node:20-alpine AS builder

WORKDIR /app

# Build argument for API URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Copy các file cấu hình dependencies trước để tận dụng layer caching
COPY package.json package-lock.json* ./

# Cài đặt dependencies (bao gồm cả devDependencies cho build TypeScript)
RUN npm ci

# Copy toàn bộ source code
COPY . .

# Build ứng dụng Next.js với TypeScript
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Tạo user không có quyền root để bảo mật
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy các file cần thiết từ builder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]