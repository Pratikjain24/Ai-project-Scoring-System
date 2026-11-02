# ==============================================================================
# PROJECTX-RAY AI — MULTI-LANGUAGE SANDBOX RUNNER: JAVA 21 (TEMURIN)
# Image Tag: runner-java:21
# Security: Non-root user (10001), restricted JVM heap limits, no network
# Enforced Limits: --memory 256m, --cpus 1.0, --network none, --read-only
# ==============================================================================

FROM eclipse-temurin:21-alpine

LABEL org.opencontainers.image.title="ProjectX-Ray AI Java 21 Sandbox Runner" \
      org.opencontainers.image.description="Hardened, isolated sandbox container for Java capstone test verification" \
      org.opencontainers.image.version="21" \
      org.projectxray.runner="runner-java:21"

# Create unprivileged sandbox user
RUN addgroup -g 10001 -S sandboxgroup && \
    adduser -u 10001 -S sandboxuser -G sandboxgroup -h /home/sandboxuser

WORKDIR /workspace
RUN chown -R sandboxuser:sandboxgroup /workspace

# JVM resource clamping inside 256m container
ENV JAVA_TOOL_OPTIONS="-XX:+UseSerialGC -Xmx192m -Xms64m -XX:+ExitOnOutOfMemoryError" \
    HOME=/home/sandboxuser

USER sandboxuser

ENTRYPOINT ["sh", "-c"]
CMD ["javac /workspace/Main.java -d /tmp && java -cp /tmp Main"]

