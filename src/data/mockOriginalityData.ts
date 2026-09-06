import type { OriginalityReport } from '../types/originalityIntelligence';

export const MOCK_SOFTWARE_ORIGINALITY: OriginalityReport = {
  projectId: 'quantumkey-tls',
  projectName: 'QuantumKey TLS v1.3 Post-Quantum Proxy',
  projectType: 'software',
  originalityScore: 86.4,
  similarityScore: 13.6,
  confidenceScore: 96.8,
  verdictSynthesis:
    'Demonstrates high architectural originality in uniting AVX-512 vector acceleration with an asynchronous thread-per-core Rust reverse proxy. Prior art exists in standard ML-KEM-1024 NIST reference implementations and general Envoy/Rustls proxy topologies; however, the zero-copy hybrid key-exchange pipeline and embedded ONNX anomaly detection engine represent novel, defensible engineering contributions.',
  disclaimer:
    'Ethical Review Standard: In accordance with institutional jury guidelines, similarity metrics reflect technological lineage, shared mathematical standards, and open-source library overlap. Scores do not constitute claims of improper copying.',
  scannedCorpusCount: '4.8M GitHub Repositories · 240k arXiv/IEEE Papers · 850k USPTO/EPO Patents · 12,000 Products',
  timestamp: '2026-09-04T19:30:00Z',
  categoryStats: {
    github: {
      category: 'github',
      label: 'GitHub Repositories',
      itemCount: 4,
      averageSimilarity: 18.2,
      maxSimilarity: 34.0,
      confidence: 97.4,
      topMatches: ['rustls/rustls', 'open-quantum-safe/liboqs-rust', 'envoyproxy/envoy-wasm'],
    },
    'research-papers': {
      category: 'research-papers',
      label: 'Research Papers',
      itemCount: 4,
      averageSimilarity: 22.5,
      maxSimilarity: 41.0,
      confidence: 98.2,
      topMatches: ['Schwabe et al. (CRYPTO 2022)', 'NIST FIPS 203 ML-KEM Spec', 'Albrecht et al. (ACM CCS 2024)'],
    },
    patents: {
      category: 'patents',
      label: 'Patents & IP Filings',
      itemCount: 2,
      averageSimilarity: 9.8,
      maxSimilarity: 14.5,
      confidence: 95.1,
      topMatches: ['US11843512B2 (Cloudflare PQC)', 'EP3982591A1 (IBM Hybrid Key Exchange)'],
    },
    products: {
      category: 'products',
      label: 'Commercial Products',
      itemCount: 3,
      averageSimilarity: 15.4,
      maxSimilarity: 28.0,
      confidence: 96.5,
      topMatches: ['Cloudflare SSL/TLS Post-Quantum', 'AWS KMS Post-Quantum TLS', 'Nginx Plus v1.26'],
    },
    startups: {
      category: 'startups',
      label: 'Emerging Startups',
      itemCount: 2,
      averageSimilarity: 11.2,
      maxSimilarity: 19.0,
      confidence: 94.0,
      topMatches: ['QuBalt Security (YC W24)', 'PostQuantum Technologies'],
    },
    websites: {
      category: 'websites',
      label: 'Documentation & Tech Blogs',
      itemCount: 3,
      averageSimilarity: 14.0,
      maxSimilarity: 22.0,
      confidence: 95.8,
      topMatches: ['Cloudflare Research Blog', 'Rust Async Book', 'NIST PQC Standardization Portal'],
    },
    youtube: {
      category: 'youtube',
      label: 'YouTube & Tech Talks',
      itemCount: 2,
      averageSimilarity: 8.5,
      maxSimilarity: 12.0,
      confidence: 93.4,
      topMatches: ['Real World Crypto 2024 Talk', 'RustConf 2023: High Performance Proxies'],
    },
    'academic-projects': {
      category: 'academic-projects',
      label: 'Academic Projects & Theses',
      itemCount: 3,
      averageSimilarity: 19.8,
      maxSimilarity: 36.5,
      confidence: 96.0,
      topMatches: ['ETH Zurich Systems Group Thesis', 'MIT CSAIL Lattice Proxy Project'],
    },
  },
  priorArtItems: [
    {
      id: 'sw-prior-01',
      title: 'liboqs-rust: Rust Bindings for Open Quantum Safe',
      entityOrAuthors: 'Open Quantum Safe (OQS) Consortium',
      releaseDate: '2021-04-12',
      year: 2021,
      sourceCategory: 'github',
      sourceUrl: 'github.com/open-quantum-safe/liboqs-rust',
      similarityPercentage: 34.0,
      confidenceScore: 98.5,
      label: 'Inspired',
      matchingComponents: [
        {
          name: 'FFI Interface to Kyber C primitives',
          description: 'Both projects bind into NIST round-3 ML-KEM polynomial arrays.',
          parityLevel: 'structural',
        },
        {
          name: 'Keypair Generation Signatures',
          description: 'Identical function parameters for public key serialization format.',
          parityLevel: 'conceptual',
        },
      ],
      similarityExplanation:
        'The evaluated project adopts the cryptographic type definitions from OQS but completely replaces the external C dynamic library dependency with a pure-Rust, zero-unsafe AVX-512 SIMD engine.',
      differentiationSummary:
        '100% pure-Rust memory safety guarantees and direct SIMD intrinsics bypassing foreign function call (FFI) overhead.',
      verbatimExcerpt:
        'pub fn crypto_kem_keypair(pk: &mut [u8], sk: &mut [u8]) -> Result<(), OqsError> { ... }',
      provenanceRef: 'github.com/open-quantum-safe/liboqs-rust · commit #e1a90c',
    },
    {
      id: 'sw-prior-02',
      title: 'Vectorized NTT Polynomial Multiplication in ML-KEM',
      entityOrAuthors: 'Schwabe, Boemer & Yang (CRYPTO 2022)',
      releaseDate: '2022-08-18',
      year: 2022,
      sourceCategory: 'research-papers',
      sourceUrl: 'doi.org/10.1007/978-3-031-15982-4_12',
      similarityPercentage: 41.0,
      confidenceScore: 99.1,
      label: 'Moderately Similar',
      matchingComponents: [
        {
          name: 'Cooley-Tukey NTT Butterfly Permutations',
          description: 'Shares the mathematical modulus q=3329 and 256-point polynomial ring transform.',
          parityLevel: 'algorithmic',
        },
        {
          name: 'Montgomery Reduction Constant-Time Bounds',
          description: 'Same algebraic reduction bounds used to prevent timing side-channels.',
          parityLevel: 'algorithmic',
        },
      ],
      similarityExplanation:
        'The NTT polynomial multiplication implementation adheres directly to the mathematical equations published in this seminal paper. The paper provided the algorithmic proof, while QuantumKey engineered the async multi-core proxy wrapper.',
      differentiationSummary:
        'Novel lock-free ring-buffer integration and hardware splice(2) pipelining not explored in the theoretical paper.',
      verbatimExcerpt:
        'Theorem 2: Cooley-Tukey NTT with Montgomery factor R = 2^16 mod 3329 achieves constant-time execution over Z_q[X]/(X^256 + 1).',
      provenanceRef: 'arXiv:2205.04388 [cs.CR] · Section 4 (Vectorized Montgomery)',
    },
    {
      id: 'sw-prior-03',
      title: 'US Patent 11843512B2: Hybrid Classical and Post-Quantum TLS Handshakes',
      entityOrAuthors: 'Cloudflare, Inc. (Inventors: Nick Sullivan et al.)',
      releaseDate: '2023-01-14',
      year: 2023,
      sourceCategory: 'patents',
      sourceUrl: 'patents.google.com/patent/US11843512B2',
      similarityPercentage: 14.5,
      confidenceScore: 95.2,
      label: 'Inspired',
      matchingComponents: [
        {
          name: 'Dual Key Share Encapsulation',
          description: 'ClientHello extension transmitting classical X25519 and PQC Kyber keyshares in parallel.',
          parityLevel: 'conceptual',
        },
      ],
      similarityExplanation:
        'The general architecture of concatenating classical and post-quantum shared secrets is patented by Cloudflare for enterprise CDN edge nodes. QuantumKey conforms to the open IETF TLS 1.3 draft specification implementing this concept.',
      differentiationSummary:
        'QuantumKey is an open-source, lightweight edge proxy designed for on-premise unix sockets, rather than an all-in-one proprietary CDN edge network.',
      verbatimExcerpt:
        'Claim 1: A method comprising receiving a ClientHello including a hybrid key share comprising a first elliptical curve share and a second lattice-based share...',
      provenanceRef: 'USPTO Patent #11,843,512 B2 · Column 8, Lines 14-36',
    },
    {
      id: 'sw-prior-04',
      title: 'Cloudflare Post-Quantum Cryptography Edge Termination',
      entityOrAuthors: 'Cloudflare Enterprise Products',
      releaseDate: '2023-09-20',
      year: 2023,
      sourceCategory: 'products',
      sourceUrl: 'cloudflare.com/ssl/post-quantum-cryptography',
      similarityPercentage: 28.0,
      confidenceScore: 97.0,
      label: 'Moderately Similar',
      matchingComponents: [
        {
          name: 'Hybrid X25519Kyber768 Draft Negotiation',
          description: 'Both support draft-ietf-tls-hybrid-design cipher suites.',
          parityLevel: 'structural',
        },
        {
          name: 'Edge TLS Offloading to Upstream HTTP/1.1',
          description: 'Decrypting at proxy boundary and forwarding unencrypted or mTLS traffic.',
          parityLevel: 'structural',
        },
      ],
      similarityExplanation:
        'High functional similarity at the protocol boundary because both implement the emerging IETF TLS standard. Cloudflare operates as a massive SaaS, while QuantumKey is a standalone containerized proxy.',
      differentiationSummary:
        'QuantumKey features embedded ONNX cryptanalytic anomaly detection and runs independently within self-hosted private air-gapped VPCs.',
      verbatimExcerpt:
        '"Cloudflare now enables post-quantum key exchange by default on all inbound connections using X25519 + ML-KEM."',
      provenanceRef: 'Cloudflare Technical Documentation · Release v2.4 (September 2023)',
    },
    {
      id: 'sw-prior-05',
      title: 'QuBalt Quantum-Safe Microservices Mesh',
      entityOrAuthors: 'QuBalt Security (YC W24)',
      releaseDate: '2024-02-15',
      year: 2024,
      sourceCategory: 'startups',
      sourceUrl: 'qubalt.io/platform',
      similarityPercentage: 19.0,
      confidenceScore: 94.2,
      label: 'Inspired',
      matchingComponents: [
        {
          name: 'Sidecar Proxy Deployment Topology',
          description: 'Kubernetes sidecar model offloading TLS termination from internal microservice pods.',
          parityLevel: 'structural',
        },
      ],
      similarityExplanation:
        'Both projects target the enterprise migration to post-quantum readiness via transparent proxying rather than rewriting application services.',
      differentiationSummary:
        'QuBalt focuses on a commercial SaaS telemetry control-plane, whereas QuantumKey provides low-level AVX-512 SIMD assembly optimizations.',
      verbatimExcerpt:
        '"Transparent PQC sidecar proxy protecting legacy REST endpoints without requiring source code modifications."',
      provenanceRef: 'Y Combinator Winter 2024 Directory · Security & Infrastructure',
    },
    {
      id: 'sw-prior-06',
      title: 'Lattice-Based TLS Proxies for High-Throughput Financial Gateways',
      entityOrAuthors: 'ETH Zurich Systems Group (Master Thesis by M. Vetsch)',
      releaseDate: '2024-06-10',
      year: 2024,
      sourceCategory: 'academic-projects',
      sourceUrl: 'syssec.ethz.ch/theses/vetsch_2024_pqc_proxy.pdf',
      similarityPercentage: 36.5,
      confidenceScore: 96.8,
      label: 'Moderately Similar',
      matchingComponents: [
        {
          name: 'Rustls Engine Custom Key Exchange Hooks',
          description: 'Forked rustls handshake state machine to inject experimental Kyber key shares.',
          parityLevel: 'algorithmic',
        },
        {
          name: 'Epoll Async Concurrency Architecture',
          description: 'Benchmark harness measuring P99 latency under 100k TCP connections.',
          parityLevel: 'structural',
        },
      ],
      similarityExplanation:
        'Shares significant structural methodology with the ETH thesis, including utilizing Tokio and custom Rustls cipher suites. QuantumKey extends this with production-grade seccomp sandboxing, zero-copy splice, and ONNX anomaly detection.',
      differentiationSummary:
        'Production hardening with seccomp-bpf, automated AFL++ fuzzing harness, and enterprise gRPC management API.',
      verbatimExcerpt:
        '"We present an evaluation of Kyber-768 key exchanges in an asynchronous Rust reverse proxy achieving 80k handshakes/sec."',
      provenanceRef: 'ETH Zurich Research Collection · Handle: 20.500.11850/612984',
    },
    {
      id: 'sw-prior-07',
      title: 'Real World Crypto 2024: Deploying PQC at Hyper-Scale',
      entityOrAuthors: 'Real World Crypto Symposium',
      releaseDate: '2024-11-28',
      year: 2024,
      sourceCategory: 'youtube',
      sourceUrl: 'youtube.com/watch?v=RWC2024_PQC_Scale',
      similarityPercentage: 12.0,
      confidenceScore: 93.8,
      label: 'Original',
      matchingComponents: [
        {
          name: 'Packet Fragmentation Discussion',
          description: 'Observations on TCP MTU boundaries when transmitting larger Kyber-1024 public keys.',
          parityLevel: 'conceptual',
        },
      ],
      similarityExplanation:
        'Conference presentation outlining operational challenges with enlarged public keys causing TCP reassembly overhead. QuantumKey addresses this challenge via optimized ring buffer pre-allocation.',
      differentiationSummary:
        'Original ring-buffer allocation strategy preventing packet fragment stall.',
      verbatimExcerpt:
        '"Speakers highlighted that ML-KEM-1024 exceeds standard 1500-byte MTU, requiring robust TCP segment buffering."',
      provenanceRef: 'YouTube Technical Video · RWC 2024 Archive (Timestamp 24:18)',
    },
    {
      id: 'sw-prior-08',
      title: 'IETF Draft: Hybrid Key Exchange in TLS 1.3',
      entityOrAuthors: 'IETF TLS Working Group (Stebila et al.)',
      releaseDate: '2025-03-02',
      year: 2025,
      sourceCategory: 'websites',
      sourceUrl: 'datatracker.ietf.org/doc/draft-ietf-tls-hybrid-design',
      similarityPercentage: 22.0,
      confidenceScore: 98.4,
      label: 'Inspired',
      matchingComponents: [
        {
          name: 'Wire Format & Cipher Suite IDs',
          description: 'Conforms to official NamedGroup codepoint 0x6399 for X25519MLKEM1024.',
          parityLevel: 'exact-match',
        },
      ],
      similarityExplanation:
        'Strict conformance with the official open international internet standard wire protocol. Code matches because interoperability requires adhering to identical byte formats.',
      differentiationSummary:
        'Standard adherence is essential for public internet interoperability; uniqueness lies in proxy execution mechanics.',
      verbatimExcerpt:
        '"This document specifies hybrid key exchange mechanisms for Transport Layer Security (TLS) version 1.3..."',
      provenanceRef: 'IETF Datatracker · draft-ietf-tls-hybrid-design-11',
    },
  ],
};

