FROM node:alpine as builder
WORKDIR /app
COPY . .

RUN npm ci
RUN npx prisma generate
RUN npm run build
RUN npm prune --production



FROM ghcr.io/max-lt/nginx-jwt-module:latest
WORKDIR /app

RUN apk add --no-cache nodejs-current ffmpeg exiftool

# Setup nginx
RUN apk add nginx
COPY ./nginx.conf /etc/nginx

# Setup Svelte Project
COPY package.json .
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/build build/

ENV NODE_ENV=production
CMD nginx && BODY_SIZE_LIMIT=0 node build
