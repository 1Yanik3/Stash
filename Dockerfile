# Stage 1: Install dependencies and generate Prisma
FROM node:alpine as dependencies
WORKDIR /app
COPY package.json package-lock.json .
RUN npm i
COPY prisma ./prisma
RUN npx prisma generate

# Stage 2: Build the application
FROM dependencies as builder
WORKDIR /app
COPY . .
RUN npm run build && npm prune --production

# Stage 3: Final stage with optimized production image
FROM ghcr.io/max-lt/nginx-jwt-module:latest
WORKDIR /app

RUN apk add --no-cache nodejs-current ffmpeg exiftool yt-dlp nginx

# Setup nginx
COPY nginx.conf /etc/nginx/

# Setup Svelte Project
COPY package.json .
COPY --from=dependencies /app/node_modules /app/node_modules/
COPY --from=builder /app/build /app/build/

ENV NODE_ENV=production
CMD nginx && BODY_SIZE_LIMIT=0 node build
