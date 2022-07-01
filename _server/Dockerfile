FROM alpine

COPY main /main
RUN chmod +x /main

RUN apk add --no-cache ffmpeg

ENV GIN_MODE=release
EXPOSE 80

ENTRYPOINT ["/main"]