// ====================================================
// PROJECTX-RAY AI - REPOSITORY BENCHMARK INSPECTOR
// Inspects student repositories for empirical test manifests,
// benchmark configurations, and executable test suites.
// Supports: Python (*_test.py, pytest.ini, pyproject.toml, requirements.txt),
//           Node.js (package.json, *.test.ts/js, *.bench.ts/js),
//           Rust (Cargo.toml, tests/*.rs, benches/*.rs),
//           Java (pom.xml, build.gradle, *Test.java),
//           Go (go.mod, *_test.go),
//           C/C++ (CMakeLists.txt, Makefile, *_test.cpp).
// ====================================================

import * as fs from 'fs';
import * as path from 'path';
import { createModuleLogger } from '../utils/logger';
import type { ExecutionRuntime } from './sandboxedExecutionEngine';

const logger = createModuleLogger('RepositoryBenchmarkInspector');

export type TestFramework =
  | 'pytest'
  | 'unittest'
  | 'jest'
  | 'vitest'
  | 'mocha'
  | 'cargo'
  | 'junit'
  | 'gotest'
  | 'ctest'
  | 'custom';

export interface DetectedManifest {
  manifestType:
    | 'package.json'
    | 'pytest.ini'
    | 'setup.cfg'
    | 'pyproject.toml'
    | 'requirements.txt'
    | 'Cargo.toml'
    | 'pom.xml'
    | 'build.gradle'
    | 'go.mod'
    | 'CMakeLists.txt'
    | 'Makefile';
  filePath: string;
  relativeFilePath: string;
  runtime: ExecutionRuntime;
  details: {
    scripts?: Record<string, string>;
    dependencies?: string[];
    devDependencies?: string[];
    testFrameworks?: string[];
    benchmarkFrameworks?: string[];
    hasBenchmarkFlag?: boolean;
    rawSnippet?: string;
  };
}

export interface DetectedBenchmarkFile {
  filePath: string;
  relativeFilePath: string;
  runtime: ExecutionRuntime;
  framework: TestFramework;
  isBenchmark: boolean;
  fileSizeBytes: number;
}

export interface RepositoryInspectionResult {
  repoPath: string;
  primaryRuntime: ExecutionRuntime;
  detectedRuntimes: ExecutionRuntime[];
  manifests: DetectedManifest[];
  testFiles: DetectedBenchmarkFile[];
  benchmarkFiles: DetectedBenchmarkFile[];
  suggestedRunCommand?: string;
  hasBenchmarks: boolean;
  hasTests: boolean;
  totalTestFilesCount: number;
  totalBenchmarkFilesCount: number;
  summary: string;
}

const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  '.svn',
  '.hg',
  '__pycache__',
  '.pytest_cache',
  '.venv',
  'venv',
  'env',
  '.env',
  'target',
  'dist',
  'build',
  'out',
  'bin',
  'obj',
  '.idea',
  '.vscode',
  '.next',
  '.nuxt',
  'coverage',
  '.tox',
  '.mypy_cache',
]);

