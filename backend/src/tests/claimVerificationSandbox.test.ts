import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  SandboxedExecutionEngine,
  DockerContainerRunner,
  RepositoryBenchmarkInspector,
} from '../claim-verification/sandboxedExecutionEngine';
import { ClaimVerificationAgent } from '../agents/claimVerificationAgent';
import { AdminController } from '../controllers/adminController';
import type { Claim } from '../models/claim';
import type { ResearchFinding } from '../models/research';

describe('Phase 16: Dynamic Sandboxed Code Execution & Test Suite Verification Suite', () => {
  it('1. SandboxedExecutionEngine.getStatus returns execution environment and security limits', () => {
    const status = SandboxedExecutionEngine.getStatus();

    assert.strictEqual(typeof status.dockerAvailable, 'boolean');
    assert.ok(['DOCKER', 'ISOLATED_PROCESS'].includes(status.activeExecutionMode));
    assert.ok(status.supportedRuntimes.includes('nodejs'));
    assert.ok(status.supportedRuntimes.includes('python'));
    assert.strictEqual(status.defaultLimits.timeoutMs, 5000);
    assert.strictEqual(status.defaultLimits.memoryLimitMb, 256);
    assert.strictEqual(status.defaultLimits.networkDisabled, true);
    assert.strictEqual(status.defaultLimits.readOnlyRoot, true);
  });

  it('2. DockerContainerRunner builds secure, hardened Docker CLI execution arguments', () => {
    const limits = {
      timeoutMs: 4000,
      memoryLimitMb: 512,
      cpuShares: 1.5,
      networkDisabled: true,
      readOnlyRoot: true,
      maxStdoutBytes: 65536,
    };

    const { command, args } = DockerContainerRunner.buildDockerArgs(
      '/tmp/host_workspace',
      'nodejs',
      'test_runner.js',
      limits
    );

    assert.strictEqual(command, 'docker');
    assert.ok(args.includes('--network=none'), 'Must enforce strict network isolation');
    assert.ok(args.includes('--memory=512m'), 'Must enforce memory quota');
    assert.ok(args.includes('--cpus=1.5'), 'Must enforce CPU shares');
    assert.ok(args.includes('--read-only'), 'Must enforce read-only filesystem root');
    assert.ok(args.includes('--cap-drop=ALL'), 'Must drop all Linux capabilities');
    assert.ok(args.includes('--security-opt=no-new-privileges'));
    assert.ok(args.includes('node:20-alpine'));
  });

  it('3. SandboxedExecutionEngine executes valid test code and parses passing TAP assertions', async () => {
    const code = `
const assert = require('assert');
assert.strictEqual(2 + 2, 4);
console.log('ok 1 - math addition assertion passed');
assert.ok(Array.isArray([1, 2, 3]));
console.log('ok 2 - array type assertion passed');
`;

    const result = await SandboxedExecutionEngine.executeCode(code, 'nodejs', { timeoutMs: 3000 });

    assert.strictEqual(result.status, 'SUCCESS');
    assert.strictEqual(result.exitCode, 0);
    assert.strictEqual(result.testsPassed, 2);
    assert.strictEqual(result.testsFailed, 0);
    assert.strictEqual(result.codeSupport, 'SUPPORTED');
    assert.ok(result.durationMs > 0);
    assert.ok(result.memoryUsedMb > 0);
    assert.ok(result.stdout.includes('ok 1 - math addition'));
  });

  it('4. Timeout guard terminates infinite loop / resource exhausting scripts promptly', async () => {
    const infiniteLoopCode = `
// Malicious or buggy student code: infinite loop
while (true) {}
`;

    const result = await SandboxedExecutionEngine.executeCode(infiniteLoopCode, 'nodejs', { timeoutMs: 500 });

    assert.strictEqual(result.status, 'TIMEOUT');
    assert.strictEqual(result.codeSupport, 'NOT_SUPPORTED');
    assert.strictEqual(result.testsFailed, 1);
    assert.ok(result.explanation.includes('timed out'));
  });

  it('5. Dynamic benchmark parser validates claimed latency and accuracy metrics', async () => {
    // 5a. Verified claim case (latency measured 18ms <= claimed 50ms)
    const passingBenchmarkCode = `
console.log('ok 1 - inference pipeline initialized');
console.log('[BENCHMARK] latency=18.5ms');
console.log('[BENCHMARK] accuracy=96.2%');
console.log('ok 2 - benchmark run completed');
`;

    const mockClaimValid: Claim = {
      id: 'claim_latency_ok',
      evaluationId: 'eval_test',
      claimText: 'Model delivers inference latency under 50ms with 90% accuracy',
      claimType: 'LATENCY',
      importance: 'HIGH',
      status: 'CLAIMED',
      confidence: 60,
      projectEvidence: '',
      explanation: '',
      supportingEvidenceIds: [],
      contradictingEvidenceIds: [],
      createdAt: new Date().toISOString(),
    };

    const validResult = await SandboxedExecutionEngine.executeCode(
      passingBenchmarkCode,
      'nodejs',
      { timeoutMs: 3000 },
      mockClaimValid
    );

    assert.strictEqual(validResult.codeSupport, 'SUPPORTED');
    assert.strictEqual(validResult.benchmarks.length, 2);
    const latencyBm = validResult.benchmarks.find(b => b.metric === 'latency');
    assert.ok(latencyBm);
    assert.strictEqual(latencyBm?.isVerified, true);
    assert.strictEqual(latencyBm?.measuredValue, 18.5);

    // 5b. Contradicted claim case (latency measured 185ms exceeds claimed 50ms)
    const failingBenchmarkCode = `
console.log('ok 1 - inference pipeline initialized');
console.log('[BENCHMARK] latency=185.0ms');
console.log('ok 2 - benchmark run completed');
`;

    const contradictedResult = await SandboxedExecutionEngine.executeCode(
      failingBenchmarkCode,
      'nodejs',
      { timeoutMs: 3000 },
      mockClaimValid
    );

    const contradictedLatency = contradictedResult.benchmarks.find(b => b.metric === 'latency');
    assert.ok(contradictedLatency);
    assert.strictEqual(contradictedLatency?.isVerified, false, 'Measured 185ms must fail 50ms claim');
    assert.strictEqual(contradictedResult.codeSupport, 'NOT_SUPPORTED');
  });

  it('6. ClaimVerificationAgent.verifyClaimWithSandbox upgrades status and adds execution proof', async () => {
    const mockClaim: Claim = {
      id: 'claim_yolo_acc',
      evaluationId: 'eval_test',
      claimText: 'Quantized INT8 YOLOv8 model achieves 95% accuracy in road pothole identification',
      claimType: 'ACCURACY',
      importance: 'CRITICAL',
      status: 'UNVERIFIED',
      confidence: 65,
      projectEvidence: 'Written in presentation slide 4.',
      explanation: 'Preliminary slide statement.',
      supportingEvidenceIds: [],
      contradictingEvidenceIds: [],
      createdAt: new Date().toISOString(),
    };

    const testCode = `
const assert = require('assert');
console.log('ok 1 - dataset ground truth validated');
console.log('[BENCHMARK] accuracy=95.4%');
console.log('ok 2 - accuracy threshold met');
`;

    const { claim, executionResult } = await ClaimVerificationAgent.verifyClaimWithSandbox(
      mockClaim,
      testCode
    );

    assert.strictEqual(executionResult.codeSupport, 'SUPPORTED');
    assert.strictEqual(claim.status, 'VERIFIED');
    assert.ok(claim.confidence >= 85, 'Confidence must increase after successful sandbox verification');
    assert.ok(claim.projectEvidence.includes('Sandbox Tests: 2/2 passed'));
  });

  it('7. ClaimVerificationAgent.verifyClaims handles bulk verification across multiple claims with findings', async () => {
    const claims: Claim[] = [
      {
        id: 'claim_1',
        evaluationId: 'eval_bulk',
        claimText: 'Zero trust JWT authentication and authorization gateway',
        claimType: 'SECURITY',
        importance: 'HIGH',
        status: 'UNVERIFIED',
        confidence: 60,
        projectEvidence: 'Code in auth repo',
        explanation: 'Initial submission',
        supportingEvidenceIds: [],
        contradictingEvidenceIds: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'claim_2',
        evaluationId: 'eval_bulk',
        claimText: 'Novel quantum gravity computational framework',
        claimType: 'INNOVATION',
        importance: 'LOW',
        status: 'UNVERIFIED',
        confidence: 40,
        projectEvidence: 'Theory paper',
        explanation: 'Speculative',
        supportingEvidenceIds: [],
        contradictingEvidenceIds: [],
        createdAt: new Date().toISOString(),
      },
    ];

    const findings: ResearchFinding[] = [
      {
        id: 'rf_1',
        sourceId: 'src_1',
        evaluationId: 'eval_bulk',
        summary: 'Existing literature confirms standard JWT microservice authentication patterns.',
        keyClaimsMatched: ['JWT authentication'],
        noveltyAspects: [],
        confidence: 90,
        createdAt: new Date().toISOString(),
      },
    ];

    const verified = await ClaimVerificationAgent.verifyClaims(claims, findings, []);

    assert.strictEqual(verified.length, 2);
    // Claim 1 has both research finding match and dynamic sandbox verification
    assert.ok(['VERIFIED', 'PARTIALLY_VERIFIED'].includes(verified[0].status));
    assert.ok(verified[0].confidence > 60);
  });

  it('8. AdminController exposes sandbox status and on-demand test execution endpoints', async () => {
    // 1. Status endpoint
    let statusResponse: any = null;
    const mockRes1: any = {
      status: () => mockRes1,
      json: (data: any) => { statusResponse = data; },
    };
    AdminController.getClaimSandboxStatus({} as any, mockRes1);

    assert.strictEqual(statusResponse.success, true);
    assert.strictEqual(typeof statusResponse.data.dockerAvailable, 'boolean');
    assert.ok(statusResponse.data.supportedRuntimes.includes('nodejs'));

    // 2. Execute endpoint
    let execResponse: any = null;
    const mockRes2: any = {
      status: () => mockRes2,
      json: (data: any) => { execResponse = data; },
    };
    const mockReq2: any = {
      body: {
        code: `
console.log('ok 1 - microservice ping response 200 OK');
console.log('[BENCHMARK] response_time=12ms');
`,
        runtime: 'nodejs',
        claimText: 'Microservice response time under 30ms',
        claimType: 'LATENCY',
      },
    };

    await AdminController.executeClaimSandbox(mockReq2, mockRes2);

    assert.strictEqual(execResponse.success, true);
    assert.strictEqual(execResponse.data.status, 'SUCCESS');
    assert.strictEqual(execResponse.data.codeSupport, 'SUPPORTED');
    assert.ok(execResponse.data.benchmarks.length > 0);
    assert.strictEqual(execResponse.data.benchmarks[0].isVerified, true);
  });

  it('9. Pre-built lightweight runner images (runner-python:3.11, runner-rust:1.75, runner-java:21) with strict resource limits', () => {
    const defaultLimits = {
      timeoutMs: 5000,
      memoryLimitMb: 256,
      cpuShares: 1.0,
      networkDisabled: true,
      readOnlyRoot: true,
      maxStdoutBytes: 65536,
      usePrebuiltRunners: true,
    };

    // 1. Python runner image and limits
    const pyDocker = DockerContainerRunner.buildDockerArgs('/tmp/py_ws', 'python', 'test_runner.py', defaultLimits);
    assert.ok(pyDocker.args.includes('runner-python:3.11'), 'Must use pre-built runner-python:3.11');
    assert.ok(pyDocker.args.includes('--memory=256m'), 'Must enforce --memory 256m');
    assert.ok(pyDocker.args.includes('--cpus=1'), 'Must enforce --cpus 1.0');
    assert.ok(pyDocker.args.includes('--network=none'), 'Must enforce --network none');
    assert.ok(pyDocker.args.includes('--read-only'), 'Must enforce read-only container root');
    assert.ok(pyDocker.args.includes('--pids-limit=64'), 'Must enforce pids limit');

    // 2. Rust runner image and limits
    const rustDocker = DockerContainerRunner.buildDockerArgs('/tmp/rust_ws', 'rust', 'main.rs', defaultLimits);
    assert.ok(rustDocker.args.includes('runner-rust:1.75'), 'Must use pre-built runner-rust:1.75');
    assert.ok(rustDocker.args.includes('--memory=256m'));
    assert.ok(rustDocker.args.includes('--cpus=1'));
    assert.ok(rustDocker.args.includes('--network=none'));

    // 3. Java runner image and limits
    const javaDocker = DockerContainerRunner.buildDockerArgs('/tmp/java_ws', 'java', 'Main.java', defaultLimits);
    assert.ok(javaDocker.args.includes('runner-java:21'), 'Must use pre-built runner-java:21');
    assert.ok(javaDocker.args.includes('--memory=256m'));
    assert.ok(javaDocker.args.includes('--cpus=1'));

    // 4. Go runner image
    const goDocker = DockerContainerRunner.buildDockerArgs('/tmp/go_ws', 'go', 'main.go', defaultLimits);
    assert.ok(goDocker.args.includes('runner-go:1.22'), 'Must use pre-built runner-go:1.22');

    // 5. C++ runner image
    const cppDocker = DockerContainerRunner.buildDockerArgs('/tmp/cpp_ws', 'cpp', 'main.cpp', defaultLimits);
    assert.ok(cppDocker.args.includes('runner-cpp:13'), 'Must use pre-built runner-cpp:13');

    // 6. Node prebuilt runner image
    const nodePrebuilt = DockerContainerRunner.buildDockerArgs('/tmp/node_ws', 'nodejs', 'test_runner.js', defaultLimits);
    assert.ok(nodePrebuilt.args.includes('runner-node:20'), 'Must use prebuilt runner-node:20 when enabled');

    // 7. Fallback to upstream images when usePrebuiltRunners is disabled
    const fallbackLimits = { ...defaultLimits, usePrebuiltRunners: false };
    const pyFallback = DockerContainerRunner.buildDockerArgs('/tmp/py_ws', 'python', 'test_runner.py', fallbackLimits);
    assert.ok(pyFallback.args.includes('python:3.11-alpine'), 'Must fallback to python:3.11-alpine');

    const rustFallback = DockerContainerRunner.buildDockerArgs('/tmp/rust_ws', 'rust', 'main.rs', fallbackLimits);
    assert.ok(rustFallback.args.includes('rust:1.75-alpine'), 'Must fallback to rust:1.75-alpine');

    const javaFallback = DockerContainerRunner.buildDockerArgs('/tmp/java_ws', 'java', 'Main.java', fallbackLimits);
    assert.ok(javaFallback.args.includes('eclipse-temurin:21-alpine'), 'Must fallback to eclipse-temurin:21-alpine');
  });

  it('10. Multi-language dynamic test harness synthesis across Python, Java, Rust, Go, and C++', async () => {
    const claim: Claim = {
      id: 'claim_cross_lang',
      evaluationId: 'eval_multi_lang',
      claimText: 'Distributed consensus engine delivers latency under 30ms with 95% accuracy',
      claimType: 'LATENCY',
      importance: 'CRITICAL',
      status: 'UNVERIFIED',
      confidence: 50,
      projectEvidence: '',
      explanation: '',
      supportingEvidenceIds: [],
      contradictingEvidenceIds: [],
      createdAt: new Date().toISOString(),
    };

    // Node test harness execution
    const nodeRes = await SandboxedExecutionEngine.verifyClaimDynamically(claim, 'nodejs');
    assert.strictEqual(nodeRes.executionResult.status, 'SUCCESS');
    assert.strictEqual(nodeRes.executionResult.runtime, 'nodejs');
    assert.ok(nodeRes.executionResult.benchmarks.length > 0);

    // Verify status reports all supported runtimes including Java
    const status = SandboxedExecutionEngine.getStatus();
    assert.ok(status.supportedRuntimes.includes('java'), 'Java must be in supported runtimes');
    assert.ok(status.supportedRuntimes.includes('rust'), 'Rust must be in supported runtimes');
    assert.ok(status.supportedRuntimes.includes('go'), 'Go must be in supported runtimes');
    assert.ok(status.supportedRuntimes.includes('cpp'), 'C++ must be in supported runtimes');
    assert.ok(status.supportedRuntimes.includes('python'), 'Python must be in supported runtimes');
  });

  it('11. Automated test parser handles JUnit, PyTest, Go, and Cargo output with benchmark extraction', async () => {
    // JUnit simulation with benchmark
    const junitOutput = `
Running org.projectxray.CapstoneVerificationTest
Tests run: 8, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.42 s - in org.projectxray.CapstoneVerificationTest
[BENCHMARK] throughput=4850ops/sec
[BENCHMARK] latency=14.2ms
`;
    const claim: Claim = {
      id: 'claim_bench_eval',
      evaluationId: 'eval_test',
      claimText: 'System achieves throughput over 4000ops/sec and latency under 20ms',
      claimType: 'LATENCY',
      importance: 'HIGH',
      status: 'UNVERIFIED',
      confidence: 60,
      projectEvidence: '',
      explanation: '',
      supportingEvidenceIds: [],
      contradictingEvidenceIds: [],
      createdAt: new Date().toISOString(),
    };

    // Execute through SandboxedExecutionEngine with mock code printing JUnit results
    const mockJUnitCode = `
console.log(${JSON.stringify(junitOutput)});
`;
    const result = await SandboxedExecutionEngine.executeCode(mockJUnitCode, 'nodejs', { timeoutMs: 3000 }, claim);

    assert.strictEqual(result.status, 'SUCCESS');
    assert.strictEqual(result.testsPassed, 8);
    assert.strictEqual(result.testsFailed, 0);
    assert.strictEqual(result.codeSupport, 'SUPPORTED');
    assert.strictEqual(result.benchmarks.length, 2);

    const latencyBm = result.benchmarks.find(b => b.metric === 'latency');
    assert.ok(latencyBm);
    assert.strictEqual(latencyBm?.measuredValue, 14.2);
    assert.strictEqual(latencyBm?.isVerified, true);
  });

  it('12. RepositoryBenchmarkInspector discovers manifests (*_test.py, pytest.ini, Cargo.toml, pom.xml, package.json)', () => {
    const testWs = path.join(os.tmpdir(), `ai_jury_test_repo_${Date.now()}`);
    fs.mkdirSync(testWs, { recursive: true });

    try {
      // 1. Python artifacts
      fs.writeFileSync(path.join(testWs, 'pytest.ini'), '[pytest]\ntestpaths = tests\naddopts = --benchmark-enable\n', 'utf8');
      fs.writeFileSync(path.join(testWs, 'model_test.py'), 'def test_inference(): pass\n', 'utf8');
      fs.writeFileSync(path.join(testWs, 'benchmark_throughput.py'), 'def test_benchmark(): pass\n', 'utf8');

      // 2. Node.js artifacts
      fs.writeFileSync(
        path.join(testWs, 'package.json'),
        JSON.stringify({
          name: 'student-capstone',
          scripts: { test: 'vitest run', benchmark: 'tinybench' },
          devDependencies: { vitest: '^1.0.0', tinybench: '^2.0.0' },
        }),
        'utf8'
      );
      fs.writeFileSync(path.join(testWs, 'api.test.ts'), '// test suite\n', 'utf8');

      // 3. Rust manifest
      fs.writeFileSync(
        path.join(testWs, 'Cargo.toml'),
        '[package]\nname = "engine"\nversion = "0.1.0"\n[[bench]]\nname = "perf"\n',
        'utf8'
      );

      // 4. Java manifest
      fs.writeFileSync(
        path.join(testWs, 'pom.xml'),
        '<project><dependencies><dependency><groupId>org.openjdk.jmh</groupId><artifactId>jmh-core</artifactId></dependency></dependencies></project>',
        'utf8'
      );

      // 5. Go manifest & test
      fs.writeFileSync(path.join(testWs, 'go.mod'), 'module capstone/engine\ngo 1.22\n', 'utf8');
      fs.writeFileSync(path.join(testWs, 'consensus_test.go'), 'package main\n', 'utf8');

      const inspection = RepositoryBenchmarkInspector.inspectRepository(testWs);

      assert.strictEqual(inspection.hasTests, true);
      assert.strictEqual(inspection.hasBenchmarks, true);
      assert.ok(inspection.manifests.length >= 5, 'Must detect at least 5 manifests');
      assert.ok(inspection.testFiles.length >= 4, 'Must detect test files');

      const manifestTypes = inspection.manifests.map((m) => m.manifestType);
      assert.ok(manifestTypes.includes('pytest.ini'), 'Must detect pytest.ini');
      assert.ok(manifestTypes.includes('package.json'), 'Must detect package.json');
      assert.ok(manifestTypes.includes('Cargo.toml'), 'Must detect Cargo.toml');
      assert.ok(manifestTypes.includes('pom.xml'), 'Must detect pom.xml');
      assert.ok(manifestTypes.includes('go.mod'), 'Must detect go.mod');

      const benchFiles = inspection.benchmarkFiles.map((b) => path.basename(b.filePath));
      assert.ok(benchFiles.includes('benchmark_throughput.py'), 'Must tag benchmark files');

      assert.ok(inspection.summary.includes('Repository inspected'));
    } finally {
      fs.rmSync(testWs, { recursive: true, force: true });
    }
  });

  it('13. SandboxedExecutionEngine.inspectRepository provides direct integration with repository scan', () => {
    const testWs = path.join(os.tmpdir(), `ai_jury_inspect_repo_${Date.now()}`);
    fs.mkdirSync(testWs, { recursive: true });

    try {
      fs.writeFileSync(
        path.join(testWs, 'package.json'),
        JSON.stringify({
          name: 'eval-repo',
          scripts: { test: 'node runner.test.js' },
        }),
        'utf8'
      );
      fs.writeFileSync(
        path.join(testWs, 'runner.test.js'),
        'console.log("ok 1 - math verified");\n',
        'utf8'
      );

      const inspection = SandboxedExecutionEngine.inspectRepository(testWs);
      assert.strictEqual(inspection.hasTests, true);
      assert.strictEqual(inspection.primaryRuntime, 'nodejs');
      assert.strictEqual(inspection.suggestedRunCommand, 'npm test');
    } finally {
      fs.rmSync(testWs, { recursive: true, force: true });
    }
  });

  it('14. SandboxedExecutionEngine.executeRepositoryHarness executes real repo tests and parses execution metrics', async () => {
    const testWs = path.join(os.tmpdir(), `ai_jury_exec_repo_${Date.now()}`);
    fs.mkdirSync(testWs, { recursive: true });

    try {
      // Create a real runnable Node.js test file
      const testCode = `
const assert = require('assert');
const t0 = performance.now();
for (let i = 0; i < 10000; i++) {} // Workload
const t1 = performance.now();
console.log('ok 1 - dynamic repo unit test passed');
console.log('ok 2 - assertions complete');
console.log('[BENCHMARK] latency=' + (t1 - t0).toFixed(2) + 'ms');
`;
      fs.writeFileSync(path.join(testWs, 'suite.test.js'), testCode, 'utf8');

      const claim: Claim = {
        id: 'claim_repo_eval',
        evaluationId: 'eval_repo',
        claimText: 'System achieves latency under 20ms',
        claimType: 'LATENCY',
        importance: 'HIGH',
        status: 'UNVERIFIED',
        confidence: 60,
        projectEvidence: '',
        explanation: '',
        supportingEvidenceIds: [],
        contradictingEvidenceIds: [],
        createdAt: new Date().toISOString(),
      };

      const result = await SandboxedExecutionEngine.executeRepositoryHarness(testWs, 'nodejs', { timeoutMs: 5000 }, claim);

      assert.strictEqual(result.status, 'SUCCESS');
      assert.ok(result.testsPassed >= 2, 'Should parse passing assertions');
      assert.strictEqual(result.testsFailed, 0);
      assert.strictEqual(result.codeSupport, 'SUPPORTED');
      assert.ok(result.benchmarks.length > 0, 'Should parse real measured benchmarks');
      assert.ok(result.durationMs >= 0);
    } finally {
      fs.rmSync(testWs, { recursive: true, force: true });
    }
  });

  it('15. SandboxedExecutionEngine.verifyClaimDynamically executes real empirical timers without fake static strings', async () => {
    const claim: Claim = {
      id: 'claim_empirical_bench',
      evaluationId: 'eval_bench_real',
      claimText: 'Distributed pipeline achieves latency under 50ms and accuracy of 90%',
      claimType: 'LATENCY',
      importance: 'HIGH',
      status: 'UNVERIFIED',
      confidence: 65,
      projectEvidence: '',
      explanation: '',
      supportingEvidenceIds: [],
      contradictingEvidenceIds: [],
      createdAt: new Date().toISOString(),
    };

    const res = await SandboxedExecutionEngine.verifyClaimDynamically(claim, 'nodejs');
    assert.strictEqual(res.executionResult.status, 'SUCCESS');
    assert.ok(res.executionResult.benchmarks.length >= 2, 'Should measure latency and throughput');

    const latencyBmk = res.executionResult.benchmarks.find((b) => b.metric === 'latency');
    assert.ok(latencyBmk, 'Latency benchmark must exist');
    assert.ok(latencyBmk.measuredValue > 0, 'Measured latency must be greater than zero');
    // Verify it is NOT the old fake static 24.2ms or 21.4ms
    assert.notStrictEqual(latencyBmk.measuredValue, 24.2, 'Must not be fake 24.2ms mock');
    assert.notStrictEqual(latencyBmk.measuredValue, 21.4, 'Must not be fake 21.4ms mock');

    const throughputBmk = res.executionResult.benchmarks.find((b) => b.metric === 'throughput');
    assert.ok(throughputBmk, 'Throughput benchmark must exist');
    assert.ok(throughputBmk.measuredValue > 0, 'Measured throughput must be positive');

    // Also test when repoPath is supplied in params
    const testWs = path.join(os.tmpdir(), `ai_jury_dyn_repo_${Date.now()}`);
    fs.mkdirSync(testWs, { recursive: true });
    try {
      fs.writeFileSync(
        path.join(testWs, 'repo_claim.test.js'),
        'console.log("ok 1 - repo executed");\nconsole.log("[BENCHMARK] throughput=3500ops/sec");\n',
        'utf8'
      );
      const repoRes = await SandboxedExecutionEngine.verifyClaimDynamically(claim, 'nodejs', { repoPath: testWs });
      assert.strictEqual(repoRes.executionResult.status, 'SUCCESS');
      assert.ok(repoRes.executionResult.benchmarks.some((b) => b.metric === 'throughput'));
    } finally {
      fs.rmSync(testWs, { recursive: true, force: true });
    }
  });
});
