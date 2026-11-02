# ProjectX-Ray AI — Multi-Language Sandbox Runner Catalog

This directory contains Dockerfile definitions and build automation for **ProjectX-Ray AI's** multi-language containerized execution sandbox.

---

## 1. Supported Runner Images

| Runtime | Image Tag | Base Image | Enforced Resource Limits | Typical Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Python** | `runner-python:3.11` | `python:3.11-alpine` | `--memory 256m`, `--cpus 1.0`, `--network none` | PyTest, ML latency/accuracy benchmarks, numerical algorithms. |
| **Rust** | `runner-rust:1.75` | `rust:1.75-alpine` | `--memory 256m`, `--cpus 1.0`, `--network none` | Cargo tests, systems software throughput, cryptographic benchmarks. |
| **Java** | `runner-java:21` | `eclipse-temurin:21-alpine` | `--memory 256m`, `--cpus 1.0`, `--network none` | JUnit test suites, OOP architecture audits, enterprise microservices. |
| **Go** | `runner-go:1.22` | `golang:1.22-alpine` | `--memory 256m`, `--cpus 1.0`, `--network none` | Go test benchmarks, concurrency race detector, networking stubs. |
| **C/C++** | `runner-cpp:13` | `gcc:13-alpine` | `--memory 256m`, `--cpus 1.0`, `--network none` | Embedded systems, graphics pipelines, low-level data structures. |
| **Node.js** | `runner-node:20` | `node:20-alpine` | `--memory 256m`, `--cpus 1.0`, `--network none` | JavaScript / TypeScript TAP, Jest, Vitest, REST API endpoints. |

---

## 2. Hardened Security Constraints

Every container spawned by `SandboxedExecutionEngine` and `DockerContainerRunner` enforces:
1. **Zero Network Egress / Ingress:** `--network=none` prevents data exfiltration and external calls.
2. **Strict Memory Quota:** `--memory=256m` prevents host memory exhaustion.
3. **Strict CPU Limit:** `--cpus=1.0` and `--pids-limit=64` prevent CPU starvation and fork bombs.
4. **Read-Only Root Filesystem:** `--read-only` with `--tmpfs /tmp:rw,noexec,nosuid,size=64m`.
5. **Privilege Dropping:** `--cap-drop=ALL` and `--security-opt=no-new-privileges`.
6. **Non-Root Execution:** Dedicated unprivileged user `sandboxuser` (`UID 10001`).

---

## 3. Building Runner Images

To pre-build all 6 lightweight runner images locally:

```bash
# On Linux / macOS:
bash backend/docker/runners/build-runners.sh

# On Windows:
backend\docker\runners\build-runners.bat
```