export class RepositoryBenchmarkInspector {
  /**
   * Scans a repository directory to detect test manifests, benchmark suites,
   * and runnable evaluation harnesses across multiple programming languages.
   */
  static inspectRepository(repoPath: string, maxDepth: number = 5): RepositoryInspectionResult {
    const resolvedPath = path.resolve(repoPath);
    if (!fs.existsSync(resolvedPath)) {
      logger.warn(`Repository path does not exist: ${resolvedPath}`);
      return this.emptyResult(resolvedPath, 'Path does not exist on disk.');
    }

    const stat = fs.statSync(resolvedPath);
    if (!stat.isDirectory()) {
      logger.warn(`Repository path is not a directory: ${resolvedPath}`);
      return this.emptyResult(resolvedPath, 'Target path is not a directory.');
    }

    const manifests: DetectedManifest[] = [];
    const testFiles: DetectedBenchmarkFile[] = [];

    this.walkDirectory(resolvedPath, resolvedPath, 0, maxDepth, manifests, testFiles);

    const benchmarkFiles = testFiles.filter((f) => f.isBenchmark);
    const hasBenchmarks = benchmarkFiles.length > 0 || manifests.some((m) => m.details.hasBenchmarkFlag);
    const hasTests = testFiles.length > 0 || manifests.some((m) => !!m.details.scripts?.test);

    // Compute detected and primary runtimes
    const runtimeCounts: Record<ExecutionRuntime, number> = {
      nodejs: 0,
      python: 0,
      java: 0,
      rust: 0,
      go: 0,
      cpp: 0,
      shell: 0,
    };

    for (const m of manifests) {
      runtimeCounts[m.runtime] += 3; // Manifests carry heavy weight
    }

    for (const f of testFiles) {
      runtimeCounts[f.runtime] += 1;
    }

    const detectedRuntimes = (Object.keys(runtimeCounts) as ExecutionRuntime[]).filter(
      (r) => runtimeCounts[r] > 0
    );

    let primaryRuntime: ExecutionRuntime = 'nodejs';
    let maxCount = -1;
    for (const r of detectedRuntimes) {
      if (runtimeCounts[r] > maxCount) {
        maxCount = runtimeCounts[r];
        primaryRuntime = r;
      }
    }

    const suggestedRunCommand = this.determineSuggestedCommand(primaryRuntime, manifests, testFiles);

    const summary = hasTests || manifests.length > 0
      ? `Repository inspected: found ${manifests.length} manifest(s), ${testFiles.length} test/benchmark file(s) across [${detectedRuntimes.join(', ')}]. Primary: ${primaryRuntime}. Suggested runner: '${suggestedRunCommand || 'none'}'.`
      : `Repository inspected: no test manifests or benchmark files discovered.`;

    return {
      repoPath: resolvedPath,
      primaryRuntime,
      detectedRuntimes: detectedRuntimes.length > 0 ? detectedRuntimes : ['nodejs'],
      manifests,
      testFiles,
      benchmarkFiles,
      suggestedRunCommand,
      hasBenchmarks,
      hasTests,
      totalTestFilesCount: testFiles.length,
      totalBenchmarkFilesCount: benchmarkFiles.length,
      summary,
    };
  }

  private static emptyResult(repoPath: string, message: string): RepositoryInspectionResult {
    return {
      repoPath,
      primaryRuntime: 'nodejs',
      detectedRuntimes: [],
      manifests: [],
      testFiles: [],
      benchmarkFiles: [],
      hasBenchmarks: false,
      hasTests: false,
      totalTestFilesCount: 0,
      totalBenchmarkFilesCount: 0,
      summary: message,
    };
  }

