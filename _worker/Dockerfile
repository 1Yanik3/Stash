# Stage 1: Builder
FROM oven/bun:alpine as builder

RUN apk add --no-cache ffmpeg exiftool yt-dlp nginx

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY schema.prisma .
RUN bunx prisma generate

CMD bun run index.ts