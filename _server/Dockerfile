FROM alpine

COPY main /main

RUN chmod +x /main

RUN apk add --no-cache ffmpeg

ENTRYPOINT ["/main"]