# FROM node:alpine
FROM node:latest as builder

WORKDIR /app
COPY . .

# Setup and build project
RUN npm i
RUN npx prisma generate
RUN npm run build



FROM ghcr.io/max-lt/nginx-jwt-module:latest

WORKDIR /app

# Add dependencies
RUN apk add nodejs-current
RUN apk add ffmpeg

# Setup nginx
RUN apk add nginx
COPY ./nginx.conf /etc/nginx

COPY --from=builder /app/build /app/build

CMD nginx && node build