  /**
   * Recursively traverses directory up to maxDepth, ignoring build and package dirs.
   */
  private static walkDirectory(
    currentDir: string,
    rootDir: string,
    currentDepth: number,
    maxDepth: number,
    manifests: DetectedManifest[],
    testFiles: DetectedBenchmarkFile[]
  ): void {
    if (currentDepth > maxDepth) return;

    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch (err: any) {
      logger.warn(`Failed reading directory: ${currentDir}`, { error: err.message });
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        if (!IGNORED_DIRECTORIES.has(entry.name) && !entry.name.startsWith('.')) {
          this.walkDirectory(fullPath, rootDir, currentDepth + 1, maxDepth, manifests, testFiles);
        }
      } else if (entry.isFile()) {
        this.inspectFile(entry.name, fullPath, relativePath, manifests, testFiles);
      }
    }
  }

  /**
   * Inspects a single file to determine if it is a project manifest or test/benchmark file.
   */
  private static inspectFile(
    fileName: string,
    fullPath: string,
    relativePath: string,
    manifests: DetectedManifest[],
    testFiles: DetectedBenchmarkFile[]
  ): void {
    const lowerName = fileName.toLowerCase();

    // 1. Check Project Manifests
    if (lowerName === 'package.json') {
      const manifest = this.parsePackageJson(fullPath, relativePath);
      if (manifest) manifests.push(manifest);
    } else if (lowerName === 'pytest.ini') {
      manifests.push(this.parsePytestIni(fullPath, relativePath));
    } else if (lowerName === 'cargo.toml') {
      manifests.push(this.parseCargoToml(fullPath, relativePath));
    } else if (lowerName === 'pom.xml') {
      manifests.push(this.parsePomXml(fullPath, relativePath));
    } else if (lowerName === 'build.gradle' || lowerName === 'build.gradle.kts') {
      manifests.push(this.parseGradle(fullPath, relativePath));
    } else if (lowerName === 'go.mod') {
      manifests.push(this.parseGoMod(fullPath, relativePath));
    } else if (lowerName === 'cmakelists.txt' || lowerName === 'makefile') {
      manifests.push(this.parseCppBuild(fileName, fullPath, relativePath));
    } else if (lowerName === 'pyproject.toml' || lowerName === 'setup.cfg' || lowerName === 'requirements.txt') {
      const pyManifest = this.parsePythonManifest(fileName, fullPath, relativePath);
      if (pyManifest) manifests.push(pyManifest);
    }

    // 2. Check Test & Benchmark Files
    const testFile = this.detectTestOrBenchmarkFile(fileName, fullPath, relativePath);
    if (testFile) {
      testFiles.push(testFile);
    }
  }

  private static parsePackageJson(fullPath: string, relativePath: string): DetectedManifest | null {
    try {
      const raw = fs.readFileSync(fullPath, 'utf8');
      const json = JSON.parse(raw);
      const scripts = json.scripts || {};
      const deps = Object.keys(json.dependencies || {});
      const devDeps = Object.keys(json.devDependencies || {});
      const allDeps = [...deps, ...devDeps];

      const testFrameworks: string[] = [];
      if (allDeps.some((d) => d.includes('vitest'))) testFrameworks.push('vitest');
      if (allDeps.some((d) => d.includes('jest'))) testFrameworks.push('jest');
      if (allDeps.some((d) => d.includes('mocha'))) testFrameworks.push('mocha');
      if (allDeps.some((d) => d.includes('ava'))) testFrameworks.push('ava');

      const benchmarkFrameworks: string[] = [];
      if (allDeps.some((d) => d.includes('benchmark') || d.includes('tinybench') || d.includes('mitata'))) {
        benchmarkFrameworks.push('benchmark.js');
      }

      const hasBenchmarkScript = Object.keys(scripts).some((k) =>
        k.toLowerCase().includes('bench') || (scripts[k] && scripts[k].toLowerCase().includes('bench'))
      );

      return {
        manifestType: 'package.json',
        filePath: fullPath,
        relativeFilePath: relativePath,
        runtime: 'nodejs',
        details: {
          scripts,
          dependencies: deps,
          devDependencies: devDeps,
          testFrameworks,
          benchmarkFrameworks,
          hasBenchmarkFlag: hasBenchmarkScript || benchmarkFrameworks.length > 0,
        },
      };
    } catch {
      return null;
    }
  }

  private static parsePytestIni(fullPath: string, relativePath: string): DetectedManifest {
    let content = '';
    try {
      content = fs.readFileSync(fullPath, 'utf8');
    } catch {}

    const hasBenchmark = /benchmark/i.test(content);
    return {
      manifestType: 'pytest.ini',
      filePath: fullPath,
      relativeFilePath: relativePath,
      runtime: 'python',
      details: {
        testFrameworks: ['pytest'],
        benchmarkFrameworks: hasBenchmark ? ['pytest-benchmark'] : [],
        hasBenchmarkFlag: hasBenchmark,
        rawSnippet: content.slice(0, 300),
      },
    };
  }

  private static parseCargoToml(fullPath: string, relativePath: string): DetectedManifest {
    let content = '';
    try {
      content = fs.readFileSync(fullPath, 'utf8');
    } catch {}

    const hasBenchSection = /\[\[bench\]\]/i.test(content) || /criterion/i.test(content);
    return {
      manifestType: 'Cargo.toml',
      filePath: fullPath,
      relativeFilePath: relativePath,
      runtime: 'rust',
      details: {
        testFrameworks: ['cargo test'],
        benchmarkFrameworks: hasBenchSection ? ['criterion'] : [],
        hasBenchmarkFlag: hasBenchSection,
        rawSnippet: content.slice(0, 300),
      },
    };
  }

  private static parsePomXml(fullPath: string, relativePath: string): DetectedManifest {
    let content = '';
    try {
      content = fs.readFileSync(fullPath, 'utf8');
    } catch {}

    const hasJmh = /jmh|openjdk\.jmh/i.test(content);
    const hasJunit = /junit/i.test(content);
    return {
      manifestType: 'pom.xml',
      filePath: fullPath,
      relativeFilePath: relativePath,
      runtime: 'java',
      details: {
        testFrameworks: hasJunit ? ['junit'] : ['maven-surefire'],
        benchmarkFrameworks: hasJmh ? ['jmh'] : [],
        hasBenchmarkFlag: hasJmh,
      },
    };
  }

  private static parseGradle(fullPath: string, relativePath: string): DetectedManifest {
    let content = '';
    try {
      content = fs.readFileSync(fullPath, 'utf8');
    } catch {}

    const hasJmh = /jmh/i.test(content);
    return {
      manifestType: 'build.gradle',
      filePath: fullPath,
      relativeFilePath: relativePath,
      runtime: 'java',
      details: {
        testFrameworks: ['gradle-test'],
        benchmarkFrameworks: hasJmh ? ['jmh'] : [],
        hasBenchmarkFlag: hasJmh,
      },
    };
  }

  private static parseGoMod(fullPath: string, relativePath: string): DetectedManifest {
    let content = '';
    try {
      content = fs.readFileSync(fullPath, 'utf8');
    } catch {}

    return {
      manifestType: 'go.mod',
      filePath: fullPath,
      relativeFilePath: relativePath,
      runtime: 'go',
      details: {
        testFrameworks: ['go test'],
        benchmarkFrameworks: ['go test -bench'],
        hasBenchmarkFlag: true, // Go has built-in testing.B benchmarks
      },
    };
  }

  private static parseCppBuild(fileName: string, fullPath: string, relativePath: string): DetectedManifest {
    return {
      manifestType: fileName.toLowerCase() === 'cmakelists.txt' ? 'CMakeLists.txt' : 'Makefile',
      filePath: fullPath,
      relativeFilePath: relativePath,
      runtime: 'cpp',
      details: {
        testFrameworks: ['ctest', 'make test'],
        benchmarkFrameworks: [],
        hasBenchmarkFlag: false,
      },
    };
  }

  private static parsePythonManifest(fileName: string, fullPath: string, relativePath: string): DetectedManifest | null {
    let content = '';
    try {
      content = fs.readFileSync(fullPath, 'utf8');
    } catch {
      return null;
    }

    const hasPytest = /pytest/i.test(content);
    const hasBench = /benchmark/i.test(content);

    return {
      manifestType: fileName.toLowerCase() === 'requirements.txt'
        ? 'requirements.txt'
        : fileName.toLowerCase() === 'pyproject.toml'
        ? 'pyproject.toml'
        : 'setup.cfg',
      filePath: fullPath,
      relativeFilePath: relativePath,
      runtime: 'python',
      details: {
        testFrameworks: hasPytest ? ['pytest'] : ['unittest'],
        benchmarkFrameworks: hasBench ? ['pytest-benchmark'] : [],
        hasBenchmarkFlag: hasBench,
      },
    };
  }

  /**
   * Matches source files against known test and benchmark naming patterns across all supported runtimes.
   */
  private static detectTestOrBenchmarkFile(
    fileName: string,
    fullPath: string,
    relativePath: string
  ): DetectedBenchmarkFile | null {
    const lower = fileName.toLowerCase();
    const relLower = relativePath.toLowerCase();

    let size = 0;
    try {
      size = fs.statSync(fullPath).size;
    } catch {}

    // Python: *_test.py, test_*.py, *_bench.py, benchmark_*.py
    if (lower.endsWith('.py')) {
      const isTest = lower.startsWith('test_') || lower.endsWith('_test.py') || relLower.includes('/tests/') || relLower.includes('/test/');
      const isBench = lower.includes('bench') || lower.includes('benchmark') || relLower.includes('/benchmarks/');
      if (isTest || isBench) {
        return {
          filePath: fullPath,
          relativeFilePath: relativePath,
          runtime: 'python',
          framework: 'pytest',
          isBenchmark: isBench,
          fileSizeBytes: size,
        };
      }
    }

    // Node.js / TypeScript: *.test.ts/js, *.spec.ts/js, *.bench.ts/js
    if (lower.endsWith('.js') || lower.endsWith('.ts') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) {
      const isTest = /\.test\.[jt]sx?$/.test(lower) || /\.spec\.[jt]sx?$/.test(lower) || relLower.includes('/tests/') || relLower.includes('/__tests__/');
      const isBench = /\.bench\.[jt]sx?$/.test(lower) || lower.includes('benchmark') || relLower.includes('/benchmarks/');
      if (isTest || isBench) {
        return {
          filePath: fullPath,
          relativeFilePath: relativePath,
          runtime: 'nodejs',
          framework: 'jest',
          isBenchmark: isBench,
          fileSizeBytes: size,
        };
      }
    }

    // Rust: benches/*.rs, tests/*.rs
    if (lower.endsWith('.rs')) {
      const isBench = relLower.includes('benches/') || lower.includes('bench');
      const isTest = relLower.includes('tests/') || lower.endsWith('_test.rs') || isBench;
      if (isTest) {
        return {
          filePath: fullPath,
          relativeFilePath: relativePath,
          runtime: 'rust',
          framework: 'cargo',
          isBenchmark: isBench,
          fileSizeBytes: size,
        };
      }
    }

    // Java: *Test.java, *Benchmark.java, *IT.java
    if (lower.endsWith('.java')) {
      const isBench = lower.includes('benchmark') || lower.includes('jmh');
      const isTest = lower.endsWith('test.java') || lower.endsWith('tests.java') || lower.endsWith('it.java') || isBench;
      if (isTest) {
        return {
          filePath: fullPath,
          relativeFilePath: relativePath,
          runtime: 'java',
          framework: isBench ? 'custom' : 'junit',
          isBenchmark: isBench,
          fileSizeBytes: size,
        };
      }
    }

    // Go: *_test.go
    if (lower.endsWith('_test.go')) {
      const isBench = lower.includes('bench');
      return {
        filePath: fullPath,
        relativeFilePath: relativePath,
        runtime: 'go',
        framework: 'gotest',
        isBenchmark: isBench,
        fileSizeBytes: size,
      };
    }

    // C++: *_test.cpp, test_*.cpp, *_benchmark.cpp
    if (lower.endsWith('.cpp') || lower.endsWith('.cc') || lower.endsWith('.cxx')) {
      const isBench = lower.includes('bench') || lower.includes('benchmark');
      const isTest = lower.startsWith('test_') || lower.endsWith('_test.cpp') || isBench;
      if (isTest) {
        return {
          filePath: fullPath,
          relativeFilePath: relativePath,
          runtime: 'cpp',
          framework: 'ctest',
          isBenchmark: isBench,
          fileSizeBytes: size,
        };
      }
    }

    return null;
  }

  /**
   * Generates optimal execution command line based on detected project files.
   */
  private static determineSuggestedCommand(
    runtime: ExecutionRuntime,
    manifests: DetectedManifest[],
    testFiles: DetectedBenchmarkFile[]
  ): string | undefined {
    // 1. Node.js
    if (runtime === 'nodejs') {
      const pkg = manifests.find((m) => m.manifestType === 'package.json');
      if (pkg?.details.scripts?.benchmark) return 'npm run benchmark';
      if (pkg?.details.scripts?.bench) return 'npm run bench';
      if (pkg?.details.scripts?.test) return 'npm test';
      if (testFiles.length > 0) return `node ${testFiles[0].relativeFilePath}`;
    }

    // 2. Python
    if (runtime === 'python') {
      const hasBench = testFiles.some((f) => f.isBenchmark);
      if (hasBench) return 'python -m pytest -k bench --benchmark-autosave';
      const hasPytest = manifests.some((m) => m.manifestType === 'pytest.ini') || testFiles.length > 0;
      if (hasPytest) return 'python -m pytest';
      return 'python -m unittest discover';
    }

    // 3. Rust
    if (runtime === 'rust') {
      const hasBench = testFiles.some((f) => f.isBenchmark) || manifests.some((m) => m.details.hasBenchmarkFlag);
      if (hasBench) return 'cargo bench';
      return 'cargo test';
    }

    // 4. Go
    if (runtime === 'go') {
      return 'go test -v -bench=. ./...';
    }

    // 5. Java
    if (runtime === 'java') {
      const isMaven = manifests.some((m) => m.manifestType === 'pom.xml');
      if (isMaven) return 'mvn test';
      return './gradlew test';
    }

    // 6. C++
    if (runtime === 'cpp') {
      const hasCmake = manifests.some((m) => m.manifestType === 'CMakeLists.txt');
      if (hasCmake) return 'ctest --output-on-failure';
      return 'make test';
    }

    return undefined;
  }
}

