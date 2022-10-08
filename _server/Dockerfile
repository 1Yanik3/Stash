FROM --platform=linux/amd64 alpine

COPY main /main
RUN chmod +x /main
COPY build /build

RUN apk add --no-cache ffmpeg

ENV GIN_MODE=release
EXPOSE 80

ENTRYPOINT ["/main"]