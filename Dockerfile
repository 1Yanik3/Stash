FROM ghcr.io/max-lt/nginx-jwt-module:latest

WORKDIR /app

# Add dependencies
RUN apk add nodejs-current npm ffmpeg nginx

# Setup nginx
COPY ./nginx.conf /etc/nginx

# Setup and build project
COPY . .
RUN npm i
RUN npx prisma generate
RUN npm run build

CMD nginx && node build