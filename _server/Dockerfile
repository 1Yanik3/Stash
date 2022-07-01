FROM ubuntu

COPY main /main
RUN chmod +x /main

RUN apt-get update
RUN apt-get install -y ffmpeg

ENV GIN_MODE=release
EXPOSE 80

ENTRYPOINT ["/main"]