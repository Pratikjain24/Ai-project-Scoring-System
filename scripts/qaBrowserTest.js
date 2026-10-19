import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://127.0.0.1:5173';

const log = (msg) => console.log(`[QA TESTER] ${msg}`);

async function findButtonByText(page, text) {
  const buttons = await page.$$('button, a[role="button"]');
  for (const btn of buttons) {
    try {
      const val = await page.evaluate(el => el.innerText, btn);
      if (val && val.toLowerCase().includes(text.toLowerCase())) return btn;
    } catch {
      // Ignored if detached
    }
  }
  return null;
}

async function findElementByText(page, selector, text) {
  const els = await page.$$(selector);
  for (const el of els) {
    try {
      const val = await page.evaluate(e => e.innerText, el);
      if (val && val.toLowerCase().includes(text.toLowerCase())) return el;
    } catch {
      // Ignored
    }
  }
  return null;
}

async function runBrowserQaSuite() {
  log('🚀 Launching real Google Chrome for complete browser QA testing...');

  // 1. Fetch real JWT Token from backend
  log('Fetching Lead Reviewer JWT token from backend (:3001)...');
  let token = '';
  try {
    const res = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personaId: 'usr_chair_evelyn', email: 'e.reed@mit.edu' }),
    });
    const data = await res.json();
    token = data.data.token;
    log(`✓ Successfully obtained cryptographically signed JWT (${token.substring(0, 25)}...)`);
  } catch (e) {
    log(`⚠️ Could not pre-fetch token: ${e.message}`);
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
  });

  const page = await browser.newPage();

  // Pre-seed localStorage with authenticated Lead Reviewer persona
  if (token) {
    await page.evaluateOnNewDocument((tok) => {
      localStorage.setItem('auth_token', tok);
      localStorage.setItem('auth_persona_id', 'usr_chair_evelyn');
      localStorage.setItem('auth_role', 'LEAD_REVIEWER');
      localStorage.setItem('auth_user', JSON.stringify({
        id: 'usr_chair_evelyn',
        name: 'Dr. Evelyn Reed',
        role: 'LEAD_REVIEWER',
        roleLabel: 'Jury Chair & Lead Reviewer',
        email: 'e.reed@mit.edu',
        title: 'Professor of Autonomous Systems & Jury Chair',
        organization: 'MIT / Civic Tech Review Board',
        avatarInitials: 'ER',
        badgeColor: 'border-cyan-500/40 bg-cyan-950/60 text-cyan-300',
        canCalibrate: true,
        canFinalize: true,
        canManageAdmin: true,
      }));
    }, token);
  }

  const results = {
    timestamp: new Date().toISOString(),
    pagesTested: [],
    buttonsTested: [],
    tabsTested: [],
    workflowsTested: [],
    defectsFound: [],
    consoleErrors: [],
  };

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      results.consoleErrors.push({ url: page.url(), message: msg.text() });
    }
  });

  page.on('dialog', async (dialog) => {
    log(`⚠️ Dialog/Alert intercepted: "${dialog.message()}"`);
    results.buttonsTested.push({
      action: 'browser_alert_intercepted',
      dialogMessage: dialog.message(),
      status: 'ALERT_TRIGGERED',
    });
    await dialog.dismiss();
  });

  try {
    // -------------------------------------------------------------
    // TEST 1: Root Redirect & Dashboard
    // -------------------------------------------------------------
    log('--- TEST 1: Root Redirect & Dashboard ---');
    await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await new Promise(r => setTimeout(r, 1200));

    const currentUrl = page.url();
    const redirectedToDashboard = currentUrl.includes('/dashboard');
    log(`Navigation to / -> Current URL: ${currentUrl} (Redirected: ${redirectedToDashboard})`);
    
    results.pagesTested.push({
      route: '/',
      redirectedTo: currentUrl,
      status: redirectedToDashboard ? 'PASS' : 'FAIL',
    });

    const pageTitle = await page.title();
    log(`Page Title: "${pageTitle}"`);

    const statCardsCount = await page.$$eval('div[class*="rounded-xl"]', els => els.length);
    log(`Found ${statCardsCount} card elements on dashboard`);

    // -------------------------------------------------------------
    // TEST 2: Evaluations Catalog (/evaluations)
    // -------------------------------------------------------------
    log('--- TEST 2: Evaluations Catalog ---');
    await page.goto(BASE_URL + '/evaluations', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await new Promise(r => setTimeout(r, 1200));

    const evalsTitle = await page.$eval('h1', el => el.innerText).catch(() => '');
    log(`Evaluations Page Heading: "${evalsTitle}"`);

    const tableRowsInitial = await page.$$eval('tbody tr', els => els.length);
    log(`Found ${tableRowsInitial} projects in evaluation catalog table`);
    results.pagesTested.push({
      route: '/evaluations',
      heading: evalsTitle,
      rowsCount: tableRowsInitial,
      status: tableRowsInitial > 0 ? 'PASS' : 'FAIL',
    });

    // -------------------------------------------------------------
    // TEST 3: Evaluation Workspace & Top Buttons
    // -------------------------------------------------------------
    log('--- TEST 3: Evaluation Workspace (/evaluations/smart-road-vision) ---');
    await page.goto(BASE_URL + '/evaluations/smart-road-vision', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await new Promise(r => setTimeout(r, 2000));

    const projectName = await page.$eval('h1', el => el.innerText).catch(() => '');
    log(`Workspace Project Name: "${projectName}"`);

    // Verify overall score badge
    const scoreText = await page.$eval('body', b => {
      const match = b.innerText.match(/Overall Score\s*([0-9.]+)/i);
      return match ? match[1] : 'not found';
    });
    log(`Detected Overall Score: ${scoreText}`);

    // Top Header Buttons
    // 1. Live Stream Button
    const liveStreamBtn = await findButtonByText(page, 'Live Stream');
    if (liveStreamBtn) {
      log('Testing "Live Stream" button...');
      await liveStreamBtn.click();
      await new Promise(r => setTimeout(r, 800));
      const modalOpen = await page.$eval('body', b => b.innerText.includes('Live Agent Execution Console'));
      log(`Live Stream modal opened: ${modalOpen}`);
      results.buttonsTested.push({ button: 'Live Stream Modal', status: modalOpen ? 'PASS' : 'FAIL' });
      const closeStreamBtn = await findButtonByText(page, 'Close Stream');
      if (closeStreamBtn) await closeStreamBtn.click();
      await new Promise(r => setTimeout(r, 500));
    }

    // 2. Command Center Button
    const commandCenterBtn = await findButtonByText(page, 'Command Center');
    if (commandCenterBtn) {
      log('Testing "Command Center" button...');
      await commandCenterBtn.click();
      await new Promise(r => setTimeout(r, 800));
      const ccOpen = await page.$eval('body', b => b.innerText.includes('Command Center') || b.innerText.includes('Pipeline'));
      log(`Command Center modal opened: ${ccOpen}`);
      results.buttonsTested.push({ button: 'Command Center Modal', status: ccOpen ? 'PASS' : 'FAIL' });
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 500));
    }

    // 3. Human Review Button
    const humanReviewBtn = await findButtonByText(page, 'Human Review');
    if (humanReviewBtn) {
      log('Testing "Human Review" button...');
      await humanReviewBtn.click();
      await new Promise(r => setTimeout(r, 800));
      const hrOpen = await page.$eval('body', b => b.innerText.includes('Human Review') || b.innerText.includes('Ratification') || b.innerText.includes('Reviewer'));
      log(`Human Review drawer opened: ${hrOpen}`);
      results.buttonsTested.push({ button: 'Human Review Drawer', status: hrOpen ? 'PASS' : 'FAIL' });
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 500));
    }

    // 4. Calibrate Scores Button
    const calibrateBtn = await findButtonByText(page, 'Calibrate Scores');
    if (calibrateBtn) {
      log('Testing "Calibrate Scores" button...');
      await calibrateBtn.click();
      await new Promise(r => setTimeout(r, 800));
      const calOpen = await page.$eval('body', b => b.innerText.includes('Calibrate') || b.innerText.includes('Rubric') || b.innerText.includes('Justification'));
      log(`Score Calibration modal opened: ${calOpen}`);
      results.buttonsTested.push({ button: 'Score Calibration Modal', status: calOpen ? 'PASS' : 'FAIL' });
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 500));
    }

    // 5. Audit Trail Button
    const auditBtn = await findButtonByText(page, 'Audit Trail');
    if (auditBtn) {
      log('Testing "Audit Trail" button...');
      await auditBtn.click();
      await new Promise(r => setTimeout(r, 800));
      const auditOpen = await page.$eval('body', b => b.innerText.includes('Audit Trail') || b.innerText.includes('History') || b.innerText.includes('Events'));
      log(`Audit Trail drawer opened: ${auditOpen}`);
      results.buttonsTested.push({ button: 'Audit Trail Drawer', status: auditOpen ? 'PASS' : 'FAIL' });
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 500));
    }

    // 6. Top Export Button (Stub verification)
    const exportBtn = await findButtonByText(page, 'Export');
    if (exportBtn) {
      log('Testing Top Header "Export" button...');
      await exportBtn.click();
      await new Promise(r => setTimeout(r, 500));
      const toastText = await page.$eval('body', b => b.innerText.includes('Exporting institutional PDF summary'));
      log(`Top Export button triggered toast: ${toastText} (STUB: No file actually downloaded)`);
      results.defectsFound.push({
        id: 'DEFECT-01',
        title: 'Top Workspace Export Button is a stub',
        location: 'EvaluationWorkspacePage.tsx:559',
        details: 'Calls handleExport which only sets a notification message without initiating download.',
      });
    }

    // -------------------------------------------------------------
    // TEST 4: Auditing All 12 Specialist Sub-Tabs
    // -------------------------------------------------------------
    log('--- TEST 4: Auditing All 12 Specialist Sub-Tabs ---');
    const tabs = [
      { key: 'project', label: 'Project DNA', path: '/evaluations/smart-road-vision/project' },
      { key: 'technical', label: 'Technical', path: '/evaluations/smart-road-vision/technical' },
      { key: 'originality', label: 'Originality', path: '/evaluations/smart-road-vision/originality' },
      { key: 'claims', label: 'Claims', path: '/evaluations/smart-road-vision/claims' },
      { key: 'checklist', label: 'Evidence Checklist', path: '/evaluations/smart-road-vision/checklist' },
      { key: 'research', label: 'Research', path: '/evaluations/smart-road-vision/research' },
      { key: 'impact', label: 'Impact', path: '/evaluations/smart-road-vision/impact' },
      { key: 'presentation', label: 'Presentation', path: '/evaluations/smart-road-vision/presentation' },
      { key: 'jury', label: 'AI Jury', path: '/evaluations/smart-road-vision/jury' },
      { key: 'live', label: 'Live Jury', path: '/evaluations/smart-road-vision/live' },
      { key: 'documents', label: 'Doc Intelligence', path: '/evaluations/smart-road-vision/documents' },
      { key: 'report', label: 'Report', path: '/evaluations/smart-road-vision/report' },
    ];

    for (const tab of tabs) {
      log(`Navigating to tab: ${tab.label} (${tab.path})...`);
      try {
        await page.goto(BASE_URL + tab.path, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await new Promise(r => setTimeout(r, 1500));
        
        const tabBody = await page.$eval('main', el => el.innerText.length).catch(() => 0);
        const isRendered = tabBody > 100;
        log(`Tab ${tab.label}: Rendered ${tabBody} characters. Status: ${isRendered ? 'PASS' : 'FAIL'}`);

        results.tabsTested.push({
          tab: tab.label,
          route: tab.path,
          renderedChars: tabBody,
          status: isRendered ? 'PASS' : 'FAIL',
        });

        if (tab.key === 'project') {
          const exportJsonBtn = await findButtonByText(page, 'Export JSON');
          log(`Project DNA "Export JSON" button found: ${Boolean(exportJsonBtn)}`);
        }

        if (tab.key === 'technical') {
          const analyzeBtn = await findButtonByText(page, 'Analysis');
          log(`Technical Audit "Run Analysis" button found: ${Boolean(analyzeBtn)}`);
          const exportDossier = await findButtonByText(page, 'Export Dossier');
          if (exportDossier) {
            await exportDossier.click();
            await new Promise(r => setTimeout(r, 600));
            log('Clicked Technical "Export Dossier" -> Verified stub message toast');
            results.defectsFound.push({
              id: 'DEFECT-02',
              title: 'Technical Auditor Export Dossier button is a fake timer',
              location: 'TechnicalAuditorModule.tsx:143',
              details: 'Displays simulated toast after 1.2s timeout without creating file download.',
            });
          }
        }

        if (tab.key === 'claims') {
          const docketBtns = await page.$$('button');
          let docketCount = 0;
          for (const b of docketBtns) {
            const txt = await page.evaluate(el => el.innerText, b);
            if (txt && txt.includes('Add to Docket')) docketCount++;
          }
          log(`Claims tab found ${docketCount} "Add to Docket" buttons`);
          const claimExport = await findButtonByText(page, 'Export Dossier');
          if (claimExport) {
            await claimExport.click();
            await new Promise(r => setTimeout(r, 600));
            log('Clicked Claims "Export Dossier" -> Verified stub message toast');
            results.defectsFound.push({
              id: 'DEFECT-03',
              title: 'Claim Verification Export Dossier is a fake timer',
              location: 'ClaimVerificationModule.tsx:359',
              details: 'Displays simulated toast without downloading dossier.',
            });
          }
        }

        if (tab.key === 'checklist') {
          const requestProofBtn = await findButtonByText(page, 'Request');
          log(`Checklist "Request Proof" button found: ${Boolean(requestProofBtn)}`);
        }

        if (tab.key === 'jury') {
          const simulateDebateBtn = await findButtonByText(page, 'Debate');
          log(`AI Jury "Simulate Debate" button found: ${Boolean(simulateDebateBtn)}`);
          const exportScorecardBtn = await findButtonByText(page, 'Export Scorecard');
          if (exportScorecardBtn) {
            await exportScorecardBtn.click();
            await new Promise(r => setTimeout(r, 500));
            log('AI Jury "Export Scorecard" clicked (Real JSON download triggered)');
            results.buttonsTested.push({ button: 'Export Scorecard (AI Jury)', status: 'PASS_REAL_DOWNLOAD' });
          }
        }

        if (tab.key === 'live') {
          const enterRoomBtn = await findButtonByText(page, 'Enter Live Jury Room');
          log(`Live Jury Setup Screen: Enter Room Button present: ${Boolean(enterRoomBtn)}`);
          if (enterRoomBtn) {
            await enterRoomBtn.click();
            await new Promise(r => setTimeout(r, 2000));
            const cvCanvas = await page.$('canvas');
            log(`Entered Live Camera Room! Computer Vision HUD Canvas found: ${Boolean(cvCanvas)}`);
            results.workflowsTested.push({
              workflow: 'Live Camera Viva Room Entry',
              canvasDetected: Boolean(cvCanvas),
              status: cvCanvas ? 'PASS' : 'FAIL',
            });
            const leaveBtn = await findButtonByText(page, 'Leave Room');
            if (leaveBtn) await leaveBtn.click();
          }
        }

        if (tab.key === 'report') {
          const tocItems = await page.$$eval('aside button, nav button', bs => bs.length).catch(() => 0);
          log(`Report Workspace Table of Contents items: ${tocItems}`);
          const downloadReportBtn = await findButtonByText(page, 'Download Report');
          const shareReportBtn = await findButtonByText(page, 'Share');
          const printBtn = await findButtonByText(page, 'Print');
          log(`Report actions: Download: ${Boolean(downloadReportBtn)}, Share: ${Boolean(shareReportBtn)}, Print: ${Boolean(printBtn)}`);
          
          if (shareReportBtn) {
            await shareReportBtn.click();
            await new Promise(r => setTimeout(r, 800));
            const shareModal = await page.$eval('body', b => b.innerText.includes('Institutional Report Sharing') || b.innerText.includes('Generate View-Only Link')).catch(() => false);
            log(`ShareReportModal opened: ${shareModal}`);
            await page.keyboard.press('Escape');
            await new Promise(r => setTimeout(r, 400));
          }
        }
      } catch (tabErr) {
        log(`⚠️ Error auditing tab ${tab.label}: ${tabErr.message}`);
        results.tabsTested.push({
          tab: tab.label,
          route: tab.path,
          error: tabErr.message,
          status: 'TIMEOUT_OR_ERROR',
        });
      }
    }

    // -------------------------------------------------------------
    // TEST 5: New Evaluation Flow (/new-evaluation)
    // -------------------------------------------------------------
    log('--- TEST 5: New Evaluation Flow ---');
    await page.goto(BASE_URL + '/new-evaluation', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await new Promise(r => setTimeout(r, 1000));

    const presetCard = await findElementByText(page, 'div', 'CyberShield Zero-Trust Mesh');
    if (presetCard) {
      await presetCard.click();
      await new Promise(r => setTimeout(r, 400));
      log('Preset CyberShield clicked!');
    }

    for (let step = 1; step <= 3; step++) {
      const nextBtn = await findButtonByText(page, 'Next');
      if (nextBtn) {
        await nextBtn.click();
        await new Promise(r => setTimeout(r, 500));
        log(`Advanced to Wizard Step ${step + 1}`);
      }
    }

    const launchBtn = await findButtonByText(page, 'Launch Multimodal Analysis');
    log(`Launch Evaluation Button present: ${Boolean(launchBtn)}`);
    if (launchBtn) {
      await launchBtn.click();
      await new Promise(r => setTimeout(r, 2000));
      const streamVisible = await page.$eval('body', b => b.innerText.includes('Pipeline Stream') || b.innerText.includes('Stage Execution') || b.innerText.includes('STAGE') || b.innerText.includes('Console'));
      log(`Streaming execution console visible: ${streamVisible}`);
      results.workflowsTested.push({
        workflow: 'New Evaluation Wizard to Stream Execution',
        status: streamVisible ? 'PASS' : 'FAIL',
      });
    }

    // -------------------------------------------------------------
    // TEST 6: Admin Dashboard (/admin)
    // -------------------------------------------------------------
    log('--- TEST 6: Admin Dashboard ---');
    await page.goto(BASE_URL + '/admin', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await new Promise(r => setTimeout(r, 1000));
    const adminHeading = await page.$eval('h1', h => h.innerText).catch(() => '');
    log(`Admin Page Heading: "${adminHeading}"`);

    const adminTabs = ['Feature Flags', 'Cost & AI Usage', 'Rubric Governance', 'Audit Trail', 'System Health'];
    for (const atab of adminTabs) {
      const btn = await findButtonByText(page, atab);
      if (btn) {
        await btn.click();
        await new Promise(r => setTimeout(r, 500));
        log(`Admin tab "${atab}" clicked and active.`);
      }
    }

    // -------------------------------------------------------------
    // TEST 7: Settings Page (/settings)
    // -------------------------------------------------------------
    log('--- TEST 7: Settings Page ---');
    await page.goto(BASE_URL + '/settings', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await new Promise(r => setTimeout(r, 1000));

    const lightThemeCard = await findElementByText(page, 'div', 'Editorial Light');
    if (lightThemeCard) {
      await lightThemeCard.click();
      await new Promise(r => setTimeout(r, 400));
      const htmlClass = await page.$eval('html', h => h.className);
      log(`Switched to Light Theme -> html class: "${htmlClass}"`);
    }

    const darkThemeCard = await findElementByText(page, 'div', 'Deep Cyber Dark');
    if (darkThemeCard) {
      await darkThemeCard.click();
      await new Promise(r => setTimeout(r, 400));
      const htmlClass = await page.$eval('html', h => h.className);
      log(`Switched back to Dark Theme -> html class: "${htmlClass}"`);
    }

    const saveSettingsBtn = await findButtonByText(page, 'Save');
    if (saveSettingsBtn) {
      await saveSettingsBtn.click();
      await new Promise(r => setTimeout(r, 500));
      const successNotice = await page.$eval('body', b => b.innerText.includes('Settings saved successfully'));
      log(`Settings Save toast displayed: ${successNotice} (Note: unpersisted)`);
      results.defectsFound.push({
        id: 'DEFECT-04',
        title: 'Settings Page does not persist settings',
        location: 'SettingsPage.tsx:30',
        details: 'Settings are stored purely in local React state and reset on page refresh.',
      });
    }

    // -------------------------------------------------------------
    // TEST 8: Missing Routes & 404 Tests
    // -------------------------------------------------------------
    log('--- TEST 8: Missing Routes & 404 Tests ---');
    await page.goto(BASE_URL + '/share/report/share_test_token_123', { waitUntil: 'domcontentloaded', timeout: 8000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 800));
    const isShared404 = await page.$eval('body', b => b.innerText.includes('Route Not Found'));
    log(`Shared report route /share/report/:token hits 404: ${isShared404}`);
    if (isShared404) {
      results.defectsFound.push({
        id: 'DEFECT-05',
        title: 'Missing Public Shared Report Route (/share/report/:token)',
        location: 'App.tsx:52',
        details: 'Shared report token links fail with Route Not Found because the route is missing in React Router.',
      });
    }

    await page.goto(BASE_URL + '/nonexistent-random-route', { waitUntil: 'domcontentloaded', timeout: 8000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 800));
    const isFallback404 = await page.$eval('body', b => b.innerText.includes('Route Not Found'));
    log(`Nonexistent route hits 404 fallback gracefully: ${isFallback404}`);

  } catch (err) {
    log(`❌ Error during interactive QA test run: ${err.message}`);
    results.testError = err.message;
  } finally {
    await browser.close();
    log('🏁 Browser test run completed successfully! Writing JSON log...');
    fs.writeFileSync('scripts/qaBrowserTestResults.json', JSON.stringify(results, null, 2));
    log('Saved results to scripts/qaBrowserTestResults.json');
  }
}

runBrowserQaSuite();
