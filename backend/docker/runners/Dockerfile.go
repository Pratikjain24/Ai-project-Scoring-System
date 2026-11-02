# ==============================================================================
# PROJECTX-RAY AI — MULTI-LANGUAGE SANDBOX RUNNER: GOLANG 1.22
# Image Tag: runner-go:1.22
# Security: Non-root user (10001), disabled CGO, read-only cache, no network
# Enforced Limits: --memory 256m, --cpus 1.0, --network none, --read-only
# ==============================================================================

FROM golang:1.22-alpine

LABEL org.opencontainers.image.title="ProjectX-Ray AI Go 1.22 Sandbox Runner" \
      org.opencontainers.image.description="Hardened, isolated sandbox container for Go capstone benchmark evaluation" \
      org.opencontainers.image.version="1.22" \
      org.projectxray.runner="runner-go:1.22"

RUN apk add --no-cache gcc musl-dev

# Create unprivileged sandbox user
RUN addgroup -g 10001 -S sandboxgroup && \
    adduser -u 10001 -S sandboxuser -G sandboxgroup -h /home/sandboxuser

WORKDIR /workspace
RUN chown -R sandboxuser:sandboxgroup /workspace

ENV CGO_ENABLED=0 \
    GOCACHE=/tmp/gocache \
    GOPATH=/tmp/go \
    HOME=/home/sandboxuser

USER sandboxuser

ENTRYPOINT ["go", "run"]
CMD ["main.go"]

