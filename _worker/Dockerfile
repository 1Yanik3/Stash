# Stage 1: Builder
FROM oven/bun:alpine as builder

RUN apk add --no-cache ffmpeg exiftool yt-dlp nginx

WORKDIR /app

COPY package.json bun.lockb ./
RUN npm i
COPY schema.prisma .
RUN npx prisma generate

CMD bun run index.ts