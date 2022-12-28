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
RUN apk add nodejs-current npm ffmpeg

# Setup nginx
RUN apk add nginx
COPY ./nginx.conf /etc/nginx

COPY --from=builder /app/build /app/build
COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json
RUN npm ci --prod
RUN npx prisma generate

CMD nginx && node build