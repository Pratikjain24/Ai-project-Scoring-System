# ==============================================================================
# PROJECTX-RAY AI — MULTI-LANGUAGE SANDBOX RUNNER: C/C++ (GCC 13)
# Image Tag: runner-cpp:13
# Security: Non-root user (10001), stack protector enabled, no network
# Enforced Limits: --memory 256m, --cpus 1.0, --network none, --read-only
# ==============================================================================

FROM gcc:13-alpine

LABEL org.opencontainers.image.title="ProjectX-Ray AI C/C++ GCC 13 Sandbox Runner" \
      org.opencontainers.image.description="Hardened, isolated sandbox container for C and C++ capstone algorithm verification" \
      org.opencontainers.image.version="13" \
      org.projectxray.runner="runner-cpp:13"

RUN apk add --no-cache musl-dev make

# Create unprivileged sandbox user
RUN addgroup -g 10001 -S sandboxgroup && \
    adduser -u 10001 -S sandboxuser -G sandboxgroup -h /home/sandboxuser

WORKDIR /workspace
RUN chown -R sandboxuser:sandboxgroup /workspace

ENV HOME=/home/sandboxuser

USER sandboxuser

ENTRYPOINT ["sh", "-c"]
CMD ["g++ -O2 -fstack-protector-strong /workspace/main.cpp -o /tmp/runner && /tmp/runner"]

