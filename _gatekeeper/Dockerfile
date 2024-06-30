
FROM golang:1.22.1

# Set destination for COPY
WORKDIR /app

# Download Go modules
COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/gatekeeper

EXPOSE 80

# Run
CMD ["/app/gatekeeper"]
