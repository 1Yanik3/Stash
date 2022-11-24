FROM node:alpine

WORKDIR /app
COPY . .

# Setup project
RUN curl -fsSL "https://github.com/pnpm/pnpm/releases/latest/download/pnpm-linuxstatic-x64" -o /bin/pnpm; chmod +x /bin/pnpm;
RUN pnpm i
RUN npx prisma generate
RUN pnpm run build
RUN apk add ffmpeg

# Setup nginx
RUN apk add nginx
COPY ./nginx.conf /etc/nginx

CMD nginx && pnpm start