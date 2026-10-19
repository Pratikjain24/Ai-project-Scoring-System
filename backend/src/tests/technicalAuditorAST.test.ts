import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AstQualityScanner,
  SastVulnerabilityScanner,
  SastCliAdapter,
  TechnicalQualityAgent,
  KNOWN_CVE_CATALOG,
} from '../agents/technicalQualityAgent';
import { TechnicalAuditorAgent } from '../agents/technicalAuditorAgent';
import { AdminController } from '../controllers/adminController';
import type { Project } from '../models/project';

describe('Phase 13: Technical Auditor - AST Syntax Tree & Automated SAST/CVE Test Suite', () => {
  it('1. AstQualityScanner parses source into AST nodes, functions, classes, and calculates McCabe Cyclomatic Complexity', () => {
    const sampleCode = `
      import express from 'express';
      import { db } from './db';

      export class UserService {
        async getUser(id: string, role: string) {
          if (!id) {
            throw new Error('ID required');
          }
          if (role === 'admin' || role === 'moderator') {
            return db.query('SELECT * FROM users WHERE id = ?', id);
          } else {
            return null;
          }
        }
      }
    `;

    const metrics = AstQualityScanner.analyze(sampleCode, 'userService.ts');

    assert.ok(metrics.totalNodes > 20, 'Should parse multiple AST nodes');
    assert.strictEqual(metrics.classCount, 1, 'Should detect 1 class');
    assert.strictEqual(metrics.importCount, 2, 'Should detect 2 imports');
    assert.strictEqual(metrics.functionCount, 1, 'Should detect 1 method');
    assert.ok(metrics.cyclomaticComplexity >= 4, 'Cyclomatic complexity should include if, ||, and else branches');
    assert.ok(metrics.maintainabilityIndex > 50, 'Maintainability index should be calculated (>50)');
  });

  it('2. AstQualityScanner detects structural anti-patterns: God Functions, Empty Catch, and Dead Code', () => {
    // Generate a long function (>85 lines) with empty catch and dead code
    const longFnStatements = Array.from({ length: 90 }, (_, i) => `  const step${i} = ${i} * 2;`).join('\n');
    const antiPatternCode = `
      function massiveGodFunction(x: number) {
        try {
          if (x > 10) {
            console.log('High');
          }
        } catch (e) {
          // empty catch swallowing error
        }
${longFnStatements}
        return x;
        const deadStatement = 'never reached';
      }
    `;

    const metrics = AstQualityScanner.analyze(antiPatternCode, 'legacyService.ts');

    assert.strictEqual(metrics.godFunctions.length, 1, 'Should detect God Function with >80 LOC');
    assert.strictEqual(metrics.godFunctions[0].name, 'massiveGodFunction');
    assert.ok(metrics.godFunctions[0].loc > 80);
    assert.strictEqual(metrics.emptyCatchBlocks.length, 1, 'Should detect empty catch block');
    assert.strictEqual(metrics.deadCodeCount, 1, 'Should detect unreachable dead code after return');
  });

  it('3. SastVulnerabilityScanner detects CWE-89 SQL Injection and CWE-78 Command Injection', () => {
    const vulnerableCode = `
      import cp from 'child_process';
      import { db } from './db';

      export function search(req, res) {
        const userInput = req.query.q;
        // Vulnerability 1: SQL Injection
        const query = "SELECT * FROM products WHERE name = '" + userInput + "'";
        db.query(query);

        // Vulnerability 2: Command Injection
        cp.exec('ping ' + userInput);
      }
    `;

    const findings = SastVulnerabilityScanner.scan(vulnerableCode, 'vulnerableApi.ts');

    const sqlFinding = findings.find(f => f.cwe === 'CWE-89');
    assert.ok(sqlFinding, 'Must detect CWE-89 SQL Injection');
    assert.strictEqual(sqlFinding.severity, 'CRITICAL');
    assert.ok(sqlFinding.fixRecommendation.includes('parameterized'));

    const cmdFinding = findings.find(f => f.cwe === 'CWE-78');
    assert.ok(cmdFinding, 'Must detect CWE-78 Command Injection');
    assert.strictEqual(cmdFinding.severity, 'CRITICAL');
  });

  it('4. SastVulnerabilityScanner detects CWE-79 XSS, CWE-798 Hardcoded Secrets, and CWE-328 Weak Cryptography', () => {
    const vulnerableSnippet = `
      // Hardcoded API key
      const OPENAI_KEY = "sk-proj-abc123456789012345678901234567890";
      
      // XSS
      document.getElementById('app').innerHTML = userSuppliedHtml;

      // Weak Hash
      const hash = crypto.createHash('md5').update(password).digest('hex');
    `;

    const findings = SastVulnerabilityScanner.scan(vulnerableSnippet, 'clientApp.ts');

    const secretFinding = findings.find(f => f.cwe === 'CWE-798');
    assert.ok(secretFinding, 'Must detect CWE-798 Hardcoded Credentials');
    assert.strictEqual(secretFinding.severity, 'HIGH');
    assert.ok(secretFinding.codeSnippet.includes('REDACTED'), 'Sensitive credentials must be redacted in finding snippet');

    const xssFinding = findings.find(f => f.cwe === 'CWE-79');
    assert.ok(xssFinding, 'Must detect CWE-79 Cross-Site Scripting');
    assert.strictEqual(xssFinding.severity, 'HIGH');

    const cryptoFinding = findings.find(f => f.cwe === 'CWE-328');
    assert.ok(cryptoFinding, 'Must detect CWE-328 Weak Cryptography');
    assert.strictEqual(cryptoFinding.severity, 'MEDIUM');
  });

  it('5. SastVulnerabilityScanner maps vulnerable dependencies to known CVE Catalog', () => {
    const packageJsonContent = `
      {
        "dependencies": {
          "log4j-core": "2.14.1",
          "ejs": "3.1.6",
          "express": "4.18.0"
        }
      }
    `;

    const findings = SastVulnerabilityScanner.scan(packageJsonContent, 'package.json');

    const log4jFinding = findings.find(f => f.cve === 'CVE-2021-44228');
    assert.ok(log4jFinding, 'Must match CVE-2021-44228 (Log4Shell)');
    assert.strictEqual(log4jFinding.severity, 'CRITICAL');

    const ejsFinding = findings.find(f => f.cve === 'CVE-2022-29078');
    assert.ok(ejsFinding, 'Must match CVE-2022-29078');
    assert.strictEqual(ejsFinding.severity, 'CRITICAL');

    assert.ok(KNOWN_CVE_CATALOG.length >= 6, 'CVE catalog should contain at least 6 high-severity CVE definitions');
  });

  it('6. SastCliAdapter reports Semgrep/Snyk capability status and falls back gracefully to native engine', () => {
    const status = SastCliAdapter.getStatus();
    assert.strictEqual(typeof status.semgrep.available, 'boolean');
    assert.strictEqual(typeof status.snyk.available, 'boolean');

    // Run resilient Semgrep scanner (either executes binary or gracefully runs native AST/SAST rules)
    const findings = SastCliAdapter.runSemgrep('testFile.ts', 'const token = "sk-1234567890123456789012";');
    assert.ok(Array.isArray(findings), 'Must return an array of findings');
    assert.ok(findings.length >= 1, 'Should find the exposed token');
  });

  it('7. TechnicalQualityAgent.auditCode computes combined metrics, security deductions, and overall scorecard', () => {
    const cleanCode = `
      export function add(a: number, b: number): number {
        return a + b;
      }
    `;
    const cleanResult = TechnicalQualityAgent.auditCode(cleanCode, 'math.ts');
    assert.strictEqual(cleanResult.findings.length, 0);
    assert.strictEqual(cleanResult.securityScore, 100);
    assert.ok(cleanResult.overallQualityScore >= 80);

    const flawedCode = `
      import cp from 'child_process';
      export function bad(input: string) {
        const sql = "SELECT * FROM users WHERE id = " + input;
        cp.exec('cat ' + input);
      }
    `;
    const flawedResult = TechnicalQualityAgent.auditCode(flawedCode, 'bad.ts');
    assert.ok(flawedResult.findings.length >= 2);
    assert.ok(flawedResult.securityScore < 70, 'Security score must be penalized for critical injection vulnerabilities');
    assert.ok(flawedResult.overallQualityScore < cleanResult.overallQualityScore);
  });

  it('8. TechnicalAuditorAgent.audit outputs 10 comprehensive categories calibrated with AST metrics and SAST findings', async () => {
    const mockProject: Project = {
      id: 'proj_ai_traffic',
      name: 'AI Smart Traffic Vision',
      architectureType: 'SOFTWARE',
      category: 'Smart Cities',
      domain: 'Computer Vision',
      problemStatement: 'Traffic flow congestion detection',
      solutionDescription: 'Edge video inference and telemetry',
      teamName: 'VisionFlow Team',
    };

    const mockEvidence = [
      {
        id: 'ev_ast_1',
        evaluationId: 'eval_ast_test',
        type: 'CODE_AST' as any,
        title: 'YOLOv9 Inference Module',
        description: `
          import { db } from './db';
          export class TrafficInference {
            detect(frame: Buffer) {
              const query = "SELECT * FROM cameras WHERE id = '" + frame.length + "'";
              db.query(query);
            }
          }
        `,
        confidence: 0.95,
        source: 'src/inference.ts',
        metadata: {},
        createdAt: new Date().toISOString(),
      },
    ];

    const assessments = await TechnicalAuditorAgent.audit('eval_ast_test', mockProject, mockEvidence);

    assert.strictEqual(assessments.length, 10, 'Must produce 10 technical categories');

    const secAssessment = assessments.find(a => a.category === 'Security & Auth');
    assert.ok(secAssessment, 'Must include Security & Auth category');
    assert.ok(secAssessment.score < 90, 'Security score must be penalized for SQL injection vulnerability');
    assert.ok(secAssessment.weaknesses.some(w => w.includes('CWE-89') || w.includes('SQL')));

    const archAssessment = assessments.find(a => a.category === 'Architecture & Modularity');
    assert.ok(archAssessment, 'Must include Architecture & Modularity category');
    assert.ok(archAssessment.explanation.includes('AST syntax tree') || archAssessment.strengths.some(s => s.includes('AST')));
  });

  it('9. AdminController provides Technical Auditor status and on-demand code scanning API', async () => {
    // 1. Status endpoint
    let statusResponse: any = null;
    const mockRes1: any = {
      status: () => mockRes1,
      json: (data: any) => { statusResponse = data; },
    };
    AdminController.getTechnicalAuditorStatus({} as any, mockRes1);

    assert.strictEqual(statusResponse.success, true);
    assert.strictEqual(statusResponse.data.engine, 'TREE_SITTER_TYPESCRIPT_AST');
    assert.ok(statusResponse.data.sastRulesLoaded >= 8);
    assert.ok(statusResponse.data.cveCatalogSize >= 5);
    assert.ok(Array.isArray(statusResponse.data.supportedLanguages));

    // 2. Scan endpoint
    let scanResponse: any = null;
    const mockRes2: any = {
      status: () => mockRes2,
      json: (data: any) => { scanResponse = data; },
    };
    const mockReq2: any = {
      body: {
        code: 'const key = "sk-proj-01234567890123456789012"; function test() { return 1; }',
        fileName: 'probe.ts',
      },
    };
    AdminController.scanCodeSnippet(mockReq2, mockRes2);

    assert.strictEqual(scanResponse.success, true);
    assert.ok(scanResponse.data.metrics.totalNodes > 0);
    assert.ok(scanResponse.data.findings.length >= 1);
    assert.strictEqual(scanResponse.data.findings[0].cwe, 'CWE-798');
  });
});
