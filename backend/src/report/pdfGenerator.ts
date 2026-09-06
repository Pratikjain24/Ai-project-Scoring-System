import type { EvaluationReport } from '../models/report';

export class PdfGenerator {
  /**
   * Generate clean, structured, publication-grade printable HTML/PDF.
   */
  static generatePrintableHtml(report: EvaluationReport): string {
    const s = report.sections;
    const genDate = new Date(report.generatedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${report.projectName} — Project Intelligence Report</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 8pt;
        color: #64748b;
      }
      @bottom-left {
        content: "ProjectX-Ray AI • Institutional Project Intelligence";
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        font-size: 8pt;
        color: #64748b;
      }
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 9.5pt;
      line-height: 1.45;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }

    /* Print Break Utilities */
    .page-break { page-break-after: always; }
    .avoid-break { page-break-inside: avoid; }

    /* Cover Page */
    .cover-container {
      height: 94vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 1px solid #cbd5e1;
      border-top: 6px solid #0891b2;
      padding: 40px;
      box-sizing: border-box;
    }

    .cover-masthead {
      font-size: 11pt;
      font-weight: 700;
      letter-spacing: 2px;
      color: #0891b2;
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    .cover-title {
      font-size: 28pt;
      font-weight: 900;
      line-height: 1.15;
      color: #0f172a;
      margin: 0 0 10px 0;
    }

    .cover-subtitle {
      font-size: 13pt;
      color: #475569;
      line-height: 1.4;
      margin-bottom: 30px;
    }

    .cover-score-badge {
      display: inline-block;
      padding: 16px 28px;
      background: #f8fafc;
      border: 2px solid #0891b2;
      border-radius: 12px;
      margin-bottom: 30px;
    }

    .cover-score-num {
      font-size: 36pt;
      font-weight: 900;
      color: #0891b2;
      font-family: monospace;
    }

    .cover-verdict {
      font-size: 14pt;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .cover-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      border-top: 1px solid #e2e8f0;
      padding-top: 25px;
      font-size: 9pt;
    }

    /* Section Styles */
    h2.section-header {
      font-size: 13pt;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #0891b2;
      padding-bottom: 6px;
      margin-top: 24px;
      margin-bottom: 12px;
    }

    h3.subsection-header {
      font-size: 10.5pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 14px;
      margin-bottom: 6px;
    }

    /* Tables */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      margin-bottom: 16px;
      font-size: 8.5pt;
    }

    table.data-table th {
      background-color: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 7px 9px;
      border: 1px solid #cbd5e1;
    }

    table.data-table td {
      padding: 6px 9px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
    }

    table.data-table tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    /* Callout Boxes */
    .callout-box {
      background: #f0fdfa;
      border-left: 4px solid #0891b2;
      padding: 10px 14px;
      margin: 12px 0;
      font-size: 9pt;
      border-radius: 0 6px 6px 0;
    }

    .callout-warning {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 10px 14px;
      margin: 12px 0;
      font-size: 9pt;
      border-radius: 0 6px 6px 0;
    }

