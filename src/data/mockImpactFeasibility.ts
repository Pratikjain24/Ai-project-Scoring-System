import type { ImpactFeasibilityReport } from '../types/impactFeasibility';

export const MOCK_SOFTWARE_IMPACT_FEASIBILITY: ImpactFeasibilityReport = {
  projectId: 'proj-sw-quantumkey-tls',
  projectName: 'QuantumKey TLS v1.3 Post-Quantum Proxy',
  projectType: 'software',
  compositeViabilityScore: 88.6,
  compositeConfidence: 94.8,
  evaluatedAt: '2026-09-04T19:20:00Z',
  evaluatorEngine: 'ProjectX-Ray Impact & Feasibility Matrix v4.2',
  executiveSummary: 'QuantumKey demonstrates high social and economic viability by future-proofing enterprise internet communications against quantum decryption ("Harvest Now, Decrypt Later"). Its pure-Rust AVX-512 cryptographic engine achieves 34% energy savings over standard OpenSSL builds, rendering it highly sustainable for global data centers. However, real-world deployment requires FIPS 203 certification and formal side-channel validation.',

  pillars: {
    // 1. SOCIAL IMPACT
    social: {
      pillarScore: 91.5,
      confidence: 96.0,
      weight: 25,
      headline: 'Secures digital rights, healthcare data, and sovereign communication against post-quantum surveillance.',
      summary: 'Intercepted encrypted data stored today can be decrypted tomorrow when cryptanalytically relevant quantum computers (CRQCs) emerge. QuantumKey protects public internet users transparently without requiring client-side OS upgrades.',
      peopleAffected: {
        id: 'sub-soc-1',
        key: 'peopleAffected',
        name: 'People Affected & Reach',
        score: 94,
        confidence: 97,
        weight: 30,
        metricValue: '1.8 Billion',
        unit: 'protected web sessions / yr',
        headline: 'Mass digital population protection through reverse-proxy TLS termination',
        description: 'Protects citizen transactions across e-banking, government portals, and telehealth endpoints at the reverse-proxy layer.',
        strengths: [
          'Transparent backwards compatibility with classic TLS 1.3 clients via hybrid X25519+ML-KEM-768 key exchanges.',
          'Zero endpoint software installation required by end users.'
        ],
        limitations: [
          'Initial protection bounded by enterprise CDN edge adoption; consumer IoT endpoints lag behind in cipher suite negotiation.'
        ],
        evidence: [
          {
            id: 'ev-soc-1',
            title: 'Global Cloudflare PQC Traffic Audit',
            source: 'IETF 118 PQC Working Group Draft, 2024',
            excerpt: 'Hybrid ML-KEM key exchanges accounted for 18.2% of TLS handshakes in Q4 2024, representing over 1.4B unique daily endpoints.',
            verifiedValue: '1.8B projected sessions under edge proxy deployment'
          }
        ]
      },
      problemSeverity: {
        id: 'sub-soc-2',
        key: 'problemSeverity',
        name: 'Problem Severity & Urgency',
        score: 96,
        confidence: 98,
        weight: 30,
        metricValue: 'Catastrophic Risk',
        unit: 'Harvest Now Decrypt Later',
        headline: 'Critical window before Shor’s algorithm shatters RSA-2048 and ECC',
        description: 'Nation-state actors are currently stockpiling encrypted diplomatic cables, medical registries, and financial ledgers for retroactive decryption once a 4,000-qubit fault-tolerant quantum computer exists.',
        strengths: [
          'Pre-empts catastrophic retro-decryption by immediate hybrid key encapsulation.',
          'Conforms to White House NSM-10 directive for quantum migration by 2030.'
        ],
        limitations: [
          'Does not remediate previously archived traffic intercepted before proxy deployment.'
        ],
        evidence: [
          {
            id: 'ev-soc-2',
            title: 'NIST Special Publication 800-227',
            source: 'Recommendations for Transitioning to PQC, 2024',
            excerpt: 'All public key cryptography vulnerable to Shor algorithm must initiate hybrid migration immediately to protect multi-decade secret lifespans.',
            verifiedValue: 'Immediate 3-year migration horizon'
          }
        ]
      },
      accessibility: {
        id: 'sub-soc-3',
        key: 'accessibility',
        name: 'Accessibility & Inclusivity',
        score: 86,
        confidence: 93,
        weight: 20,
        metricValue: 'Zero-Friction Client',
        unit: 'No client config needed',
        headline: 'Runs seamlessly on legacy smartphones, low-bandwidth 3G, and embedded devices',
        description: 'Legacy web browsers and low-cost smartphones connect via standard TLS 1.3 without error; proxy negotiates Kyber only when client hello announces PQC extension.',
        strengths: [
          'Graceful fallback to standard ECDHE if client does not support post-quantum key shares.',
          'Public web interfaces and documentation are WCAG 2.1 AA compliant.'
        ],
        limitations: [
          'ML-KEM ciphertext expands ClientHello packet size to ~1,184 bytes, occasionally requiring TCP segmentation on strict MTU 1280 networks.'
        ],
        evidence: [
          {
            id: 'ev-soc-3',
            title: 'Packet Fragmentation Test Suite',
            source: 'tests/network/mtu_segmentation.rs:L42',
            excerpt: 'Tested 50,000 handshakes on simulated 1280-byte MTU cellular link; 99.88% completed with zero handshake drops.',
            verifiedValue: '99.88% fallback completion rate'
          }
        ]
      },
      publicBenefit: {
        id: 'sub-soc-4',
        key: 'publicBenefit',
        name: 'Public Benefit & Open Ecosystem',
        score: 90,
        confidence: 96,
        weight: 20,
        metricValue: '100% Open Source',
        unit: 'Apache 2.0 / MIT Dual License',
        headline: 'Democratizes post-quantum defense for non-profits, universities, and small businesses',
        description: 'Eliminates reliance on proprietary, expensive commercial appliance vendors by releasing audited Rust crates to the open-source community.',
        strengths: [
          'No vendor lock-in or recurring per-seat licensing fees.',
          'Published formal mathematical proofs for Montgomery reduction constants.'
        ],
        limitations: [
          'Requires self-hosting expertise unless deployed via turnkey Docker container.'
        ],
        evidence: [
          {
            id: 'ev-soc-4',
            title: 'GitHub Repository Open License Verification',
            source: 'LICENSE-APACHE & Cargo.toml',
            excerpt: 'Dual licensed under MIT / Apache-2.0. Unrestricted commercial and educational deployment.',
            verifiedValue: 'Dual Apache/MIT'
          }
        ]
      }
    },

    // 2. ECONOMIC IMPACT
    economic: {
      pillarScore: 89.2,
      confidence: 94.5,
      weight: 25,
      headline: 'Prevents multi-million dollar corporate exposure while reducing cloud compute egress costs.',
      summary: 'By deploying as a drop-in reverse proxy in front of existing legacy Apache/Nginx web applications, enterprises save an estimated $4.2M per organization in backend application re-architecture costs.',
      costSavings: {
        id: 'sub-econ-1',
        key: 'costSavings',
        name: 'Direct Cost Savings & ROI',
        score: 93,
        confidence: 96,
        weight: 30,
        metricValue: '$4.2M / Enterprise',
        unit: 'avoided refactoring CapEx',
        headline: 'Avoids multi-year legacy backend application refactoring',
        description: 'Enterprises can insulate hundreds of internal Java, Python, and Go microservices by placing QuantumKey at the VPC ingress boundary without rewriting legacy crypto stacks.',
        strengths: [
          'Zero modifications to internal database schemas or microservice codebases.',
          'Payback period estimated at under 45 days compared to proprietary hardware security modules (HSMs).'
        ],
        limitations: [
          'Requires edge server memory allocation (approx. 48MB per 10,000 active concurrent connections).'
        ],
        evidence: [
          {
            id: 'ev-econ-1',
            title: 'Gartner Enterprise Quantum Readiness Study',
            source: 'Gartner Research G00789123, 2024',
            excerpt: 'Average Fortune 500 company faces $4.2M to $9.5M in direct labor costs to refactor internal PKI infrastructure for PQC.',
            verifiedValue: '$4.2M average savings baseline'
          }
        ]
      },
      affordability: {
        id: 'sub-econ-2',
        key: 'affordability',
        name: 'Affordability & TCO',
        score: 88,
        confidence: 94,
        weight: 25,
        metricValue: '$0.00014',
        unit: 'per 10k handshake compute cost',
        headline: 'Negligible cloud compute overhead via pure-Rust AVX-512 SIMD vectorization',
        description: 'Microsecond key generation means single $48/mo AWS c6i.xlarge instance easily terminates 12,000 handshakes per second without CPU saturation.',
        strengths: [
          'Low infrastructure threshold compared to hardware quantum accelerators.',
          'Runs on standard commodity x86-64 and aarch64 instances.'
        ],
        limitations: [
          'Older VPS hosting without AVX-512 executes scalar fallback at 2.4x latency.'
        ],
        evidence: [
          {
            id: 'ev-econ-2',
            title: 'AWS Cloud EC2 Instance Cost Benchmark',
            source: 'benchmarks/aws_c6i_cost_matrix.csv',
            excerpt: '100M handshakes cost $1.42 on spot c6i.xlarge instances under continuous load.',
            verifiedValue: '$0.00014 per 10k handshakes'
          }
        ]
      },
      marketRelevance: {
        id: 'sub-econ-3',
        key: 'marketRelevance',
        name: 'Market Relevance & TAM',
        score: 91,
        confidence: 95,
        weight: 25,
        metricValue: '$28.4 Billion',
        unit: 'Global PQC Market by 2030',
        headline: 'Massive addressable market driven by federal mandates and banking compliance',
        description: 'Financial institutions, defense contractors, and healthcare networks are legally required to achieve quantum-resilient encryption by 2028-2030 under NIST and EU standards.',
        strengths: [
          'Target market expands rapidly with each NIST post-quantum standardization milestone.',
          'High enterprise willingness to pay for validated security middleware.'
        ],
        limitations: [
          'Conservative banking procurement cycles require lengthy 9-18 month vendor vetting.'
        ],
        evidence: [
          {
            id: 'ev-econ-3',
            title: 'IDC Post-Quantum Security Market Forecast',
            source: 'IDC Research #US50192324, 2024',
            excerpt: 'Global cybersecurity spending on post-quantum cryptography software and migration proxies projected to reach $28.4B by 2030.',
            verifiedValue: '$28.4B TAM'
          }
        ]
      },
      commercializationPotential: {
        id: 'sub-econ-4',
        key: 'commercializationPotential',
        name: 'Commercialization Potential',
        score: 85,
        confidence: 93,
        weight: 20,
        metricValue: 'High B2B Open-Core',
        unit: 'SaaS / Enterprise Model',
        headline: 'Dual licensing with enterprise support, automated key rotation, and FIPS compliance',
        description: 'Core proxy engine is open-source; monetization through enterprise control plane, telemetry dashboards, automated HSM integration, and 24/7 SLA.',
        strengths: [
          'Proven open-core commercial playbook (similar to HashiCorp, Traefik, Kong).',
          'High stickiness once embedded in enterprise edge routing layer.'
        ],
        limitations: [
          'Risk of cloud hyperscalers (AWS, Cloudflare) integrating generic PQC algorithms into native load balancers.'
        ],
        evidence: [
          {
            id: 'ev-econ-4',
            title: 'Enterprise Pilot LOI Inquiries',
            source: 'docs/business/pilot_letters_of_intent.pdf',
            excerpt: '3 Tier-2 regional banks and 1 healthcare network signed expressions of interest for pilot deployment.',
            verifiedValue: '4 pilot LOIs secured'
          }
        ]
      }
    },

    // 3. ENVIRONMENTAL IMPACT
    environmental: {
      pillarScore: 86.4,
      confidence: 93.8,
      weight: 20,
      headline: 'Reduces data center energy consumption through vectorized arithmetic efficiency.',
      summary: 'Cryptographic handshakes consume up to 14% of edge web server CPU cycles. QuantumKey optimizes Montgomery modular multiplications via AVX-512, cutting power dissipation by 34% compared to legacy C-based PQC wrappers.',
      energyUsage: {
        id: 'sub-env-1',
        key: 'energyUsage',
        name: 'Energy Usage & CPU Efficiency',
        score: 90,
        confidence: 96,
        weight: 35,
        metricValue: '3.4 Joules',
        unit: 'saved per 10k handshakes',
        headline: '34% reduction in CPU wattage through zero-allocation vectorization',
        description: 'Eliminates memory allocation churn and pipeline stalls in NTT polynomial arithmetic, reducing CPU thermal design power (TDP) under heavy handshake burst traffic.',
        strengths: [
          'Measured 13.8 watts mean server draw under 10k RPS vs 20.9 watts for liboqs-c wrapper.',
          'Significant energy savings at scale across hyperscale edge facilities.'
        ],
        limitations: [
          'Cryptographic key size expansion increases network interface card (NIC) PHY transceiver power by < 0.2%.'
        ],
        evidence: [
          {
            id: 'ev-env-1',
            title: 'RAPL Intel Power Joules Profiling',
            source: 'benchmarks/power/rapl_package_energy.log',
            excerpt: 'Total package energy consumed for 100,000 ML-KEM handshakes measured at 34.2 Joules vs 51.8 Joules on baseline OpenSSL 3.2.',
            verifiedValue: '3.4J saved per 10k ops'
          }
        ]
      },
      materialUsage: {
        id: 'sub-env-2',
        key: 'materialUsage',
        name: 'Material Usage & E-Waste Prevention',
        score: 88,
        confidence: 92,
        weight: 25,
        metricValue: 'Zero New Hardware',
        unit: 'Pure software layer',
        headline: 'Prevents premature server obsolescence by retrofitting existing enterprise compute',
        description: 'Enables existing commodity server hardware to remain in production through 2030+ without requiring costly hardware appliance replacement.',
        strengths: [
          'Zero silicon manufacturing e-waste footprint.',
          'Extends server hardware lifecycle by 3-5 years.'
        ],
        limitations: [
          'Servers older than 2017 lacking AVX2 require software emulation with performance penalty.'
        ],
        evidence: [
          {
            id: 'ev-env-2',
            title: 'Circular Economy in IT Infrastructure Audit',
            source: 'GreenPeace Circular Electronics Report, 2024',
            excerpt: 'Extending enterprise server lifetime by 3 years avoids an estimated 280kg CO2e of embodied silicon manufacturing emissions per blade.',
            verifiedValue: '280kg CO2e avoided per server'
          }
        ]
      },
      emissionsImplications: {
        id: 'sub-env-3',
        key: 'emissionsImplications',
        name: 'Emissions Implications & Scope 2',
        score: 84,
        confidence: 93,
        weight: 20,
        metricValue: '-420 MT CO2e / yr',
        unit: 'estimated per 100M users',
        headline: 'Reduces indirect Scope 2 cloud electricity carbon intensity',
        description: 'Scales down edge CPU thermal dissipation, directly lowering data center power usage effectiveness (PUE) cooling fan overhead.',
        strengths: [
          'Supports enterprise ESG reporting goals and carbon abatement pledges.',
          'Quantifiable per-request kilowatt-hour reduction metrics.'
        ],
        limitations: [
          'Dependent on grid emission factors of data center geographical regions.'
        ],
        evidence: [
          {
            id: 'ev-env-3',
            title: 'Data Center Energy & Carbon Model',
            source: 'docs/green_computing_calculations.xlsx',
            excerpt: 'Simulated 100M daily TLS handshakes across EU grid (240g CO2/kWh) yields 420 Metric Tons avoided annual CO2e.',
            verifiedValue: '-420 MT CO2e / yr'
          }
        ]
      },
      sustainability: {
        id: 'sub-env-4',
        key: 'sustainability',
        name: 'Lifecycle Sustainability',
        score: 83,
        confidence: 94,
        weight: 20,
        metricValue: 'Agile Architecture',
        unit: 'Future-proof crypto agility',
        headline: 'Modular algorithm swappability prevents future rewrite obsolescence',
        description: 'Designed around Rust traits (`KEMAlgorithm`, `Signer`); if a specific lattice primitive (e.g. ML-KEM) is mathematically compromised, alternative algorithms (e.g. HQC, BIKE) can be activated via configuration update without re-engineering.',
        strengths: [
          'Cryptographic agility avoids code disposal and future software rewrite cycles.',
          'Clean modular abstraction layer.'
        ],
        limitations: [
          'Alternative code-based KEMs have larger public key footprints (up to 3KB).'
        ],
        evidence: [
          {
            id: 'ev-env-4',
            title: 'Cryptographic Agility Trait Implementation',
            source: 'src/crypto/traits.rs:L18-L62',
            excerpt: 'Dynamic dispatch over KEMAlgorithm trait tested with ML-KEM, FrodoKEM, and Classic McEliece.',
            verifiedValue: '3 PQC KEMs swappable'
          }
        ]
      }
    },

    // 4. FEASIBILITY
    feasibility: {
      pillarScore: 87.3,
      confidence: 95.2,
      weight: 30,
      headline: 'Robust working prototype with low deployment friction and proven linear scaling.',
      summary: 'QuantumKey is containerized, verified on production Linux kernels, and demonstrates zero memory leaks over 72-hour soak tests. Full real-world deployment requires FIPS 203 formal verification, HSM zero-copy driver certification, and automated telemetry integration.',
      prototypeReadiness: {
        id: 'sub-feas-1',
        key: 'prototypeReadiness',
        name: 'Prototype Readiness & TRL',
        score: 92,
        confidence: 98,
        weight: 20,
        metricValue: 'TRL 5',
        unit: 'Technology Readiness Level',
        headline: 'Demonstrated in relevant simulated enterprise edge network environment',
        description: 'Complete reverse-proxy pipeline operating with dual-key exchange, automated certificate rotation, and TLS 1.3 RFC 8446 compliance.',
        strengths: [
          'Survives 72-hour continuous soak test terminating 10,000 req/sec with zero memory leaks.',
          '100% test coverage on cryptographic constant-time primitive functions.'
        ],
        limitations: [
          'Has not yet undergone third-party red-team penetration testing or formal FIPS 140-3 laboratory audit.'
        ],
        evidence: [
          {
            id: 'ev-feas-1',
            title: '72-Hour Memory & Latency Soak Test Logs',
            source: 'tests/soak/72h_valgrind_soak_report.pdf',
            excerpt: 'Zero memory leaks detected across 2.59 billion completed TLS sessions. RSS stayed constant at 38.4MB.',
            verifiedValue: '0 bytes leaked / 2.59B ops'
          }
        ]
      },
      deploymentComplexity: {
        id: 'sub-feas-2',
        key: 'deploymentComplexity',
        name: 'Deployment Complexity & Integration',
        score: 88,
        confidence: 95,
        weight: 15,
        metricValue: 'Low Friction',
        unit: 'Docker / Kubernetes Helm',
        headline: 'Deploys as sidecar or ingress controller in < 15 minutes',
        description: 'Standard Kubernetes Helm chart provided; acts as transparent Ingress Controller or Envoy proxy filter with YAML configuration.',
        strengths: [
          'Pre-built multi-arch Docker containers for AMD64 and ARM64.',
          'Zero external runtime dependencies; single static 14MB binary.'
        ],
        limitations: [
          'Requires Linux kernel 5.10+ for optimal `io_uring` asynchronous I/O completion queues.'
        ],
        evidence: [
          {
            id: 'ev-feas-2',
            title: 'Kubernetes Helm Chart Smoke Test',
            source: 'deploy/helm/quantumkey-ingress/values.yaml',
            excerpt: 'Automated deployment on EKS, GKE, and bare-metal Talos Linux verified in CI pipeline.',
            verifiedValue: '4 min automated deploy'
          }
        ]
      },
      infrastructureRequirements: {
        id: 'sub-feas-3',
        key: 'infrastructureRequirements',
        name: 'Infrastructure Requirements',
        score: 86,
        confidence: 94,
        weight: 15,
        metricValue: 'Standard Cloud / On-Prem',
        unit: '2 vCPU, 512MB RAM min',
        headline: 'Extremely lightweight system footprint; runs on minimal edge nodes',
        description: 'Requires standard x86-64 server with AVX-512 extensions (e.g. Intel Ice Lake / AMD Zen 4) or modern ARMv8.4+ with NEON crypto extensions.',
        strengths: [
          'Low memory overhead (512MB RAM sufficient for 50,000 idle sockets).',
          'Zero requirement for proprietary PCIe crypto accelerator cards.'
        ],
        limitations: [
          'Needs hardware random number generator (RNG) availability (`/dev/urandom` / `RDRAND`).'
        ],
        evidence: [
          {
            id: 'ev-feas-3',
            title: 'Hardware Footprint Specification',
            source: 'docs/architecture/hardware_prerequisites.md',
            excerpt: 'Tested on minimal 1-vCPU 1GB t4g.micro instance; delivered 2,400 handshakes/sec without packet drops.',
            verifiedValue: '1 vCPU 1GB validated'
          }
        ]
      },
      maintenance: {
        id: 'sub-feas-4',
        key: 'maintenance',
        name: 'Maintenance & Technical Debt',
        score: 89,
        confidence: 96,
        weight: 15,
        metricValue: 'Low Overhead',
        unit: 'Rust memory safety',
        headline: 'Eliminates entire classes of memory corruption and OpenSSL buffer overflows',
        description: 'Written in 100% memory-safe Rust with zero `unsafe` blocks in network parsing code. Cryptographic math uses verified constant-time intrinsics.',
        strengths: [
          'Immune to Heartbleed-style buffer over-reads and use-after-free exploits.',
          'Automated background CRL and OCSP stapling certificate updates.'
        ],
        limitations: [
          'Post-quantum standards are evolving; requires annual crate dependency updates as NIST updates RFCs.'
        ],
        evidence: [
          {
            id: 'ev-feas-4',
            title: 'Cargo Audit & Unsafe Block Scan',
            source: 'ci/cargo_geiger_report.txt',
            excerpt: 'Cargo geiger report: 0 unsafe statements in proxy routing layer. 0 reported CVEs in dependency tree.',
            verifiedValue: '0 unsafe lines in proxy layer'
          }
        ]
      },
      scalability: {
        id: 'sub-feas-5',
        key: 'scalability',
        name: 'Scalability & Concurrency Limits',
        score: 91,
        confidence: 97,
        weight: 20,
        metricValue: '104,200 RPS',
        unit: 'per 16-core cluster node',
        headline: 'Linear horizontal scaling with multi-threaded async Tokio runtime',
        description: 'Lock-free thread-per-core architecture enables seamless horizontal scaling across Kubernetes replica sets with near-zero inter-thread contention.',
        strengths: [
          'Linear scaling from 1 to 64 CPU cores with 98.4% scaling efficiency.',
          'Lock-free session cache utilizing atomic concurrent hash maps.'
        ],
        limitations: [
          'Ephemeral port exhaustion at > 65k simultaneous outbound connections per single egress IP.'
        ],
        evidence: [
          {
            id: 'ev-feas-5',
            title: 'Multi-Core Scaling Benchmark',
            source: 'benchmarks/concurrency/tokio_scaling_report.pdf',
            excerpt: 'Scaled from 4 cores (26.1k RPS) to 16 cores (104.2k RPS); linear R^2 correlation of 0.994.',
            verifiedValue: '104.2k RPS on 16 cores'
          }
        ]
      },
      estimatedCost: {
        id: 'sub-feas-6',
        key: 'estimatedCost',
        name: 'Estimated Production Rollout Cost',
        score: 82,
        confidence: 91,
        weight: 15,
        metricValue: '$18,400',
        unit: 'total annual pilot OpEx',
        headline: 'Low-cost software pilot transitioning to predictable enterprise tiering',
        description: 'Includes cloud infrastructure, continuous fuzz testing instances, domain certificates, and automated penetration testing tooling.',
        strengths: [
          'Fraction of the cost of physical HSM appliances ($150,000+ per unit).',
          'Elastic cloud provisioning matches seasonal traffic spikes.'
        ],
        limitations: [
          'High initial one-time legal cost for formal FIPS 140-3 laboratory certification.'
        ],
        evidence: [
          {
            id: 'ev-feas-6',
            title: 'Annualized Pilot Budget Breakdown',
            source: 'docs/financials/pilot_infrastructure_budget.xlsx',
            excerpt: 'AWS production compute: $1,200/mo. Automated fuzzing: $300/mo. Tooling licenses: $40/mo.',
            verifiedValue: '$18,400/yr pilot OpEx'
          }
        ]
      }
    }
  },

  industryBenchmarks: {
    social: 74.0,
    economic: 68.5,
    environmental: 62.0,
    feasibility: 71.0
  },

  // PROTOTYPE -> PILOT -> PRODUCTION ROADMAP
  roadmap: [
    {
      id: 'prototype',
      stageName: 'Prototype Phase',
      trlLevel: 'TRL 5',
      status: 'active',
      badgeLabel: 'Current Working State',
      duration: 'Completed (Months 1 - 8)',
      targetTimeline: 'Q1 2026 (Completed)',
      budgetEstimate: '$45,000 (Seed Grant)',
      validationCohort: 'Internal synthetic lab bench & loopback networks',
      summary: 'Engineered core pure-Rust AVX-512 ML-KEM cryptographic proxy, implemented zero-copy network pipeline, validated backwards compatibility with TLS 1.3 RFC 8446.',
      gatingCriteria: [
        'Zero cryptographic memory leaks across 72-hour soak test.',
        'Sub-15μs AVX-512 key generation & decapsulation latency.',
        'Passes 100% of NIST CAVP (Cryptographic Algorithm Validation Program) test vectors.'
      ],
      milestones: [
        {
          id: 'ms-p1',
          title: 'Implement ML-KEM-768 AVX-512 Montgomery arithmetic',
          status: 'completed',
          deliverable: 'Pure-Rust SIMD crate with 0 heap allocations',
          targetDate: '2025-11-15',
          verificationEvidence: 'Verified in src/crypto/mlkem.rs'
        },
        {
          id: 'ms-p2',
          title: 'Asynchronous reverse proxy pipeline with Tokio & rustls',
          status: 'completed',
          deliverable: 'Working reverse proxy routing HTTP/2 & HTTP/1.1 traffic',
          targetDate: '2026-01-20',
          verificationEvidence: 'Tested with 100k RPS bench'
        },
        {
          id: 'ms-p3',
          title: 'Automated fuzz testing with AFL++ & cargo-fuzz',
          status: 'completed',
          deliverable: '100M executions with 0 crashes or memory faults',
          targetDate: '2026-02-28',
          verificationEvidence: 'fuzz/artifacts clean report'
        }
      ],
      keyRisks: [
        'Single developer architectural bottlenecks in cryptographic assembly primitives.'
      ]
    },
    {
      id: 'pilot',
      stageName: 'Pilot Deployment',
      trlLevel: 'TRL 7',
      status: 'next',
      badgeLabel: 'Field Validation Horizon',
      duration: '6 Months (Months 9 - 14)',
      targetTimeline: 'Q3 - Q4 2026',
      budgetEstimate: '$180,000',
      validationCohort: '4 enterprise design partners (2 regional banks, 1 hospital system, 1 SaaS CDN)',
      summary: 'Deploy QuantumKey as edge ingress controller across 4 pilot partner VPCs. Validate hybrid post-quantum TLS handshakes over transatlantic fiber links with real-world latency, packet jitter, and firewall middleboxes.',
      gatingCriteria: [
        'Zero drop in client session success rate over 90 days continuous field traffic.',
        '99.99% proxy uptime SLA across distributed pilot regions.',
        'Successful middlebox traversal audit (no TLS client hello packet drops caused by enlarged key shares).'
      ],
      milestones: [
        {
          id: 'ms-f1',
          title: 'Deploy Kubernetes Helm Chart on partner staging clusters',
          status: 'in-progress',
          deliverable: 'Automated Helm release with Prometheus metrics exporter',
          targetDate: '2026-07-15'
        },
        {
          id: 'ms-f2',
          title: 'Engage third-party cryptographic security audit firm',
          status: 'planned',
          deliverable: 'Formal white-box audit report from Trail of Bits or NCC Group',
          targetDate: '2026-09-30'
        },
        {
          id: 'ms-f3',
          title: 'Establish 24/7 automated telemetry and failover daemon',
          status: 'planned',
          deliverable: 'Sub-second automatic failover to backup ECDHE proxy',
          targetDate: '2026-11-15'
        }
      ],
      keyRisks: [
        'Outdated enterprise firewalls stripping ClientHello extensions longer than 1024 bytes.',
        'Delays in pilot partner security review board sign-offs.'
      ]
    },
    {
      id: 'production',
      stageName: 'Production & Scale',
      trlLevel: 'TRL 9',
      status: 'future',
      badgeLabel: 'Commercial Scale',
      duration: '12+ Months (Months 15 - 26)',
      targetTimeline: '2027 - 2028',
      budgetEstimate: '$650,000',
      validationCohort: 'General public availability, enterprise SaaS tier, and cloud marketplace listings',
      summary: 'Achieve formal FIPS 140-3 Cryptographic Module Validation, publish AWS/Azure/GCP 1-click marketplace appliances, and offer enterprise control plane with centralized key governance.',
      gatingCriteria: [
        'Formal FIPS 140-3 Certificate issuance from NIST CMVP.',
        'SOC 2 Type II audit report completion.',
        'Demonstrated support for 1,000,000 concurrent TLS connections per ingress cluster.'
      ],
      milestones: [
        {
          id: 'ms-s1',
          title: 'NIST FIPS 140-3 Cryptographic Module Validation Program submission',
          status: 'planned',
          deliverable: 'Submission of security policy and test harness to accredited lab',
          targetDate: '2027-03-31'
        },
        {
          id: 'ms-s2',
          title: 'AWS Marketplace and GCP Cloud Partner integration',
          status: 'planned',
          deliverable: '1-click deployment template with automated pay-as-you-go billing',
          targetDate: '2027-06-30'
        },
        {
          id: 'ms-s3',
          title: 'Hardware Security Module (HSM) PKCS#11 driver certification',
          status: 'planned',
          deliverable: 'Zero-copy private key extraction from Thales & YubiHSM devices',
          targetDate: '2027-10-15'
        }
      ],
      keyRisks: [
        'CMVP laboratory queue delays of 12-18 months for FIPS certificate finalization.',
        'Market consolidation by dominant cloud hyperscalers.'
      ]
    }
  ],

  // AI-GENERATED: "WHAT WOULD BE REQUIRED TO DEPLOY THIS PROJECT IN THE REAL WORLD?"
  realWorldDeployment: {
    executiveSummary: 'Deploying QuantumKey at commercial scale requires transitioning from an open-source prototype into a legally validated, enterprise-hardened software appliance. The critical path is dominated by regulatory certifications (FIPS 140-3), formal cryptographic third-party auditing, and building middlebox-resilient network routing.',
    totalRunwayNeeded: '$480,000 (18 Months to Operating Breakeven)',
    estimatedTimeToProduction: '14 Months to Enterprise General Availability',

    regulatory: [
      {
        id: 'reg-1',
        standard: 'NIST FIPS 140-3 Cryptographic Module Validation',
        governingBody: 'NIST (National Institute of Standards and Technology)',
        status: 'pending',
        urgency: 'critical',
        description: 'Mandatory for US federal agencies, defense contractors, and Tier-1 financial institutions adopting post-quantum algorithms.',
        requiredAction: 'Contract NVLAP-accredited testing laboratory (e.g. atsec or Acumen) to execute CAVP automated validation suites.'
      },
      {
        id: 'reg-2',
        standard: 'SOC 2 Type II Compliance',
        governingBody: 'AICPA (American Institute of CPAs)',
        status: 'in-review',
        urgency: 'high',
        description: 'Required for any enterprise SaaS or hosted management control plane handling proxy configuration telemetry.',
        requiredAction: 'Engage Vanta/Drata automation tooling and complete 6-month continuous surveillance audit.'
      },
      {
        id: 'reg-3',
        standard: 'Common Criteria (ISO/IEC 15408) EAL4+',
        governingBody: 'Common Criteria Recognition Arrangement (CCRA)',
        status: 'pending',
        urgency: 'medium',
        description: 'Essential for international government procurement in the European Union and NATO allies.',
        requiredAction: 'Develop Security Target (ST) document mapping proxy architecture to collaborative protection profiles.'
      }
    ],

    infrastructure: [
      {
        id: 'inf-1',
        category: 'compute',
        name: 'AVX-512 Server Cluster for Continuous Regression & Fuzzing',
        specification: 'Dedicated 3-node cluster with Intel Xeon Platinum 8480+ and AMD EPYC 9654',
        leadTime: 'Immediate (Cloud provisioning via AWS / Hetzner)',
        bottleneckRisk: 'low',
        mitigation: 'Utilize reserved cloud instances with guaranteed CPU microarchitecture pinning.'
      },
      {
        id: 'inf-2',
        category: 'hardware',
        name: 'Hardware Security Module (HSM) Testbed',
        specification: '2x Thales Luna PCIe HSM + 4x Yubico YubiHSM2 devices',
        leadTime: '3 - 4 weeks hardware delivery',
        bottleneckRisk: 'medium',
        mitigation: 'Utilize AWS CloudHSM API emulator during early driver integration phase.'
      },
      {
        id: 'inf-3',
        category: 'network',
        name: 'Global Distributed Anycast Test Network',
        specification: '12 global POP edge locations with WAN latency and packet loss injectors',
        leadTime: '1 week setup',
        bottleneckRisk: 'low',
        mitigation: 'Deploy test agents on Vultr and Linode multi-region instances.'
      }
    ],

    humanResources: [
      {
        id: 'hr-1',
        role: 'Lead Post-Quantum Cryptographer & Rust Systems Engineer',
        headcount: 1,
        skillsRequired: ['Pure-Rust assembly', 'Constant-time verification', 'Lattice math', 'NIST PQC'],
        monthlyCost: '$16,500'
      },
      {
        id: 'hr-2',
        role: 'Site Reliability & Kubernetes Infrastructure Engineer',
        headcount: 1,
        skillsRequired: ['Kubernetes Helm', 'eBPF networking', 'Prometheus/Grafana', 'Envoy proxy'],
        monthlyCost: '$12,500'
      },
      {
        id: 'hr-3',
        role: 'Security Compliance & Technical Project Manager',
        headcount: 1,
        skillsRequired: ['FIPS 140-3 submission', 'SOC 2 audits', 'Enterprise pilot management'],
        monthlyCost: '$9,800'
      }
    ],

    financialModel: [
      {
        category: 'CapEx',
        item: 'NVLAP FIPS 140-3 Accredited Lab Certification Fees',
        pilotCost: '$45,000',
        productionCost: '$120,000',
        notes: 'One-time laboratory audit, documentation, and government submission fee.'
      },
      {
        category: 'CapEx',
        item: 'Third-Party Independent Code Audit (Trail of Bits / NCC)',
        pilotCost: '$35,000',
        productionCost: '$55,000',
        notes: 'Covers white-box vulnerability audit and constant-time execution proofing.'
      },
      {
        category: 'OpEx',
        item: 'Continuous Cloud Infrastructure (Global Edge Nodes & CI)',
        pilotCost: '$1,800 / mo',
        productionCost: '$6,400 / mo',
        notes: 'Scales with telemetry ingest volume and edge proxy instance count.'
      },
      {
        category: 'OpEx',
        item: 'Engineering & Compliance Staff Payroll (3 FTEs)',
        pilotCost: '$38,800 / mo',
        productionCost: '$48,500 / mo',
        notes: 'Competitive market rates for specialized cryptographic engineering talent.'
      }
    ],

    failureModes: [
      {
        id: 'fail-1',
        failureMode: 'Middlebox MTU Fragmentation Handshake Stall',
        severity: 'high',
        probability: 'medium',
        impactAnalysis: 'Legacy enterprise firewalls or cellular carriers drop fragmented TLS ClientHello packets (> 1,280 bytes), causing connection timeouts for 0.5% - 2% of mobile users.',
        mitigationPlaybook: 'Implement adaptive TCP MSS clamping and automated fallback to hybrid ECDHE when middlebox drop is detected within 350ms.'
      },
      {
        id: 'fail-2',
        failureMode: 'Side-Channel Timing Leak in Vectorized Assembly',
        severity: 'catastrophic',
        probability: 'low',
        impactAnalysis: 'Variable memory access timing in AVX-512 polynomial multiplication could leak private key shares to co-located VM tenants via cache-timing attacks.',
        mitigationPlaybook: 'Verify all polynomial arithmetic with `dudect` statistical leakage detection and formal verification via the Coq proof assistant.'
      },
      {
        id: 'fail-3',
        failureMode: 'HSM Cryptographic Key Extraction Driver Crash',
        severity: 'high',
        probability: 'medium',
        impactAnalysis: 'Third-party PKCS#11 dynamic library crashes during high-concurrency key signing, terminating proxy worker threads.',
        mitigationPlaybook: 'Isolate PKCS#11 operations into sandboxed child processes using Linux seccomp filters and shared memory IPC; crash causes auto-restart without killing main proxy.'
      }
    ],

    readinessChecklist: [
      {
        id: 'chk-1',
        category: 'Security & Audit',
        task: 'Complete independent third-party cryptographic code review',
        isReady: false,
        priority: 'must-have',
        owner: 'Lead Cryptographer'
      },
      {
        id: 'chk-2',
        category: 'Packaging',
        task: 'Publish verified multi-arch Docker containers and Helm charts',
        isReady: true,
        priority: 'must-have',
        owner: 'SRE Lead'
      },
      {
        id: 'chk-3',
        category: 'Compliance',
        task: 'Execute CAVP test harness and submit FIPS 140-3 documentation',
        isReady: false,
        priority: 'must-have',
        owner: 'Compliance Lead'
      },
      {
        id: 'chk-4',
        category: 'Performance',
        task: 'Run 100k RPS soak test over public WAN with 45ms RTT',
        isReady: true,
        priority: 'must-have',
        owner: 'SRE Lead'
      },
      {
        id: 'chk-5',
        category: 'Operations',
        task: 'Establish 24/7 on-call rotation and automated PagerDuty paging',
        isReady: false,
        priority: 'should-have',
        owner: 'SRE Lead'
      },
      {
        id: 'chk-6',
        category: 'Documentation',
        task: 'Deliver enterprise zero-downtime migration documentation',
        isReady: true,
        priority: 'should-have',
        owner: 'Lead Cryptographer'
      }
    ]
  }
};

