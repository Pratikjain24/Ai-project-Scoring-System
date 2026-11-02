# ProjectX-Ray AI: Distributed Kubernetes Worker Pool & Auto-Scaling Runbook

This directory contains production Kubernetes deployment manifests for orchestrating the **ProjectX-Ray AI** platform across cloud clusters (Amazon EKS, Google Cloud GKE, Microsoft AKS, or on-premise Kind/Minikube).

---

## 1. Architecture Topology

```
                  [ Ingress / AWS ALB / GKE Ingress ]
                                   │
                                   ▼
             ┌───────────────────────────────────────────┐
             │       ProjectX-Ray API Gateway Pods       │
             │        (APP_ROLE=api, Stateless)         │
             │   - Express API Server                    │
             │   - REST Endpoints & Authentication       │
             │   - SSE Telemetry Stream Relays           │
             │   - Prometheus Exporter (/metrics)        │
             └─────────────────────┬─────────────────────┘
                                   │
                                   ▼ (Dispatches Evaluation Jobs)
             ┌───────────────────────────────────────────┐
             │       BullMQ Redis 7 Queue Broker         │
             │        (ClusterIP: redis-service)         │
             │   - Persistent AOF Append-Only            │
             │   - Queue: evaluation-pipeline-queue      │
             └─────────────────────┬─────────────────────┘
                                   │
                                   ▼ (Consumes & Autoscales)
 ┌────────────────────────────────────────────────────────────────────────┐
 │            Distributed Evaluation Worker Pool (EKS / GKE)              │
 │                                                                        │
 │   ┌──────────────────────┐               ┌──────────────────────┐      │
 │   │ Worker Pod #1 (Active)│   . . . . .   │ Worker Pod #N (HPA)  │      │
 │   │ (APP_ROLE=worker)    │               │ (APP_ROLE=worker)    │      │
 │   │ - 15-Stage Pipeline  │               │ - 15-Stage Pipeline  │      │
 │   │ - MediaPipe Vision   │               │ - MediaPipe Vision   │      │
 │   │ - RNNoise Filter     │               │ - RNNoise Filter     │      │
 │   │ - Docker Sandboxing  │               │ - Docker Sandboxing  │      │
 │   │ - HNSW Vector Search │               │ - HNSW Vector Search │      │
 │   │ - LLM Jury Chamber   │               │ - LLM Jury Chamber   │      │
 │   │ - Liveness: /healthz │               │ - Liveness: /healthz │      │
 │   │ - Readiness: /readyz │               │ - Readiness: /readyz │      │
 │   └──────────────────────┘               └──────────────────────┘      │
 └──────────────────────────────────▲─────────────────────────────────────┘
                                    │
                                    │ Scales replicas (2 to 20 pods)
 ┌──────────────────────────────────┴─────────────────────────────────────┐
 │       Kubernetes Horizontal Pod Autoscaler (HPA v2)                    │
 │       Scale Metric: bullmq_queue_waiting_jobs (Avg 5 jobs/pod)         │
 │       Fallback Metric: CPU Utilization > 75%                           │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Manifest Inventory

| File | Resource Kind | Component | Purpose |
|:---|:---|:---|:---|
| `namespace.yaml` | `Namespace` | Cluster Isolation | Creates `projectxray-system` namespace. |
| `configmap.yaml` | `ConfigMap` | Configuration | Environment variables (ports, Redis, Postgres, S3, concurrency). |
| `secrets.yaml` | `Secret` | Credentials | JWT signing secrets, database credentials, AI provider API keys. |
| `redis-deployment.yaml` | `Deployment` | Queue Broker | Redis 7.2 with AOF persistence and memory guard. |
| `redis-service.yaml` | `Service` | Queue Network | ClusterIP exposing port 6379 to internal services. |
| `api-deployment.yaml` | `Deployment` | API Gateway | 2 replicas, `APP_ROLE=api`, HTTP probes on port 3001. |
| `api-service.yaml` | `Service` | Public Ingress | LoadBalancer service routing HTTP port 80 to port 3001. |
| `worker-deployment.yaml` | `Deployment` | Evaluation Pool | Dedicated workers running `worker.ts`, 90s graceful drain. |
| `hpa-worker.yaml` | `HorizontalPodAutoscaler` | Dynamic Scaler | Scales workers from 2 to 20 based on BullMQ queue depth. |

---

## 3. Fast-Track Deployment Instructions

### Prerequisites
- `kubectl` configured with cluster admin context.
- Amazon EKS, Google Cloud GKE, or local Kind/Minikube cluster.

```bash
# 1. Create dedicated namespace
kubectl apply -f backend/k8s/namespace.yaml

# 2. Deploy configuration & secrets
kubectl apply -f backend/k8s/configmap.yaml
kubectl apply -f backend/k8s/secrets.yaml

# 3. Deploy Redis queue broker
kubectl apply -f backend/k8s/redis-deployment.yaml
kubectl apply -f backend/k8s/redis-service.yaml

# 4. Deploy stateless API Gateway
kubectl apply -f backend/k8s/api-deployment.yaml
kubectl apply -f backend/k8s/api-service.yaml

# 5. Deploy distributed worker pool
kubectl apply -f backend/k8s/worker-deployment.yaml

# 6. Apply Horizontal Pod Autoscaler
kubectl apply -f backend/k8s/hpa-worker.yaml
```

---

## 4. Autoscaling Formula & Prometheus Adapter Configuration

During university capstone symposiums and hackathon demo days, 50+ project evaluations can arrive concurrently. The HPA calculates worker demand using:

$$\text{Target Replicas} = \max\left(2, \min\left(20, \left\lceil \frac{\text{bullmq\_queue\_waiting\_jobs}}{5} \right\rceil\right)\right)$$

### Prometheus Adapter Rule (`values.yaml` for `k8s-prometheus-adapter`)
```yaml
rules:
  custom:
    - seriesQuery: '{__name__=~"bullmq_queue_waiting_jobs"}'
      resources:
        template: "<<.Resource>>"
      name:
        matches: "bullmq_queue_waiting_jobs"
        as: "bullmq_queue_waiting_jobs"
      metricsQuery: 'sum(bullmq_queue_waiting_jobs{<<.LabelMatchers>>})'
```

---

## 5. Graceful Termination & Drain Lifecycle

When a worker pod is scaled down or preempted:
1. Kubernetes sends `preStop` hook (`sleep 5`) ensuring new connections stop routing.
2. Worker receives `SIGTERM`.
3. Readiness probe `/readyz` immediately returns HTTP `503 Service Unavailable`.
4. The worker's BullMQ processor finishes processing active evaluation stages and saves checkpoints.
5. `pipelineQueue.close()` safely disconnects from Redis.
6. Worker terminates cleanly within `terminationGracePeriodSeconds: 90`.