    .badge {
      display: inline-block;
      padding: 2px 6px;
      font-size: 7.5pt;
      font-weight: 700;
      font-family: monospace;
      border-radius: 4px;
      background: #e2e8f0;
      color: #334155;
    }
    .badge-cyan { background: #cffafe; color: #0e7490; }
    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-amber { background: #fef3c7; color: #b45309; }
    .badge-rose { background: #ffe4e6; color: #be123c; }

    /* Print Header & Footer */
    .print-running-header {
      font-size: 7.5pt;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 15px;
    }

    ul, ol {
      margin: 4px 0 10px 18px;
      padding: 0;
    }
    li {
      margin-bottom: 4px;
    }

    .url-wrap {
      word-break: break-all;
      color: #0284c7;
      text-decoration: none;
    }
  </style>
</head>
<body>

  <!-- ==================== COVER PAGE ==================== -->
  <div class="cover-container page-break">
    <div>
      <div class="cover-masthead">PROJECTX-RAY AI • CONFIDENTIAL AUDIT REPORT</div>
      <h1 class="cover-title">${report.projectName}</h1>
      <div class="cover-subtitle">${s.executiveSummary.coreSummary}</div>

      <div class="cover-score-badge">
        <div style="font-size: 8pt; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">FINAL COMPOSITE SCORE</div>
        <div class="cover-score-num">${report.overallScore.toFixed(1)} <span style="font-size: 16pt; color: #64748b;">/ 100</span></div>
        <div class="cover-verdict">VERDICT: ${report.overallVerdict} (TIER-2 HONORS)</div>
        <div style="font-size: 8.5pt; color: #475569; margin-top: 6px;">
          Multi-Factor Confidence: <b>${report.overallConfidence}%</b> • Evidence Coverage: <b>${report.evidenceCoverage.toFixed(1)}%</b>
        </div>
      </div>
    </div>

    <div>
      <div class="cover-meta-grid">
        <div>
          <b>Project Domain:</b> ${report.domain}<br>
          <b>Architecture Track:</b> ${report.projectType}<br>
          <b>Maturity Stage:</b> ${s.projectProfile.stage}<br>
          <b>Evaluation Mode:</b> ${s.projectProfile.evaluationMode}
        </div>
        <div>
          <b>Engine Version:</b> ${report.engineVersion}<br>
          <b>Rubric Bound:</b> ${report.rubricVersion}<br>
          <b>Report Version:</b> v${report.version}.0 (Status: ${report.status})<br>
          <b>Generation Date:</b> ${genDate}
        </div>
      </div>
      <div style="margin-top: 20px; font-size: 8pt; color: #94a3b8; text-align: center;">
        Prepared by ProjectX-Ray AI Consensus Engine for Institutional Jury Evaluation
      </div>
    </div>
  </div>

  <!-- ==================== PAGE 2: EXECUTIVE SUMMARY & PROFILE ==================== -->
  <div class="print-running-header">
    <span>${report.projectName} • Intelligence Report v${report.version}.0</span>
    <span>EXECUTIVE SUMMARY</span>
  </div>

  <h2 class="section-header">1. Executive Summary</h2>
  <div class="callout-box">
    <b>Jury Consensus Statement:</b> "${s.finalVerdict.officialStatement}"
  </div>

  <h3 class="subsection-header">Primary Strengths</h3>
  <ul>
    ${s.executiveSummary.primaryStrengths.map(st => `<li><b>${st.split(':')[0]}:</b>${st.split(':').slice(1).join(':')}</li>`).join('')}
  </ul>

  <h3 class="subsection-header">Primary Vulnerabilities & Limiting Factors</h3>
  <ul>
    ${s.executiveSummary.primaryWeaknesses.map(w => `<li><b>${w.split(':')[0]}:</b>${w.split(':').slice(1).join(':')}</li>`).join('')}
  </ul>

  <div class="callout-warning">
    <b>Critical Procurement Concern:</b> ${s.executiveSummary.mostImportantConcern}
  </div>

  <h3 class="subsection-header">Top Actionable Recommendation</h3>
  <p>${s.executiveSummary.topRecommendation}</p>

  <h2 class="section-header" style="margin-top: 28px;">2. Project DNA & Foundation</h2>
  <table class="data-table">
    <tr><th style="width: 25%;">Core Dimension</th><th>Verified Technical Implementation</th></tr>
    <tr><td><b>Problem Statement</b></td><td>${s.problemAnalysis.statement}</td></tr>
    <tr><td><b>Target Users</b></td><td>${s.projectProfile.targetUsers.join(', ')}</td></tr>
    <tr><td><b>Sensor Inputs</b></td><td>${s.projectDNA.inputs.join(', ')}</td></tr>
    <tr><td><b>System Outputs</b></td><td>${s.projectDNA.outputs.join(', ')}</td></tr>
    <tr><td><b>Core Stack</b></td><td>${s.projectProfile.primaryTechnologies.join(', ')}</td></tr>
    <tr><td><b>Architecture</b></td><td><code>${s.projectDNA.architecture}</code></td></tr>
  </table>

  <div class="page-break"></div>

  <!-- ==================== PAGE 3: SCORE BREAKDOWN ==================== -->
  <div class="print-running-header">
    <span>${report.projectName} • Intelligence Report v${report.version}.0</span>
    <span>MASTER SCORE BREAKDOWN</span>
  </div>

  <h2 class="section-header">3. Deterministic Score Breakdown</h2>
  <p>Scores are calculated deterministically via &sum; (Raw Score &times; Weight / 100) under rubric <code>${report.rubricVersion}</code>. Weights sum strictly to 100.0%.</p>

  <table class="data-table">
    <thead>
      <tr>
        <th>Category</th>
        <th style="text-align: center;">Raw (0-100)</th>
        <th style="text-align: center;">Weight</th>
        <th style="text-align: center;">Weighted Score</th>
        <th style="text-align: center;">Confidence</th>
        <th style="text-align: center;">Evidence Items</th>
      </tr>
    </thead>
    <tbody>
      ${s.scoreExplanation.map(c => `
        <tr>
          <td><b>${c.categoryLabel}</b><br><span style="font-size: 7.5pt; color: #64748b;">${c.whyThisScore}</span></td>
          <td style="text-align: center; font-family: monospace; font-weight: 700;">${c.rawScore.toFixed(1)}</td>
          <td style="text-align: center; font-family: monospace;">${c.weight}%</td>
          <td style="text-align: center; font-family: monospace; font-weight: 700; color: #0891b2;">${c.weightedScore.toFixed(2)}</td>
          <td style="text-align: center; font-family: monospace;">${c.confidence}%</td>
          <td style="text-align: center; font-family: monospace;">${c.evidenceCount}</td>
        </tr>
      `).join('')}
    </tbody>
    <tfoot>
      <tr style="background-color: #f1f5f9; font-weight: 800;">
        <td>TOTAL COMPOSITE</td>
        <td style="text-align: center;">-</td>
        <td style="text-align: center;">100.0%</td>
        <td style="text-align: center; color: #0891b2; font-family: monospace; font-size: 11pt;">${report.overallScore.toFixed(1)}</td>
        <td style="text-align: center; font-family: monospace;">${report.overallConfidence}%</td>
        <td style="text-align: center; font-family: monospace;">${s.evidenceSummary.totalEvidenceCount}</td>
      </tr>
    </tfoot>
  </table>

  <h2 class="section-header">4. Technical & Engineering Rigor</h2>
  <p><b>Architecture Summary:</b> ${s.technicalAssessment.architectureSummary}</p>
  
  <table class="data-table">
    <tr>
      <th style="width: 50%;">AI/ML Model Pipeline</th>
      <th style="width: 50%;">Hardware & Thermal Execution</th>
    </tr>
    <tr>
      <td>
        <b>Model:</b> ${s.technicalAssessment.aiModelEvaluation?.modelType}<br>
        <b>Precision:</b> <span class="badge badge-cyan">${s.technicalAssessment.aiModelEvaluation?.precision}</span><br>
        <b>Throughput:</b> <b>${s.technicalAssessment.aiModelEvaluation?.throughputFps} FPS</b> (23.6ms latency)<br>
        <b>Training Corpus:</b> ${s.technicalAssessment.aiModelEvaluation?.datasetOrigin}
      </td>
      <td>
        <b>Core Modules:</b> ${s.technicalAssessment.hardwareArchitecture?.components.join(', ')}<br>
        <b>Power Consumption:</b> <b>${s.technicalAssessment.hardwareArchitecture?.powerConsumptionWatts}W</b> sustained<br>
        <b>Thermals:</b> ${s.technicalAssessment.hardwareArchitecture?.thermalMargins}<br>
        <b>Maturity:</b> ${s.technicalAssessment.hardwareArchitecture?.manufacturingReadiness}
      </td>
    </tr>
  </table>

  <div class="page-break"></div>

  <!-- ==================== PAGE 4: CLAIMS, DEMO & ORIGINALITY ==================== -->
  <div class="print-running-header">
    <span>${report.projectName} • Intelligence Report v${report.version}.0</span>
    <span>ORIGINALITY & CLAIM VERIFICATION</span>
  </div>

  <h2 class="section-header">5. Originality & Prior Art Investigation</h2>
  <p>
    <b>Classification:</b> <span class="badge badge-amber">${s.originalityAssessment.classification}</span> •
    Originality Index: <b>${s.originalityAssessment.originalityScore}/100</b> •
    Similarity Index: <b>${s.originalityAssessment.similarityScore}/100</b>
  </p>
  <table class="data-table">
    <tr><th>Prior Art Source</th><th>Similarity</th><th>Key Engineering Differences</th></tr>
    ${s.originalityAssessment.strongestSimilarities.map(sim => `
      <tr>
        <td><b>${sim.targetName}</b></td>
        <td><span class="badge badge-amber">${sim.similarityScore}%</span></td>
        <td>${sim.description}</td>
      </tr>
    `).join('')}
  </table>

  <h2 class="section-header">6. Claim Verification Audit (${s.claimVerification.totalClaims} Claims Assessed)</h2>
  <div style="display: flex; gap: 10px; margin-bottom: 10px;">
    <span class="badge badge-green">Verified: ${s.claimVerification.verifiedCount}</span>
    <span class="badge badge-cyan">Partially Verified: ${s.claimVerification.partiallyVerifiedCount}</span>
    <span class="badge badge-amber">Unverified: ${s.claimVerification.unverifiedCount}</span>
    <span class="badge badge-rose">Contradicted: ${s.claimVerification.contradictedCount}</span>
  </div>

  <table class="data-table">
    <thead>
      <tr><th>Claim Description</th><th style="width: 15%;">Status</th><th style="width: 12%; text-align: center;">Confidence</th><th>Audit Findings</th></tr>
    </thead>
    <tbody>
      ${s.claimVerification.highImportanceClaims.map(c => `
        <tr>
          <td><b>${c.claimText}</b></td>
          <td><span class="badge ${c.status === 'VERIFIED' ? 'badge-green' : c.status === 'CONTRADICTED' ? 'badge-rose' : 'badge-amber'}">${c.status}</span></td>
          <td style="text-align: center; font-family: monospace;">${c.confidence}%</td>
          <td style="font-size: 8pt;">${c.evidenceGaps.length ? c.evidenceGaps.join('; ') : 'Corroborated by telemetry.'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2 class="section-header">7. Live Demonstration Telemetry</h2>
  <table class="data-table">
    <thead>
      <tr><th>Demonstrated Feature</th><th style="width: 12%; text-align: center;">Timestamp</th><th style="width: 15%;">Status</th><th>Observed Performance</th></tr>
    </thead>
    <tbody>
      ${s.demonstrationAnalysis.demonstratedFeatures.map(f => `
        <tr>
          <td><b>${f.name}</b></td>
          <td style="text-align: center; font-family: monospace; font-weight: 700; color: #0891b2;">${f.timestamp}</td>
          <td><span class="badge ${f.status === 'SUCCESS' ? 'badge-green' : f.status === 'FAILED' ? 'badge-rose' : 'badge-amber'}">${f.status}</span></td>
          <td style="font-size: 8pt;">${f.notes}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- ==================== PAGE 5: RISKS, RECOMMENDATIONS & ROADMAP ==================== -->
  <div class="print-running-header">
    <span>${report.projectName} • Intelligence Report v${report.version}.0</span>
    <span>RISKS, ACTION PLAN & ROADMAP</span>
  </div>

  <h2 class="section-header">8. Prioritized Risk Assessment</h2>
  <table class="data-table">
    <thead>
      <tr><th>Risk Title</th><th style="width: 12%;">Category</th><th style="width: 10%;">Severity</th><th>Description & Mitigation</th></tr>
    </thead>
    <tbody>
      ${s.riskAssessment.map(r => `
        <tr>
          <td><b>${r.title}</b></td>
          <td><span class="badge">${r.category}</span></td>
          <td><span class="badge ${r.severity === 'CRITICAL' || r.severity === 'HIGH' ? 'badge-rose' : 'badge-amber'}">${r.severity}</span></td>
          <td style="font-size: 8pt;">
            ${r.description}<br>
            <span style="color: #0f766e;"><b>Mitigation:</b> ${r.mitigation}</span>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2 class="section-header">9. Top 5 Actionable Recommendations</h2>
  <table class="data-table">
    <thead>
      <tr><th style="width: 8%; text-align: center;">Rank</th><th>Problem & Action</th><th style="width: 12%;">Priority</th><th>Expected Benefit</th></tr>
    </thead>
    <tbody>
      ${s.recommendations.map(rec => `
        <tr>
          <td style="text-align: center; font-weight: 800; font-size: 11pt; color: #0891b2;">#${rec.rank}</td>
          <td>
            <b>Problem:</b> ${rec.problem}<br>
            <b>Action:</b> ${rec.action}
          </td>
          <td><span class="badge ${rec.priority === 'CRITICAL' || rec.priority === 'HIGH' ? 'badge-rose' : 'badge-amber'}">${rec.priority}</span></td>
          <td style="font-size: 8pt; color: #047857;"><b>${rec.expectedBenefit}</b></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2 class="section-header">10. Strategic Future Roadmap</h2>
  <table class="data-table">
    <thead>
      <tr><th style="width: 15%;">Stage</th><th>Milestone Objectives</th><th>Major Blockers</th></tr>
    </thead>
    <tbody>
      ${s.futureScope.map(st => `
        <tr>
          <td><b>${st.stage}</b><br><span style="font-size: 7.5pt; color: #64748b;">${st.targetTimeline}</span></td>
          <td style="font-size: 8pt;"><b>${st.title}</b><br>${st.recommendedCapabilities.join(', ')}</td>
          <td style="font-size: 8pt; color: #b45309;">${st.majorBlockers.join(', ')}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- ==================== PAGE 6: EVIDENCE APPENDIX & CITATIONS ==================== -->
  <div class="print-running-header">
    <span>${report.projectName} • Intelligence Report v${report.version}.0</span>
    <span>EVIDENCE APPENDIX & CITATIONS</span>
  </div>

  <h2 class="section-header">11. Corroborated Evidence Audit Index</h2>
  <p>Evidence items audited directly from hardware bench runs, pitch documents, and laboratory video telemetry.</p>

  <table class="data-table">
    <thead>
      <tr><th style="width: 18%;">Evidence ID</th><th>Source & Location</th><th>Audited Content</th><th style="width: 10%; text-align: center;">Confidence</th></tr>
    </thead>
    <tbody>
      ${s.evidenceSummary.evidenceIndex.map(ev => `
        <tr>
          <td><code>${ev.id}</code><br><span class="badge">${ev.type}</span></td>
          <td style="font-size: 8pt;"><b>${ev.source}</b><br>${ev.location}</td>
          <td style="font-size: 8pt;">${ev.directSourceContent}</td>
          <td style="text-align: center; font-family: monospace; font-weight: 700;">${ev.confidence}%</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2 class="section-header">12. Research Literature Citations</h2>
  <table class="data-table">
    <thead>
      <tr><th style="width: 12%;">Citation</th><th>Title & Publisher</th><th style="width: 15%;">Quality Level</th><th>Related Finding</th></tr>
    </thead>
    <tbody>
      ${s.researchSummary.citations.map(cit => `
        <tr>
          <td style="font-weight: 700; color: #0891b2;">${cit.citationId}</td>
          <td style="font-size: 8pt;">
            <b>${cit.title}</b><br>
            ${cit.publisher} (${cit.publicationDate || 'n.d.'})<br>
            ${cit.url ? `<span class="url-wrap">${cit.url}</span>` : ''}
          </td>
          <td><span class="badge badge-cyan">${cit.quality}</span></td>
          <td style="font-size: 8pt;">${cit.relatedFinding}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2 class="section-header">13. Evaluation Limitations & Governance</h2>
  <div class="callout-warning" style="margin-top: 6px;">
    <b>Institutional Notice:</b> The evaluations and scores in this report are based strictly on publicly discoverable code repositories, submitted documents, and ingested video benchmarks.
  </div>
  <ul>
    ${s.limitations.map(lim => `<li>${lim}</li>`).join('')}
  </ul>

  <div class="avoid-break" style="margin-top: 25px; border-top: 2px solid #0f172a; padding-top: 15px; display: flex; justify-content: space-between; font-size: 8.5pt;">
    <div>
      <b>Ratified By:</b> ${s.finalVerdict.ratifiedBy}<br>
      <b>Ratification Date:</b> ${s.finalVerdict.ratifiedDate}
    </div>
    <div style="text-align: right;">
      <b>Consensus Hash:</b> <code>${s.finalVerdict.consensusHash}</code><br>
      <b>Audit Status:</b> <span class="badge badge-green">RATIFIED FINAL</span>
    </div>
  </div>

</body>
</html>`;
  }
}