export const MOCK_HARDWARE_IMPACT_FEASIBILITY: ImpactFeasibilityReport = {
  projectId: 'proj-hw-aeropulse-px4',
  projectName: 'AeroPulse PX-4 Autonomous Search & Rescue UAV',
  projectType: 'hardware',
  compositeViabilityScore: 84.4,
  compositeConfidence: 96.2,
  evaluatedAt: '2026-09-04T19:25:00Z',
  evaluatorEngine: 'ProjectX-Ray Impact & Feasibility Matrix v4.2',
  executiveSummary: 'AeroPulse PX-4 delivers transformative social impact for underground mining safety and urban disaster recovery by entering collapsed, GPS-denied shafts where human responders cannot survive. High initial manufacturing retooling costs and FAA BVLOS waivers are offset by 78% operational cost savings compared to crewed helicopter SAR missions.',

  pillars: {
    // 1. SOCIAL IMPACT
    social: {
      pillarScore: 95.0,
      confidence: 97.5,
      weight: 25,
      headline: 'Saves lives in mine collapses, seismic disasters, and hazardous chemical environments.',
      summary: 'Replaces human emergency first-responders during the critical "Golden Hour" of disaster rescue, navigating zero-visibility subterranean tunnels via onboard optical flow and thermal SLAM.',
      peopleAffected: {
        id: 'sub-soc-hw-1',
        key: 'peopleAffected',
        name: 'People Affected & Direct Beneficiaries',
        score: 96,
        confidence: 98,
        weight: 35,
        metricValue: '14,000+ Miners',
        unit: 'protected across 24 regional mine sites',
        headline: 'Direct survival intervention for underground miners and seismic collapse victims',
        description: 'Deployed directly at industrial mine entrances and municipal disaster response centers to penetrate rubble within minutes of seismic alerts.',
        strengths: [
          'Navigates methane-rich, low-oxygen atmospheres without risking human rescue team lives.',
          'Carries two-way audio relay and emergency medical locator beacons.'
        ],
        limitations: [
          'Search radius constrained by 28-minute battery endurance in turbulent convective air currents.'
        ],
        evidence: [
          {
            id: 'ev-soc-hw-1',
            title: 'Global Mining Disaster Fatality Statistics',
            source: 'US Mine Safety and Health Administration (MSHA) Report, 2024',
            excerpt: '82% of trapped miner fatalities occur due to lack of real-time air quality mapping and delayed physical access within the first 3 hours.',
            verifiedValue: '14,000 miners in active pilot coverage zones'
          }
        ]
      },
      problemSeverity: {
        id: 'sub-soc-hw-2',
        key: 'problemSeverity',
        name: 'Problem Severity & Urgency',
        score: 98,
        confidence: 99,
        weight: 30,
        metricValue: 'Critical Life-Safety',
        unit: '42-minute survival window',
        headline: 'Prevents rescuer casualties while accelerating trapped survivor location',
        description: 'Secondary collapses routinely kill emergency first responders. AeroPulse creates 3D topological hazard maps and locates thermal signatures before humans enter.',
        strengths: [
          'Sub-centimeter obstacle avoidance prevents UAV crashes in confined 1.2-meter shafts.',
          'Onboard CO and CH4 gas sensors stream real-time toxicity maps.'
        ],
        limitations: [
          'Dense airborne dust particulate can attenuate optical cameras, requiring primary reliance on 77GHz radar.'
        ],
        evidence: [
          {
            id: 'ev-soc-hw-2',
            title: 'First Responder Safety Protocol Audit',
            source: 'National Institute for Occupational Safety and Health (NIOSH) IC 9534',
            excerpt: 'Autonomous UAV reconnaissance mandated as priority protocol prior to human descent in high-risk seismic zones.',
            verifiedValue: 'Ranked Priority #1 rescue intervention'
          }
        ]
      },
      accessibility: {
        id: 'sub-soc-hw-3',
        key: 'accessibility',
        name: 'Accessibility & Field Usability',
        score: 91,
        confidence: 95,
        weight: 15,
        metricValue: '1-Button Deploy',
        unit: 'Zero pilot training needed',
        headline: 'Autonomous launch and return requires zero manual pilot joystick skills',
        description: 'First responders press a single physical button on the ruggedized Pelican case; UAV executes autonomous shaft penetration, thermal scanning, and returns to home base.',
        strengths: [
          'Intuitive tablet touch interface operable with heavy industrial fire gloves.',
          'High-contrast emergency strobe and acoustic locator siren for survivors.'
        ],
        limitations: [
          'Ruggedized case weighs 14.8kg, requiring vehicular transport or two-person carry in rugged terrain.'
        ],
        evidence: [
          {
            id: 'ev-soc-hw-3',
            title: 'Firefighter Field Usability Assessment',
            source: 'field_tests/colorado_fire_station_12_usability.pdf',
            excerpt: 'Untrained volunteer firefighters successfully initiated autonomous reconnaissance missions in average time of 54 seconds.',
            verifiedValue: '54 second deployment time'
          }
        ]
      },
      publicBenefit: {
        id: 'sub-soc-hw-4',
        key: 'publicBenefit',
        name: 'Public Benefit & Humanitarian Impact',
        score: 95,
        confidence: 98,
        weight: 20,
        metricValue: 'Public Emergency Service',
        unit: 'Open telemetry specs',
        headline: 'Open-hardware avionics architecture enables municipal adoption',
        description: 'Hardware schematics and CAN-FD bus definitions published for municipal emergency integration, preventing proprietary defense contractor pricing gouging.',
        strengths: [
          'Public disaster relief organizations receive discounted open BOM manufacturing guides.',
          'Interoperable with standard NATO / FEMA disaster response mapping data layers.'
        ],
        limitations: [
          'Export controls (ITAR/EAR) apply to specialized long-range encrypted data link transmitters.'
        ],
        evidence: [
          {
            id: 'ev-soc-hw-4',
            title: 'FEMA Disaster Response Interoperability Standard',
            source: 'FEMA Technical Memorandum 2024-B',
            excerpt: 'Conforms to FEMA National Incident Management System (NIMS) geospatial exchange protocol.',
            verifiedValue: '100% NIMS compliant'
          }
        ]
      }
    },

    // 2. ECONOMIC IMPACT
    economic: {
      pillarScore: 82.8,
      confidence: 95.0,
      weight: 25,
      headline: 'Dramatically reduces cost per search-and-rescue hour while preventing costly mine shutdown fines.',
      summary: 'Operating a crewed search helicopter costs $2,400/hour with high weather risk. AeroPulse PX-4 executes confined inspection missions at $350/hour, slashing municipal emergency expenditures while reducing industrial downtime.',
      costSavings: {
        id: 'sub-econ-hw-1',
        key: 'costSavings',
        name: 'Cost Savings vs Crewed Emergency Missions',
        score: 91,
        confidence: 97,
        weight: 30,
        metricValue: '78% Cost Reduction',
        unit: '$350/hr vs $2,400/hr',
        headline: 'Drastic reduction in municipal and commercial rescue operation expenses',
        description: 'Replaces high-risk helicopter hover operations and multi-day manual shaft inspection teams with automated, rechargeable drone sorties.',
        strengths: [
          'Direct savings of ~$28,000 per search-and-rescue incident.',
          'Eliminates human liability insurance premiums during catastrophic shaft entries.'
        ],
        limitations: [
          'Airframe replacement cost ($14,500) if catastrophic rockfall destroys UAV during mission.'
        ],
        evidence: [
          {
            id: 'ev-econ-hw-1',
            title: 'International SAR Association Economic Analysis',
            source: 'Search and Rescue Quarterly Journal, Vol 18, 2024',
            excerpt: 'Average wilderness and subterranean SAR mission costs $42,600 using conventional helicopter and K-9 ground teams.',
            verifiedValue: '78% operational cost savings'
          }
        ]
      },
      affordability: {
        id: 'sub-econ-hw-2',
        key: 'affordability',
        name: 'Affordability & Unit Economics',
        score: 76,
        confidence: 93,
        weight: 25,
        metricValue: '$14,500 BOM',
        unit: 'Bill of Materials per UAV',
        headline: 'Competitive hardware BOM compared to $85,000+ defense tactical drones',
        description: 'Uses commercial off-the-shelf (COTS) optical sensors and custom PCB fabrication, achieving defense-grade autonomy at a fraction of military procurement costs.',
        strengths: [
          'Bill of materials costs 82% lower than Skydio X2D or Teledyne FLIR SIRAS.',
          'Modular motor arms can be replaced individually for $180 in the field.'
        ],
        limitations: [
          'Uncooled LWIR thermal camera sensor represents 38% of total hardware BOM cost ($5,500).'
        ],
        evidence: [
          {
            id: 'ev-econ-hw-2',
            title: 'Hardware Bill of Materials & Sourcing Audit',
            source: 'hardware/bom/aeropulse_px4_costed_bom_v2.xlsx',
            excerpt: 'Total costed BOM at 100-unit batch production is $14,482 per flight-ready Pelican kit.',
            verifiedValue: '$14,482 BOM at 100 units'
          }
        ]
      },
      marketRelevance: {
        id: 'sub-econ-hw-3',
        key: 'marketRelevance',
        name: 'Market Relevance & Addressable Market',
        score: 84,
        confidence: 94,
        weight: 25,
        metricValue: '$4.8 Billion',
        unit: 'Industrial Inspection & SAR UAV TAM',
        headline: 'Expanding demand across underground mining, oil & gas storage, and civil defense',
        description: 'Mining companies face strict regulatory mandates (OSHA, MSHA) requiring automated structural tunnel inspections before miners re-enter after blasting.',
        strengths: [
          'Immediate utility in non-emergency routine infrastructure inspections (sewers, metro tunnels, penstocks).',
          'High willingness to pay from mining conglomerates (Rio Tinto, BHP, Freeport).'
        ],
        limitations: [
          'Fragmented municipal fire department procurement processes with long public tender cycles.'
        ],
        evidence: [
          {
            id: 'ev-econ-hw-3',
            title: 'Autonomous Industrial UAV Market Forecast',
            source: 'MarketsAndMarkets Industrial Drone Report 2024-2030',
            excerpt: 'Confined-space and GPS-denied inspection drone sector growing at 24.2% CAGR through 2030.',
            verifiedValue: '$4.8B Confined Drone TAM'
          }
        ]
      },
      commercializationPotential: {
        id: 'sub-econ-hw-4',
        key: 'commercializationPotential',
        name: 'Commercialization Potential & DaaS Model',
        score: 80,
        confidence: 96,
        weight: 20,
        metricValue: 'Drone-as-a-Service (DaaS)',
        unit: '$3,800/mo subscription',
        headline: 'Recurring revenue through Drone-as-a-Service leasing, maintenance, and cloud 3D mapping',
        description: 'Hardware leased on 24-month service contracts including airframe swap warranty, automated battery health tracking, and cloud geospatial reconstruction processing.',
        strengths: [
          'High customer lifetime value (LTV:CAC ratio projected at 4.6:1).',
          'Enterprise software lock-in via proprietary subterranean 3D point cloud viewer.'
        ],
        limitations: [
          'Working capital intensive: requires financing inventory of hardware loaner units.'
        ],
        evidence: [
          {
            id: 'ev-econ-hw-4',
            title: 'Commercial DaaS Business Plan Pro-Forma',
            source: 'docs/business/daas_financial_projections_2026.pdf',
            excerpt: 'Pro-forma financial model demonstrates gross margin of 64% at 120 deployed subscription units.',
            verifiedValue: '64% gross margin on DaaS'
          }
        ]
      }
    },

    // 3. ENVIRONMENTAL IMPACT
    environmental: {
      pillarScore: 78.6,
      confidence: 96.0,
      weight: 20,
      headline: 'Zero direct tailpipe emissions with modular repairability, but requires responsible battery lifecycle recycling.',
      summary: 'Displaces fossil-fuel powered search helicopters (consuming 180 liters of Jet-A fuel per hour). The carbon footprint is dominated by lithium-polymer battery cells, necessitating a closed-loop recycling and remanufacturing agreement.',
      energyUsage: {
        id: 'sub-env-hw-1',
        key: 'energyUsage',
        name: 'Operational Energy Efficiency',
        score: 88,
        confidence: 98,
        weight: 35,
        metricValue: '190 Watts',
        unit: 'mean hover power consumption',
        headline: '99.4% energy reduction compared to conventional turbine helicopters',
        description: 'Draws 12.84A at 14.8V (190W) to maintain steady hover in subterranean air; full 28-minute flight consumes just 88 Watt-hours of electrical energy.',
        strengths: [
          'Recharged rapidly in the field via portable 100W solar blanket or truck 12V alternator.',
          'Regenerative braking on motor ESCs recovers 4.2% energy during descent maneuvers.'
        ],
        limitations: [
          'Flight in sub-zero mine environments reduces battery capacity by up to 22% unless self-heating resistors are active.'
        ],
        evidence: [
          {
            id: 'ev-env-hw-1',
            title: 'Empirical Battery Shunt Flight Telemetry',
            source: 'telemetry_logs/mine_shaft_flight_04.csv',
            excerpt: 'Recorded cumulative power consumption of 88.2 Wh over 27 minutes 48 seconds flight.',
            verifiedValue: '88.2 Wh per sortie'
          }
        ]
      },
      materialUsage: {
        id: 'sub-env-hw-2',
        key: 'materialUsage',
        name: 'Material Sourcing & Circularity',
        score: 72,
        confidence: 94,
        weight: 25,
        metricValue: '85% Recyclable',
        unit: 'Carbon fiber & CNC aluminum',
        headline: 'Aerospace-grade structural components designed for modular teardown',
        description: 'Frame uses CNC-milled 6061-T6 aluminum arms and Toray 3K carbon-fiber twill plates joined with stainless-steel hardware; zero permanent chemical glue bonds.',
        strengths: [
          'Damaged arms can be unbolted and remanufactured without scrapping central avionics core.',
          'All electronics conform to RoHS non-toxic solder specifications.'
        ],
        limitations: [
          'Carbon-fiber composite scrap recycling is energy-intensive compared to pure metals.'
        ],
        evidence: [
          {
            id: 'ev-env-hw-2',
            title: 'Airframe Teardown & Recyclability Report',
            source: 'hardware/cad/materials_recycling_audit.pdf',
            excerpt: '100% of aluminum chassis and 94% of PCB fasteners disassembled using standard 2.5mm hex tool in under 12 minutes.',
            verifiedValue: '85% recyclable mass'
          }
        ]
      },
      emissionsImplications: {
        id: 'sub-env-hw-3',
        key: 'emissionsImplications',
        name: 'Emissions Abatement vs Helicopters',
        score: 82,
        confidence: 97,
        weight: 20,
        metricValue: '-460 kg CO2',
        unit: 'saved per 3-hour search mission',
        headline: 'Avoids 460kg of direct aviation fossil-fuel combustion emissions per mission',
        description: 'A Bell 206 search helicopter emits ~154 kg CO2 per flight hour. AeroPulse operates with zero direct tailpipe emissions.',
        strengths: [
          'Zero local exhaust particulate in confined, unventilated subterranean mine shafts.',
          'Enables emergency response operations in volatile explosive methane atmospheres where open flames are hazardous.'
        ],
        limitations: [
          'Embodied carbon in initial battery manufacturing must be amortized over 250+ flight cycles.'
        ],
        evidence: [
          {
            id: 'ev-env-hw-3',
            title: 'Aviation Emissions Comparison Calculator',
            source: 'docs/environmental/helicopter_vs_uav_emissions.pdf',
            excerpt: 'Turbine Jet-A emissions (2.54 kg CO2/L) vs battery charging on clean grid yields 460 kg CO2 net savings per 3h operation.',
            verifiedValue: '-460 kg CO2 / mission'
          }
        ]
      },
      sustainability: {
        id: 'sub-env-4',
        key: 'sustainability',
        name: 'Battery Lifecycle & Closed-Loop Recycling',
        score: 70,
        confidence: 95,
        weight: 20,
        metricValue: '300 Cycles',
        unit: 'LiPo cell operational lifespan',
        headline: 'Requires formal closed-loop battery take-back agreement with certified recycler',
        description: 'High-discharge 4S 6000mAh LiPo batteries degrade to 80% original capacity after ~300 full flight cycles; depleted packs must be collected for hydrometallurgical lithium extraction.',
        strengths: [
          'Onboard smart battery management system (BMS) prevents overcharging and thermal runaway.',
          'Partnership drafted with Redwood Materials for retired pack recycling.'
        ],
        limitations: [
          'Lack of standardized battery disposal options at remote mountain mining sites.'
        ],
        evidence: [
          {
            id: 'ev-env-hw-4',
            title: 'BMS Telemetry & Battery Degradation Curves',
            source: 'hardware/bms/battery_aging_curves.csv',
            excerpt: 'Pack retained 81.4% nominal capacity at cycle 294 under simulated 15A continuous discharge.',
            verifiedValue: '294 cycles to 80% capacity'
          }
        ]
      }
    },

    // 4. FEASIBILITY
    feasibility: {
      pillarScore: 81.2,
      confidence: 96.5,
      weight: 30,
      headline: 'Flight-tested in subterranean salt mines; requires FAA BVLOS waivers and ruggedized retooling.',
      summary: 'AeroPulse has logged 34 successful autonomous flights in dark, GPS-denied environments. Scaling from prototype to field-deployable units requires injection-molded carbon-polycarbonate airframes, FAA Part 107 Beyond Visual Line of Sight (BVLOS) regulatory clearance, and formal shock/vibration MIL-STD-810H testing.',
      prototypeReadiness: {
        id: 'sub-feas-hw-1',
        key: 'prototypeReadiness',
        name: 'Prototype Readiness & TRL',
        score: 86,
        confidence: 98,
        weight: 20,
        metricValue: 'TRL 6',
        unit: 'Technology Readiness Level',
        headline: 'System prototype demonstrated in relevant operational environment (abandoned mine shafts)',
        description: 'Logged 34 autonomous missions in decommissioned underground salt mines; completed 3D lidar point-cloud mapping without human intervention.',
        strengths: [
          'Demonstrated collision-free navigation at 3.5 m/s in complete pitch-black darkness.',
          'Integrated fail-safe parachute deployed successfully in simulated motor failure test.'
        ],
        limitations: [
          'Current chassis is 3D printed nylon (SLS), which lacks certified IP67 water/dust ingress sealing.'
        ],
        evidence: [
          {
            id: 'ev-feas-hw-1',
            title: 'Operational Subterranean Flight Log Logbook',
            source: 'flight_tests/salt_mine_recon_logbook_2026.pdf',
            excerpt: '34 successful autonomous sorties completed in Hutchinson Salt Mine. Mean navigational drift 0.84cm over 100m trajectory.',
            verifiedValue: '34 successful underground flights'
          }
        ]
      },
      deploymentComplexity: {
        id: 'sub-feas-hw-2',
        key: 'deploymentComplexity',
        name: 'Deployment Complexity & Field Logistics',
        score: 78,
        confidence: 95,
        weight: 15,
        metricValue: 'Moderate-High',
        unit: 'Field prep & sensor cal',
        headline: 'Requires optical sensor cleanliness and compass calibration in high-iron mine drifts',
        description: 'High magnetic interference from iron-ore seams requires manual compass declination disabling and reliance on dual RTK GPS and optical flow.',
        strengths: [
          'Pre-flight self-test completes automatically in 38 seconds upon lid opening.',
          'Ruggedized waterproof charging case handles rough transport in pickup trucks.'
        ],
        limitations: [
          'Lens cleaning required after flights in damp dust-heavy mine environments.'
        ],
        evidence: [
          {
            id: 'ev-feas-hw-2',
            title: 'Magnetic Disturbance Rejection Test',
            source: 'tests/sensors/magnetometer_drift_mitigation.log',
            excerpt: 'EKF successfully bypassed contaminated compass yaw using visual-inertial odometry fusion with zero yaw divergence.',
            verifiedValue: 'Zero yaw divergence with VIO fallback'
          }
        ]
      },
      infrastructureRequirements: {
        id: 'sub-feas-hw-3',
        key: 'infrastructureRequirements',
        name: 'Infrastructure & Ground Support Requirements',
        score: 84,
        confidence: 96,
        weight: 15,
        metricValue: 'Self-Contained Ground Station',
        unit: 'Rugged Pelican Kit',
        headline: 'Completely self-contained field ground station operates independent of cellular networks',
        description: 'Includes dual 915MHz telemetry transceivers, local Wi-Fi 6 hotspot, and high-brightness sunlight-readable IP65 tablet for the incident commander.',
        strengths: [
          'Zero reliance on cloud connectivity; all 3D SLAM mapping computed directly onboard UAV.',
          'Hot-swappable battery bays allow continuous flight operations.'
        ],
        limitations: [
          'Deep underground penetration beyond 450 meters requires dropping relay node repeaters at tunnel bends.'
        ],
        evidence: [
          {
            id: 'ev-feas-hw-3',
            title: 'RF Signal Penetration Study in Rock Strata',
            source: 'hardware/comms/rf_penetration_rock_tests.pdf',
            excerpt: '915MHz COFDM video link maintained 1080p stream through 3 tunnel bends (380m penetration) before requiring relay dropper.',
            verifiedValue: '380m direct link without relay'
          }
        ]
      },
      maintenance: {
        id: 'sub-feas-hw-4',
        key: 'maintenance',
        name: 'Maintenance & Serviceability',
        score: 80,
        confidence: 96,
        weight: 15,
        metricValue: 'Field Swappable',
        unit: 'Modular motor quick-release',
        headline: 'Quick-release arms allow motor replacement in under 3 minutes with single hex tool',
        description: 'Avionics stack is hermetically isolated from motor arms; damaged carbon tubes detach via captive thumbscrew connectors.',
        strengths: [
          'Non-technical field technicians can swap propellers and arms without soldering.',
          'Automated motor bearing vibration analysis detects impending mechanical failure.'
        ],
        limitations: [
          'Optical flow lenses require specialized alignment jig if camera assembly is replaced.'
        ],
        evidence: [
          {
            id: 'ev-feas-hw-4',
            title: 'Mean Time to Repair (MTTR) Field Evaluation',
            source: 'maintenance/manual/mttr_field_evaluation.pdf',
            excerpt: 'Average motor arm replacement time measured at 2 minutes 45 seconds across 10 trials.',
            verifiedValue: '2 min 45 sec MTTR'
          }
        ]
      },
      scalability: {
        id: 'sub-feas-hw-5',
        key: 'scalability',
        name: 'Manufacturing Scalability & Yield',
        score: 75,
        confidence: 96,
        weight: 20,
        metricValue: 'Retooling Needed',
        unit: 'From 3D print to injection mold',
        headline: 'Transition from low-volume CNC/SLS printing to tooling-hardened batch production',
        description: 'Current unit production capacity is limited to 4 units per month; requires $180k tooling investment in carbon-composite injection molds to achieve 50 units/month.',
        strengths: [
          'PCB surface-mount assembly (SMT) already automated and compatible with high-volume pick-and-place lines.',
          'Established component sourcing agreements with Holybro and STMicroelectronics.'
        ],
        limitations: [
          '16-week lead time on military-grade thermal camera sensor cores (FLIR Boson).'
        ],
        evidence: [
          {
            id: 'ev-feas-hw-5',
            title: 'Contract Manufacturing Feasibility Study',
            source: 'manufacturing/dfm/contract_manufacturer_rfq.pdf',
            excerpt: 'RFQ from Tier-1 avionics manufacturer confirms unit cost drops from $14.5k to $7.8k at 500-unit annual run rate.',
            verifiedValue: '46% unit cost drop at 500 units'
          }
        ]
      },
      estimatedCost: {
        id: 'sub-feas-hw-6',
        key: 'estimatedCost',
        name: 'Estimated Production Rollout Cost',
        score: 84,
        confidence: 97,
        weight: 15,
        metricValue: '$1,200,000',
        unit: 'Total commercialization CapEx',
        headline: 'Includes injection tooling, MIL-STD testing, and FAA BVLOS waiver filings',
        description: 'Comprehensive financial plan to build initial 50-unit commercial fleet, obtain regulatory certifications, and deploy to regional search-and-rescue teams.',
        strengths: [
          'High hardware resale value and strong recurring service contract margins.',
          'Eligible for federal FEMA and Department of Energy innovation research grants.'
        ],
        limitations: [
          'Substantial upfront tooling and regulatory legal expenditure before unit revenue.'
        ],
        evidence: [
          {
            id: 'ev-feas-hw-6',
            title: 'Comprehensive Commercialization Capital Budget',
            source: 'docs/financials/aeropulse_commercial_budget_v3.xlsx',
            excerpt: 'Tooling ($240k) + MIL-STD testing ($160k) + FAA legal waivers ($180k) + initial inventory ($620k) = $1.2M.',
            verifiedValue: '$1.2M total capital requirement'
          }
        ]
      }
    }
  },

  industryBenchmarks: {
    social: 72.0,
    economic: 65.0,
    environmental: 58.0,
    feasibility: 68.0
  },

  // ROADMAP
  roadmap: [
    {
      id: 'prototype',
      stageName: 'Prototype Phase',
      trlLevel: 'TRL 6',
      status: 'active',
      badgeLabel: 'Current Operational State',
      duration: 'Completed (Months 1 - 12)',
      targetTimeline: 'Q1 2026 (Completed)',
      budgetEstimate: '$140,000 (DARPA SubT Grant)',
      validationCohort: 'Salt mine testing & university seismic simulators',
      summary: 'Designed custom 4-layer flight controller PCB, implemented visual-inertial odometry fusion on STM32H753, executed 34 autonomous tunnel sorties in decommissioned mines.',
      gatingCriteria: [
        'Demonstrate zero-drift autonomous flight in 0-lux total darkness.',
        'Sub-centimeter obstacle avoidance reliability at 3 m/s.',
        'Emergency parachute deployment triggers reliably in free-fall.'
      ],
      milestones: [
        {
          id: 'ms-hw-p1',
          title: 'Custom avionics PCB layout and fabrication',
          status: 'completed',
          deliverable: 'Rev B 4-layer PCB with split analog/digital ground planes',
          targetDate: '2025-08-20',
          verificationEvidence: 'hardware/schematics/aeropulse_rev_b.kicad_pcb'
        },
        {
          id: 'ms-hw-p2',
          title: 'Optical flow & thermal SLAM algorithm integration',
          status: 'completed',
          deliverable: 'Real-time 3D point cloud generation on Nvidia Jetson Orin Nano',
          targetDate: '2025-12-10',
          verificationEvidence: 'flight_tests/pointclouds/shaft_4.pcd'
        },
        {
          id: 'ms-hw-p3',
          title: 'Supercapacitor ballistic parachute emergency ejection',
          status: 'completed',
          deliverable: '12ms actuation in simulated motor loss',
          targetDate: '2026-02-15',
          verificationEvidence: 'drop_tests/parachute_deployment_slowmo.mp4'
        }
      ],
      keyRisks: [
        'Single-source vulnerability on specialized uncooled LWIR thermal camera cores.'
      ]
    },
    {
      id: 'pilot',
      stageName: 'Pilot Field Deployment',
      trlLevel: 'TRL 7',
      status: 'next',
      badgeLabel: 'Operational Field Trial',
      duration: '8 Months (Months 13 - 20)',
      targetTimeline: 'Q3 2026 - Q1 2027',
      budgetEstimate: '$420,000',
      validationCohort: '5 active regional SAR task forces & 2 operational commercial mines',
      summary: 'Equip 5 emergency search-and-rescue squads with Pelican ground station kits. Conduct live field exercises during simulated earthquake rubble searches and underground mining inspections.',
      gatingCriteria: [
        'Zero pilot crashes across 100 logged operational rescue training missions.',
        'Mean deployment time from case opening to airborne state < 60 seconds.',
        '100% telemetry link stability through 300 meters of subterranean rock.'
      ],
      milestones: [
        {
          id: 'ms-hw-f1',
          title: 'Build batch of 10 flight-ready field trial UAV kits',
          status: 'in-progress',
          deliverable: 'Pelican case kits with dual batteries, tablet, and charging dock',
          targetDate: '2026-08-30'
        },
        {
          id: 'ms-hw-f2',
          title: 'Execute simulated live-fire mine disaster exercise',
          status: 'planned',
          deliverable: 'Full SAR evaluation report from West Virginia Mine Safety Board',
          targetDate: '2026-10-31'
        },
        {
          id: 'ms-hw-f3',
          title: 'File FAA Part 107 BVLOS waiver application',
          status: 'planned',
          deliverable: 'Formal waiver authorization for emergency responder operation',
          targetDate: '2027-01-15'
        }
      ],
      keyRisks: [
        'Radio frequency attenuation in unknown rock strata containing high water or mineral content.'
      ]
    },
    {
      id: 'production',
      stageName: 'Commercial Mass Production',
      trlLevel: 'TRL 9',
      status: 'future',
      badgeLabel: 'Industrial Fleet Scaling',
      duration: '14+ Months (Months 21 - 34)',
      targetTimeline: '2027 - 2028',
      budgetEstimate: '$1,200,000',
      validationCohort: 'Global mining conglomerates, FEMA urban search units, international rescue NGOs',
      summary: 'Tool hard injection molds for carbon-polycarbonate airframes, achieve IP67 environmental sealing certification, establish certified SMT contract manufacturing line producing 50 units/month.',
      gatingCriteria: [
        'MIL-STD-810H environmental and shock test certification.',
        'IP67 ingress protection certification for water immersion and dust resistance.',
        'CE and FCC Class B commercial electromagnetic compatibility compliance.'
      ],
      milestones: [
        {
          id: 'ms-hw-s1',
          title: 'Tooling of carbon-polycarbonate injection molds',
          status: 'planned',
          deliverable: 'Production injection mold sets producing IP67 sealed chassis',
          targetDate: '2027-05-30'
        },
        {
          id: 'ms-hw-s2',
          title: 'MIL-STD-810H and IP67 certified testing laboratory audit',
          status: 'planned',
          deliverable: 'Formal test certificates for thermal shock, drop, and moisture',
          targetDate: '2027-08-31'
        },
        {
          id: 'ms-hw-s3',
          title: 'High-volume contract manufacturing production line activation',
          status: 'planned',
          deliverable: 'Validated manufacturing line achieving 50 flight-ready kits/month',
          targetDate: '2027-11-30'
        }
      ],
      keyRisks: [
        'ITAR / export control constraints restricting international distribution to humanitarian NGOs.'
      ]
    }
  ],

  // DEPLOYMENT BLUEPRINT
  realWorldDeployment: {
    executiveSummary: 'Deploying AeroPulse PX-4 in municipal and industrial emergency sectors demands navigating hardware ruggedization, environmental sealing certifications (IP67 / MIL-STD-810H), FAA Part 107 BVLOS regulatory authorizations, and closed-loop lithium battery logistics. The primary commercial bottleneck is capital expenditure for hard tooling.',
    totalRunwayNeeded: '$1,200,000 (20 Months to Profitable Fleet Deployment)',
    estimatedTimeToProduction: '16 Months to First Commercial Batch Delivery',

    regulatory: [
      {
        id: 'reg-hw-1',
        standard: 'FAA Part 107 Beyond Visual Line of Sight (BVLOS) Waiver',
        governingBody: 'Federal Aviation Administration (FAA)',
        status: 'pending',
        urgency: 'critical',
        description: 'Required for search-and-rescue UAV operations where the drone enters buildings, tunnels, or forest canopies out of direct operator sight.',
        requiredAction: 'File formal Specific Operations Risk Assessment (SORA) and demonstrated automated fail-safe parachute data.'
      },
      {
        id: 'reg-hw-2',
        standard: 'MIL-STD-810H Environmental Testing Certification',
        governingBody: 'Department of Defense / Commercial Labs',
        status: 'pending',
        urgency: 'high',
        description: 'Mandatory for municipal fire department procurement; certifies operation in extreme temperatures (-20°C to +55°C) and heavy shock/vibration.',
        requiredAction: 'Contract certified environmental lab (e.g. NTS or Element) for thermal chamber and shaker table testing.'
      },
      {
        id: 'reg-hw-3',
        standard: 'FCC Part 15 Class B & CE Radio Certification',
        governingBody: 'FCC (USA) & CE (European Union)',
        status: 'in-review',
        urgency: 'high',
        description: 'Required for legal commercial sale of 915MHz and 2.4GHz video transmitters and digital avionics.',
        requiredAction: 'Complete anechoic chamber radiated emissions testing.'
      }
    ],

    infrastructure: [
      {
        id: 'inf-hw-1',
        category: 'supply-chain',
        name: 'Long-Lead LWIR Thermal Sensor Allocation',
        specification: 'FLIR Boson 640x512 60Hz uncooled VOx microbolometer cores',
        leadTime: '16 - 20 weeks lead time',
        bottleneckRisk: 'high',
        mitigation: 'Place advance 50-unit blanket purchase order with distributor and evaluate secondary European supplier (Lynred).'
      },
      {
        id: 'inf-hw-2',
        category: 'hardware',
        name: 'Optical Sensor Calibration Tunnel & Alignment Rig',
        specification: 'Dark tunnel with high-contrast optical targets and Vicon motion capture tracking',
        leadTime: '6 weeks construction',
        bottleneckRisk: 'medium',
        mitigation: 'Lease university robotics motion capture lab for batch sensor calibration.'
      },
      {
        id: 'inf-hw-3',
        category: 'compute',
        name: 'Cloud Point Cloud Processing & Map Hosting Infrastructure',
        specification: 'AWS S3 + GPU-accelerated photogrammetry cluster (g5.2xlarge)',
        leadTime: 'Immediate setup',
        bottleneckRisk: 'low',
        mitigation: 'Implement auto-scaling worker nodes triggered upon mission completion.'
      }
    ],

    humanResources: [
      {
        id: 'hr-hw-1',
        role: 'Lead Avionics & Embedded Firmware Engineer',
        headcount: 1,
        skillsRequired: ['STM32 C/C++', 'PX4 Autopilot', 'CAN-FD bus', 'EKF sensor fusion'],
        monthlyCost: '$15,000'
      },
      {
        id: 'hr-hw-2',
        role: 'Lead Mechanical DFM & Injection Molding Engineer',
        headcount: 1,
        skillsRequired: ['SolidWorks', 'Injection mold tooling', 'IP67 sealing', 'Thermal CFD'],
        monthlyCost: '$13,500'
      },
      {
        id: 'hr-hw-3',
        role: 'SAR Operations Specialist & Regulatory Liaison',
        headcount: 1,
        skillsRequired: ['FAA Part 107 BVLOS', 'First responder training', 'Field logistics'],
        monthlyCost: '$11,000'
      }
    ],

    financialModel: [
      {
        category: 'CapEx',
        item: 'Hard Tooling for Carbon-Polycarbonate Injection Molds',
        pilotCost: '$40,000 (Soft tooling)',
        productionCost: '$240,000 (Hardened steel molds)',
        notes: 'Enables IP67 sealing and reduces chassis production time from 36 hours to 4 minutes.'
      },
      {
        category: 'CapEx',
        item: 'MIL-STD-810H and IP67 Testing Laboratory Fees',
        pilotCost: '$25,000',
        productionCost: '$160,000',
        notes: 'Independent accredited test laboratory certifications.'
      },
      {
        category: 'OpEx',
        item: 'Hardware Component Inventory & Safety Stock (50 Units)',
        pilotCost: '$145,000',
        productionCost: '$420,000',
        notes: 'Advance component purchasing to mitigate 16-week thermal sensor lead times.'
      },
      {
        category: 'OpEx',
        item: 'Engineering & Field Logistics Payroll (3 FTEs)',
        pilotCost: '$39,500 / mo',
        productionCost: '$52,000 / mo',
        notes: 'Covers core avionics, mechanical, and regulatory operations personnel.'
      }
    ],

    failureModes: [
      {
        id: 'fail-hw-1',
        failureMode: 'Optical Camera Dust Obscuration in Collapsed Shaft',
        severity: 'high',
        probability: 'high',
        impactAnalysis: 'Turbulent air from quadrotor propellers stirs fine coal or silica dust, blinding optical flow cameras within 90 seconds.',
        mitigationPlaybook: 'EKF estimator automatically switches primary position hold to 77GHz mmWave radar and forward-looking thermal camera, which penetrate dense airborne particulate.'
      },
      {
        id: 'fail-hw-2',
        failureMode: 'Loss of RF Telemetry Link in Deep Subterranean S-Turns',
        severity: 'high',
        probability: 'medium',
        impactAnalysis: 'Dense rock strata attenuates 915MHz radio link, severing live video feed to the surface incident commander.',
        mitigationPlaybook: 'UAV autonomously executes 180-degree backtrack maneuver until link is restored; if link remains severed for 45 seconds, returns to surface launch coordinates.'
      },
      {
        id: 'fail-hw-3',
        failureMode: 'Brushless Motor Bearing Seizure from Moisture/Mud',
        severity: 'catastrophic',
        probability: 'low',
        impactAnalysis: 'Underground water ingress seizes motor bearing, causing immediate quadrotor thrust asymmetry and uncontrolled descent.',
        mitigationPlaybook: 'Onboard IMU detects angular rate spike (> 300 deg/sec) and fires ballistic supercapacitor parachute in < 12ms, soft-landing the airframe safely.'
      }
    ],

    readinessChecklist: [
      {
        id: 'chk-hw-1',
        category: 'Airframe Tooling',
        task: 'Finalize DFM injection mold design with contract tooling manufacturer',
        isReady: false,
        priority: 'must-have',
        owner: 'Mechanical Lead'
      },
      {
        id: 'chk-hw-2',
        category: 'Testing',
        task: 'Execute 50-hour continuous salt-mine durability and dust endurance test',
        isReady: true,
        priority: 'must-have',
        owner: 'Avionics Lead'
      },
      {
        id: 'chk-hw-3',
        category: 'Regulatory',
        task: 'Submit FAA Part 107 BVLOS emergency responder waiver dossier',
        isReady: false,
        priority: 'must-have',
        owner: 'Regulatory Liaison'
      },
      {
        id: 'chk-hw-4',
        category: 'Supply Chain',
        task: 'Secure 50-unit allocation contract for FLIR Boson thermal camera cores',
        isReady: false,
        priority: 'must-have',
        owner: 'Operations Lead'
      },
      {
        id: 'chk-hw-5',
        category: 'Packaging',
        task: 'Deliver Pelican case field charging dock with hot-swap battery bays',
        isReady: true,
        priority: 'should-have',
        owner: 'Mechanical Lead'
      },
      {
        id: 'chk-hw-6',
        category: 'Documentation',
        task: 'Publish first-responder field manual and 1-button launch guide',
        isReady: true,
        priority: 'should-have',
        owner: 'Regulatory Liaison'
      }
    ]
  }
};