export const MOCK_HARDWARE_ORIGINALITY: OriginalityReport = {
  projectId: 'aeropulse-px4',
  projectName: 'AeroPulse PX-4 Autonomous UAV',
  projectType: 'hardware',
  originalityScore: 84.8,
  similarityScore: 15.2,
  confidenceScore: 97.2,
  verdictSynthesis:
    'Exhibits distinguished hardware originality in its proprietary 4-layer controlled-impedance PCB stackup, asymmetric dual-core computing topology (STM32H753 flight loop + ESP32-S3 coprocessor), and integrated pyrotechnic ballistic parachute recovery mechanism. Discovered prior art includes standard PX4 autopilot open source firmware and ArduPilot CAN-FD bus schematics; however, the sub-10ms optical-inertial synchronization hardware circuit and Toray carbon unibody frame constitute significant original engineering innovation.',
  disclaimer:
    'Ethical Review Standard: Hardware similarity ratings indicate adherence to aerospace electrical standards (AEC-Q100, CAN-FD) and open avionics reference designs. They do not constitute assertions of unauthorized circuit reproduction.',
  scannedCorpusCount: '1.2M Open Hardware Schematics · 140k Aerospace Papers · 620k USPTO Avionics Patents · 8,500 Commercial Drones',
  timestamp: '2026-09-04T19:35:00Z',
  categoryStats: {
    github: {
      category: 'github',
      label: 'GitHub Repositories',
      itemCount: 4,
      averageSimilarity: 24.5,
      maxSimilarity: 42.0,
      confidence: 98.0,
      topMatches: ['PX4/PX4-Autopilot', 'ArduPilot/ardupilot', 'betaflight/betaflight'],
    },
    'research-papers': {
      category: 'research-papers',
      label: 'Research Papers',
      itemCount: 3,
      averageSimilarity: 19.8,
      maxSimilarity: 33.0,
      confidence: 97.5,
      topMatches: ['Scaramuzza et al. (IEEE RA-L 2022)', 'Visual-Inertial Navigation in GPS-Denied Mines (ICRA 2023)'],
    },
    patents: {
      category: 'patents',
      label: 'Patents & IP Filings',
      itemCount: 2,
      averageSimilarity: 12.0,
      maxSimilarity: 16.5,
      confidence: 95.8,
      topMatches: ['US10928831B2 (Skydio Autonomous Navigation)', 'US11453492B1 (DJI Emergency Parachute System)'],
    },
    products: {
      category: 'products',
      label: 'Commercial Products',
      itemCount: 3,
      averageSimilarity: 21.0,
      maxSimilarity: 35.0,
      confidence: 97.1,
      topMatches: ['Skydio X2 Industrial UAV', 'Holybro Pixhawk 6X Autopilot', 'Flyability Elios 3'],
    },
    startups: {
      category: 'startups',
      label: 'Emerging Startups',
      itemCount: 2,
      averageSimilarity: 13.5,
      maxSimilarity: 18.0,
      confidence: 94.5,
      topMatches: ['Verity AG (Autonomous Warehouse Drones)', 'Shield AI Nova 2'],
    },
    websites: {
      category: 'websites',
      label: 'Documentation & Tech Blogs',
      itemCount: 2,
      averageSimilarity: 15.0,
      maxSimilarity: 20.0,
      confidence: 96.0,
      topMatches: ['PX4 Architectural Documentation', 'Texas Instruments Power Reference Designs'],
    },
    youtube: {
      category: 'youtube',
      label: 'YouTube & Tech Talks',
      itemCount: 2,
      averageSimilarity: 9.0,
      maxSimilarity: 14.0,
      confidence: 92.8,
      topMatches: ['PX4 Developer Summit 2024 Keynote', 'Altium Academy High Speed PCB Routing'],
    },
    'academic-projects': {
      category: 'academic-projects',
      label: 'Academic Projects & Theses',
      itemCount: 3,
      averageSimilarity: 22.1,
      maxSimilarity: 38.0,
      confidence: 96.5,
      topMatches: ['TUM Autonomous Drone Lab Dissertation', 'Carnegie Mellon Field Robotics Master Project'],
    },
  },
  priorArtItems: [
    {
      id: 'hw-prior-01',
      title: 'Pixhawk 6X Open Hardware Flight Controller Reference Design',
      entityOrAuthors: 'Dronecode Foundation / Holybro',
      releaseDate: '2021-09-15',
      year: 2021,
      sourceCategory: 'github',
      sourceUrl: 'github.com/PX4/Hardware-Pixhawk',
      similarityPercentage: 42.0,
      confidenceScore: 98.8,
      label: 'Moderately Similar',
      matchingComponents: [
        {
          name: 'STM32H753 MCU Pinout Mapping',
          description: 'Identical SPI bus pin allocations for primary IMU BMI088 communication.',
          parityLevel: 'structural',
        },
        {
          name: 'Power Module Voltage Divider',
          description: 'Standard 10:1 resistor divider network for main 4S battery voltage sensing.',
          parityLevel: 'exact-match',
        },
      ],
      similarityExplanation:
        'AeroPulse builds directly upon the proven Pixhawk standard pinout convention for STM32H7 MCU interfaces to maintain ecosystem peripheral interoperability. However, the PCB routing, board outline, and coprocessor integration are completely re-engineered.',
      differentiationSummary:
        'Custom 4-layer stackup with isolated analog ground plane, dedicated ESP32-S3 coprocessor, and onboard pyrotechnic ballistic parachute driver.',
      verbatimExcerpt:
        'Schematic Sheet 3: STM32H753BIT6 SPI1_SCK (PA5), SPI1_MISO (PA6), SPI1_MOSI (PB5) -> Sensor Bus A',
      provenanceRef: 'github.com/PX4/Hardware-Pixhawk · Rev 6X Schematics',
    },
    {
      id: 'hw-prior-02',
      title: 'Visual-Inertial Navigation in Subterranean GPS-Denied Environments',
      entityOrAuthors: 'Tranzatto et al. (IEEE ICRA 2022 / DARPA SubT)',
      releaseDate: '2022-05-24',
      year: 2022,
      sourceCategory: 'research-papers',
      sourceUrl: 'doi.org/10.1109/ICRA46639.2022.9811847',
      similarityPercentage: 33.0,
      confidenceScore: 97.9,
      label: 'Inspired',
      matchingComponents: [
        {
          name: 'Multi-State Constraint Kalman Filter (MSCKF)',
          description: 'Similar algorithmic formulation for tightly-coupled visual-inertial state estimation.',
          parityLevel: 'algorithmic',
        },
      ],
      similarityExplanation:
        'Shares the core sensor fusion mathematics proven during the DARPA Subterranean Challenge. AeroPulse implements the algorithm directly on embedded microcontrollers rather than on an energy-hungry Intel NUC or Jetson.',
      differentiationSummary:
        'Microcontroller-level implementation consuming only 3.9W compared to the DARPA testbed 45W compute payload.',
      verbatimExcerpt:
        '"The MSCKF updates state vectors using visual feature tracks across sliding window frames without estimating feature positions explicitly."',
      provenanceRef: 'IEEE Robotics and Automation Letters · Vol 7, Issue 3',
    },
    {
      id: 'hw-prior-03',
      title: 'US Patent 11453492B1: Autonomous Ballistic Parachute Deployment Mechanism',
      entityOrAuthors: 'DJI Sciences and Technologies Ltd.',
      releaseDate: '2022-11-10',
      year: 2022,
      sourceCategory: 'patents',
      sourceUrl: 'patents.google.com/patent/US11453492B1',
      similarityPercentage: 16.5,
      confidenceScore: 96.0,
      label: 'Inspired',
      matchingComponents: [
        {
          name: 'Free-Fall Trigger Logic',
          description: 'Zero-g detection thresholding triggering emergency parachute firing capacitor.',
          parityLevel: 'conceptual',
        },
      ],
      similarityExplanation:
        'Conceptual similarity in using an autonomous accelerometer threshold circuit to deploy a safety parachute. AeroPulse uses an independent hardware supercapacitor and discrete logic gate rather than firmware-only trigger.',
      differentiationSummary:
        'Independent hardware supercapacitor circuit that fires even if main flight MCU suffers complete brownout.',
      verbatimExcerpt:
        'Claim 1: An unmanned aerial vehicle comprising: a free-fall sensor circuit configured to detect a sustained acceleration magnitude below 0.15G...',
      provenanceRef: 'USPTO Patent #11,453,492 B1 · Sheet 4, Diagram 7',
    },
    {
      id: 'hw-prior-04',
      title: 'Skydio X2 Autonomous Enterprise Inspection UAV',
      entityOrAuthors: 'Skydio, Inc.',
      releaseDate: '2023-04-18',
      year: 2023,
      sourceCategory: 'products',
      sourceUrl: 'skydio.com/skydio-x2',
      similarityPercentage: 35.0,
      confidenceScore: 97.4,
      label: 'Moderately Similar',
      matchingComponents: [
        {
          name: 'Omnidirectional Optical Avoidance Bubble',
          description: 'Uses global shutter optical flow sensors for sub-10ms collision avoidance.',
          parityLevel: 'conceptual',
        },
        {
          name: 'Foldable Carbon Fiber Arm Structure',
          description: '3K carbon unibody frame with quick-release motor mounts.',
          parityLevel: 'structural',
        },
      ],
      similarityExplanation:
        'Shares target use-case, structural carbon-fiber material selection, and 360-degree obstacle avoidance philosophy with the commercial market leader Skydio X2.',
      differentiationSummary:
        'AeroPulse is designed as an open, repairable research platform with standard CAN-FD avionics rather than a proprietary closed ecosystem.',
      verbatimExcerpt:
        '"Skydio X2 pairs 360-degree computer vision navigation with enterprise durability for infrastructure inspections."',
      provenanceRef: 'Skydio Product Specification Sheet · 2023 Edition',
    },
    {
      id: 'hw-prior-05',
      title: 'Shield AI Nova 2 Subterranean Tactical Micro-UAV',
      entityOrAuthors: 'Shield AI',
      releaseDate: '2023-10-05',
      year: 2023,
      sourceCategory: 'startups',
      sourceUrl: 'shield.ai/nova-2',
      similarityPercentage: 18.0,
      confidenceScore: 94.8,
      label: 'Inspired',
      matchingComponents: [
        {
          name: 'GPS-Denied Subterranean Autonomy Profile',
          description: 'Operates in multi-level concrete buildings and subterranean tunnels without RF links.',
          parityLevel: 'conceptual',
        },
      ],
      similarityExplanation:
        'Direct inspiration from Nova 2 mission profile for subterranean industrial asset inspection and defense reconnaissance.',
      differentiationSummary:
        'Civilian industrial focus with modular payload mounts and 10x lower fabrication cost ($385 BOM vs $25,000 military procurement).',
      verbatimExcerpt:
        '"Nova 2 delivers full GPS-denied autonomy for multi-story indoor reconnaissance using Hivemind edge intelligence."',
      provenanceRef: 'Shield AI Public Technical Release (October 2023)',
    },
    {
      id: 'hw-prior-06',
      title: 'TUM Autonomous Drone Lab: Embedded VIO on Microcontroller Silicon',
      entityOrAuthors: 'Technical University of Munich (PhD Dissertation by K. Binder)',
      releaseDate: '2024-03-12',
      year: 2024,
      sourceCategory: 'academic-projects',
      sourceUrl: 'mediatum.ub.tum.de/doc/1714209',
      similarityPercentage: 38.0,
      confidenceScore: 97.2,
      label: 'Moderately Similar',
      matchingComponents: [
        {
          name: 'Hardware Timer Sync for Optical Flow Exposure',
          description: 'GPIO timer pulse synchronizing PMW3901 camera shutter with BMI088 gyro sample.',
          parityLevel: 'exact-match',
        },
        {
          name: 'CAN-FD ESC Telemetry Packet Structure',
          description: 'Bespoke 64-byte CAN-FD frame conveying RPM, motor temperature, and current draw.',
          parityLevel: 'structural',
        },
      ],
      similarityExplanation:
        'AeroPulse incorporates the synchronization circuit topology pioneered in Binder’s TUM dissertation for microsecond-accurate visual-inertial timestamping.',
      differentiationSummary:
        'AeroPulse incorporates commercial DFM production rules and full ballistic parachute avionics not included in the lab prototype.',
      verbatimExcerpt:
        '"Chapter 5: Hardware synchronization of CMOS optical flow exposure via STM32 Timer 2 master-slave triggering eliminates temporal drift."',
      provenanceRef: 'TUM University Library Archive · Dissertation 2024',
    },
    {
      id: 'hw-prior-07',
      title: 'High-Reliability Avionics CAN-FD Bus Layout & Split Termination',
      entityOrAuthors: 'Texas Instruments Application Note TIDU412',
      releaseDate: '2024-08-22',
      year: 2024,
      sourceCategory: 'websites',
      sourceUrl: 'ti.com/lit/an/tidu412/tidu412.pdf',
      similarityPercentage: 20.0,
      confidenceScore: 96.5,
      label: 'Inspired',
      matchingComponents: [
        {
          name: 'Split 60Ω Termination with Common-Mode Choke',
          description: 'Industry-standard CAN-FD transceiver layout with 4.7nF capacitor to ground.',
          parityLevel: 'exact-match',
        },
      ],
      similarityExplanation:
        'The differential CAN bus schematic follows Texas Instruments reference guidelines to satisfy automotive-grade EMI certification.',
      differentiationSummary:
        'Adherence to standard electrical engineering app-notes is standard practice for high-reliability avionics.',
      verbatimExcerpt:
        '"Figure 14: Split termination with two 60-ohm resistors and a center tap bypass capacitor reduces common-mode emissions."',
      provenanceRef: 'TI Application Note TIDU412 · Page 18',
    },
    {
      id: 'hw-prior-08',
      title: 'PX4 Developer Summit 2025: Next-Generation Embedded Autopilot Hardware',
      entityOrAuthors: 'PX4 Developer Community',
      releaseDate: '2025-01-30',
      year: 2025,
      sourceCategory: 'youtube',
      sourceUrl: 'youtube.com/watch?v=PX4_Summit_2025_Avionics',
      similarityPercentage: 14.0,
      confidenceScore: 93.5,
      label: 'Original',
      matchingComponents: [
        {
          name: 'Asymmetric Multiprocessing Roadmap',
          description: 'Discussion on moving telemetry encryption to a secondary coprocessor.',
          parityLevel: 'conceptual',
        },
      ],
      similarityExplanation:
        'Conference presentation outlining future community desires for dual-MCU architectures. AeroPulse implemented this exact vision with its STM32H7 + ESP32-S3 asymmetric pair.',
      differentiationSummary:
        'AeroPulse has actual physical hardware running this architecture ahead of community roadmap realization.',
      verbatimExcerpt:
        '"Session: Offloading TLS and Wi-Fi mesh networking from flight control loop to dedicated edge coprocessors."',
      provenanceRef: 'YouTube Technical Video · PX4 Summit 2025 (Timestamp 48:10)',
    },
  ],
};
