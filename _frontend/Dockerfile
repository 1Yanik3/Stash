# Stage 1: Builder
FROM node:20-alpine3.20 as builder
WORKDIR /app

RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY schema.prisma .
RUN pnpx prisma generate

COPY static ./static
COPY tsconfig.json .*rc* mdi-svelte.d.ts *.config.js ./
COPY src ./src
RUN pnpm run build && pnpm prune --prod

# Stage 2: Final stage with optimized production image
FROM node:alpine

WORKDIR /app
COPY --from=builder /app ./

ENV NODE_ENV=production
CMD BODY_SIZE_LIMIT="Infinity" node build
