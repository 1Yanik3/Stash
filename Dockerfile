# FROM node:alpine
FROM ghcr.io/max-lt/nginx-jwt-module:latest

RUN apk add nodejs-current npm

WORKDIR /app
COPY . .

# Setup project
RUN npm i
RUN npx prisma generate
RUN npm run build
RUN apk add ffmpeg

# Setup nginx
RUN apk add nginx
COPY ./nginx.conf /etc/nginx

CMD nginx && npm start