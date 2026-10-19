import { chromium } from '@playwright/test';

// Capture the real desk layout with case content removed for the field guide.
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 720 }, deviceScaleFactor: 1 });
  await page.addInitScript(() => localStorage.setItem('cold-case:001:v1', JSON.stringify({ version: 1, caseRevision: 3, caseId: '001', languageChosen: true, tutorialCompleted: true, language: 'csharp' })));
  await page.goto('http://localhost:5176/case/001');
  await page.locator('.guided-code').waitFor();
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const selector of ['.guided-code', '.case-file-intro', '.step-brief', '.objective', '.file-stamp', '.file-bottom-id', '.evidence-stack', '.console-idle']) {
      document.querySelector(selector)?.replaceChildren();
    }
  });
  await page.screenshot({ path: 'public/cases/case001/guide-desk.png', animations: 'disabled' });
} finally { await browser.close(); }
