FROM oven/bun:1.1.21 as builder

RUN apt-get update && \
    apt-get install -y ffmpeg exiftool && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY schema.prisma .
RUN bunx prisma generate

COPY . .

CMD bun run index.ts
