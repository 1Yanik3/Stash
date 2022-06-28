FROM ubuntu

COPY main /main
RUN chmod +x /main

RUN apt-get update
RUN apt-get install -y ffmpeg

EXPOSE 80

ENTRYPOINT ["/main"]