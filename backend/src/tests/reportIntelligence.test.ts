import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../server';
import { ReportEngine } from '../report/reportEngine';
import { ReportRepository } from '../repositories/reportRepository';
import { PdfGenerator } from '../report/pdfGenerator';

test('Phase 10: Final Intelligence Report + Evidence Explorer Test Suite', async (t) => {
  const evalId = 'eval_smart-road-vision';

  await t.test('1. ReportEngine generates complete 22-section report with exact Master Score & Verdict', () => {
    const report = ReportEngine.generate(evalId, 3);

    assert.ok(report);
    assert.equal(report.evaluationId, evalId);
    assert.equal(report.version, 3);
    assert.equal(report.overallScore, 83.7);
    assert.equal(report.overallVerdict, 'STRONG');
    assert.equal(report.overallConfidence, 86);
    assert.equal(report.evidenceCoverage, 81.0);
    assert.equal(report.status, 'FINAL');

    // Verify presence of all key structured sections
    const s = report.sections;
    assert.ok(s.executiveSummary, 'ExecutiveSummary missing');
    assert.ok(s.projectProfile, 'ProjectProfile missing');
    assert.ok(s.problemAnalysis, 'ProblemAnalysis missing');
    assert.ok(s.projectDNA, 'ProjectDNA missing');
    assert.ok(s.scoreBreakdown, 'ScoreBreakdown missing');
    assert.ok(s.scoreExplanation, 'ScoreExplanation missing');
    assert.ok(s.technicalAssessment, 'TechnicalAssessment missing');
    assert.ok(s.originalityAssessment, 'OriginalityAssessment missing');
    assert.ok(s.claimVerification, 'ClaimVerification missing');
    assert.ok(s.presentationAnalysis, 'PresentationAnalysis missing');
    assert.ok(s.demonstrationAnalysis, 'DemonstrationAnalysis missing');
    assert.ok(s.impactAssessment, 'ImpactAssessment missing');
    assert.ok(s.feasibilityAssessment, 'FeasibilityAssessment missing');
    assert.ok(s.riskAssessment, 'RiskAssessment missing');
    assert.ok(s.recommendations, 'Recommendations missing');
    assert.ok(s.futureScope, 'FutureScope missing');
    assert.ok(s.commercialization, 'Commercialization missing');
    assert.ok(s.judgeQuestions, 'JudgeQuestions missing');
    assert.ok(s.evidenceSummary, 'EvidenceSummary missing');
    assert.ok(s.researchSummary, 'ResearchSummary missing');
    assert.ok(s.limitations, 'Limitations missing');
    assert.ok(s.finalVerdict, 'FinalVerdict missing');
  });

  await t.test('2. Report Consistency Check validates all cross-engine invariants', () => {
    const report = ReportEngine.generate(evalId, 3);

    assert.ok(report.consistencyCheck);
    assert.equal(report.consistencyCheck.status, 'VERIFIED');
    assert.equal(report.consistencyCheck.passedCount, 8);
    assert.equal(report.consistencyCheck.warnings.length, 0);

    const d = report.consistencyCheck.details;
    assert.equal(d.scoreMatchesEngine, true);
    assert.equal(d.categoriesSum100, true);
    assert.equal(d.verdictMatchesThreshold, true);
    assert.equal(d.claimsCountMatchesEngine, true);
    assert.equal(d.originalityMatchesEngine, true);
  });

  await t.test('3. Report Quality Score exceeds institutional publication standards', () => {
    const report = ReportEngine.generate(evalId, 3);

    assert.ok(report.qualityCheck);
    assert.ok(report.qualityCheck.overallScore >= 95);
    assert.equal(report.qualityCheck.rating, 'EXCELLENT');
    assert.equal(report.qualityCheck.completeness, 100);
    assert.ok(report.qualityCheck.evidenceLinking >= 95);
  });

  await t.test('4. PDF Generator produces structured printable HTML with A4 styles and zero hallucinations', () => {
    const report = ReportEngine.generate(evalId, 3);
    const html = PdfGenerator.generatePrintableHtml(report);

    assert.ok(html.includes('<!DOCTYPE html>'));
    assert.ok(html.includes('size: A4;'));
    assert.ok(html.includes(report.projectName));
    assert.ok(html.includes('83.7'));
    assert.ok(html.includes('STRONG'));
    assert.ok(html.includes('Executive Summary'));
    assert.ok(html.includes('Top 5 Actionable Recommendations'));
    assert.ok(html.includes('Corroborated Evidence Audit Index'));
    assert.ok(html.includes('Evaluation Limitations & Governance'));
  });

  await t.test('5. ReportRepository saves and queries historical report versions (v1, v2, v3)', () => {
    const versions = ReportRepository.getReportVersions(evalId);

    assert.ok(versions.length >= 3);
    const v1 = versions.find(v => v.version === 1);
    const v2 = versions.find(v => v.version === 2);
    const v3 = versions.find(v => v.version === 3);

    assert.ok(v1);
    assert.ok(v2);
    assert.ok(v3);
    assert.equal(v1.overallScore, 76.3);
    assert.equal(v2.overallScore, 81.1);
    assert.equal(v3.overallScore, 83.7);

    // Test version diff
    const diff = ReportRepository.compareVersions(evalId, 1, 3);
    assert.ok(diff);
    assert.equal(diff.v1Version, 1);
    assert.equal(diff.v2Version, 3);
    assert.equal(diff.scoreDifference, 7.4);
    assert.equal(diff.verdictChanged, true);
    assert.equal(diff.previousVerdict, 'PROMISING');
    assert.equal(diff.currentVerdict, 'STRONG');
  });

  await t.test('6. ReportShare creates, resolves, and revokes secure view-only tokens', () => {
    const share = ReportRepository.createShare({
      id: `share_test_${Date.now()}`,
      evaluationId: evalId,
      reportId: `rep_${evalId}_v3`,
      token: `token_secure_${Date.now()}`,
      permissions: 'VIEW_ONLY',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      revokedAt: null,
      createdAt: new Date().toISOString(),
    });

    assert.ok(share.token);
    const resolved = ReportRepository.getShareByToken(share.token);
    assert.ok(resolved);
    assert.equal(resolved.id, share.id);
    assert.equal(resolved.permissions, 'VIEW_ONLY');

    // Revoke
    const revoked = ReportRepository.revokeShare(share.id);
    assert.equal(revoked, true);

    const checkRevoked = ReportRepository.getShareByToken(share.token);
    assert.ok(checkRevoked?.revokedAt);
  });

  await t.test('7. Evidence Explorer provides filtered search and segregates source content from AI interpretation', () => {
    const allEvidence = ReportRepository.getEvidenceForReport(evalId);
    assert.ok(allEvidence.length > 0);

    const first = allEvidence[0];
    assert.ok(first.directSourceContent, 'Must have direct source content');
    assert.ok(first.aiInterpretation, 'Must have AI interpretation');
    assert.notEqual(first.directSourceContent, first.aiInterpretation, 'Must segregate source from interpretation');

    // Query search
    const queried = ReportRepository.getEvidenceForReport(evalId, 'Jetson');
    assert.ok(queried.length > 0);
    assert.ok(queried.every(e => 
      e.directSourceContent.toLowerCase().includes('jetson') || 
      e.source.toLowerCase().includes('jetson') ||
      e.location.toLowerCase().includes('jetson') ||
      e.aiInterpretation.toLowerCase().includes('jetson')
    ));
  });

  await t.test('8. REST Endpoints: report retrieval, generation, pdf export, versions, and sharing', async () => {
    const server = http.createServer(app);
    await new Promise<void>(resolve => server.listen(0, resolve));
    const address = server.address() as any;
    const port = address.port;
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      // GET report
      const repRes = await fetch(`${baseUrl}/api/evaluations/${evalId}/report`);
      assert.equal(repRes.status, 200);
      const repJson = await repRes.json();
      assert.equal(repJson.success, true);
      assert.equal(repJson.data.overallScore, 83.7);

      // GET versions
      const verRes = await fetch(`${baseUrl}/api/evaluations/${evalId}/report/versions`);
      assert.equal(verRes.status, 200);
      const verJson = await verRes.json();
      assert.ok(verJson.data.length >= 3);

      // GET compare
      const compRes = await fetch(`${baseUrl}/api/evaluations/${evalId}/report/compare?v1=1&v2=3`);
      assert.equal(compRes.status, 200);
      const compJson = await compRes.json();
      assert.equal(compJson.data.scoreDifference, 7.4);

      // GET evidence explorer
      const evRes = await fetch(`${baseUrl}/api/evaluations/${evalId}/report/evidence?query=Jetson`);
      assert.equal(evRes.status, 200);
      const evJson = await evRes.json();
      assert.ok(evJson.data.length > 0);

      // GET sources
      const srcRes = await fetch(`${baseUrl}/api/evaluations/${evalId}/report/sources`);
      assert.equal(srcRes.status, 200);
      const srcJson = await srcRes.json();
      assert.ok(srcJson.data.length > 0);

      // GET PDF (HTML format)
      const pdfRes = await fetch(`${baseUrl}/api/evaluations/${evalId}/report/pdf`);
      assert.equal(pdfRes.status, 200);
      const htmlText = await pdfRes.text();
      assert.ok(htmlText.includes('<!DOCTYPE html>'));
      assert.ok(htmlText.includes('Smart Road Vision'));

      // POST create share
      const shareRes = await fetch(`${baseUrl}/api/evaluations/${evalId}/report/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresInDays: 7 }),
      });
      assert.equal(shareRes.status, 201);
      const shareJson = await shareRes.json();
      assert.ok(shareJson.data.token);

      // GET public share by token
      const pubRes = await fetch(`${baseUrl}/api/report-share/${shareJson.data.token}`);
      assert.equal(pubRes.status, 200);
      const pubJson = await pubRes.json();
      assert.equal(pubJson.data.report.overallScore, 83.7);

      // DELETE revoke share
      const revRes = await fetch(`${baseUrl}/api/report-share/${shareJson.data.id}`, {
        method: 'DELETE',
      });
      assert.equal(revRes.status, 200);

      // GET revoked token returns 410 Gone
      const deadRes = await fetch(`${baseUrl}/api/report-share/${shareJson.data.token}`);
      assert.equal(deadRes.status, 410);

    } finally {
      await new Promise<void>(resolve => server.close(() => resolve()));
    }
  });
});
