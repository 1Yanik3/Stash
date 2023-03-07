# FROM node:alpine
FROM ghcr.io/max-lt/nginx-jwt-module:latest

RUN apk add nodejs-current npm ffmpeg exiftool

WORKDIR /app
COPY . .

# Setup project
RUN npm i
RUN npx prisma generate
RUN npm run build

# Setup nginx
RUN apk add nginx
COPY ./nginx.conf /etc/nginx

CMD nginx && npm start