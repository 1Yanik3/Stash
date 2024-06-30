# Stage 1: Builder
FROM node:alpine as builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i
COPY prisma ./prisma
RUN npx prisma generate

COPY static  ./static
COPY jsconfig.json .*rc* mdi-svelte.d.ts *.config.js ./
COPY src ./src
RUN ls -alh
RUN npm run build && npm prune --production

# Stage 2: Final stage with optimized production image
FROM node:latest
RUN apk add --no-cache ffmpeg exiftool yt-dlp nginx

WORKDIR /app
COPY --from=builder /app ./

ENV NODE_ENV=production
CMD BODY_SIZE_LIMIT=0 node build
