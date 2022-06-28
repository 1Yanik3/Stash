FROM ubuntu

COPY main /main
RUN chmod +x /main

RUN apt-get install -y ffmpeg

ENTRYPOINT ["/main"]