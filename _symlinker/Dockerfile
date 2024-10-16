FROM golang:1.22.5 as builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/symlinker


FROM scratch
COPY --from=builder /app/symlinker /app/symlinker
EXPOSE 80
CMD ["/app/symlinker"]
