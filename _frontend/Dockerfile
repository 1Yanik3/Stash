# Stage 1: Builder
FROM node:alpine as builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY schema.prisma .
RUN pnpx prisma generate

COPY static ./static
COPY jsconfig.json .*rc* mdi-svelte.d.ts *.config.js ./
COPY src ./src
RUN pnpm run build && pnpm prune --prod

# Stage 2: Final stage with optimized production image
FROM node:alpine

WORKDIR /app
COPY --from=builder /app ./

ENV NODE_ENV=production
CMD BODY_SIZE_LIMIT="Infinity" node build
