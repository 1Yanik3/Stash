FROM oven/bun:alpine as builder

RUN apk add --no-cache ffmpeg exiftool yt-dlp nginx
COPY --from=node:20 /usr/local/bin/node /usr/local/bin/node

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY schema.prisma .
RUN bunx prisma generate

COPY . .

CMD bun run index.ts