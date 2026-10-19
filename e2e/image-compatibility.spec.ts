import { test, expect, type Page } from './fixtures';
import { evidenceArtwork } from '../src/cases/case001-artwork';
import { case001, suspects } from '../src/cases/case001';

async function expectJpegImages(page: Page, selector: string) {
  const images = page.locator(selector);
  const count = await images.count();
  expect(count).toBeGreaterThan(0);
  // Only lazy thumbnails need scrolling; eager portraits can decode offscreen.
  for (const image of await page.locator(`${selector}[loading="lazy"]`).all()) await image.scrollIntoViewIfNeeded();
  await expect.poll(() => images.evaluateAll((nodes, count) =>
    nodes.length === count && nodes.every(node => {
      const image = node as HTMLImageElement;
      return image.getAttribute('src')?.endsWith('.jpg') && image.complete && image.naturalWidth > 0;
    }), count)).toBe(true);
}

for (const failure of ['unsupported', 'missing'] as const) {
  test(`all case artwork loads as JPEG when WebP is ${failure}`, async ({ page }) => {
    await page.route('**/*.webp', route => route.fulfill(failure === 'missing'
      ? { status: 404, body: '' }
      : { status: 200, contentType: 'image/webp', body: 'undecodable image' }));
    await page.goto('/');
    await expectJpegImages(page, '.portrait img');
    await page.goto('/case/001');
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('cold-case:001:v1') || 'null')?.opened);
    await page.evaluate(() => {
      const key = 'cold-case:001:v1', state = JSON.parse(localStorage.getItem(key)!);
      Object.assign(state, { solved: [1,2,3,4,5,6,7,8], cameraCodeAccepted: true, timeAccepted: true, archive1220Unlocked: true });
      localStorage.setItem(key, JSON.stringify(state));
    });
    await page.reload();
    await expectJpegImages(page, '.evidence-thumbnail');
    for (const id of Object.keys(evidenceArtwork)) {
      await page.getByRole('button', { name: `Open ${case001.documents.find(doc => doc.id === id)!.title}`, exact: true }).click();
      await expectJpegImages(page, '[role="dialog"] img');
      await page.getByRole('button', { name: 'Close dialog' }).click();
    }
    await page.getByRole('button', { name: 'Open Suspect board', exact: true }).click();
    await expect(page.locator('[role="dialog"] .portrait img')).toHaveCount(suspects.length);
    await expectJpegImages(page, '[role="dialog"] .portrait img');
    await page.getByRole('button', { name: 'Close dialog' }).click();
    await page.getByRole('button', { name: 'HOW TO PLAY', exact: true }).click();
    for (let screen = 0; screen < 5; screen++) {
      if ([0, 1, 4].includes(screen)) await expectJpegImages(page, '.onboarding-page .case-comic img');
      if (screen < 4) await page.getByRole('button', { name: 'NEXT', exact: true }).click();
    }
    await page.getByRole('button', { name: 'RETURN TO CASE', exact: true }).last().click();
    await page.getByRole('button', { name: 'FINAL DEDUCTION', exact: true }).click();
    await expectJpegImages(page, '.deduction-suspects .portrait img');
    await page.getByRole('button', { name: 'Emily Carter', exact: true }).click();
    await page.getByRole('button', { name: 'CLOSE THE CASE', exact: true }).click();
    await expectJpegImages(page, '.ending-page img');
  });
}

test('a portrait still uses its illustrated placeholder when both formats fail', async ({ page }) => {
  const attempts: string[] = [];
  await page.route(/\/portraits\/brian\.(webp|jpg)$/, route => {
    attempts.push(route.request().url());
    return route.fulfill({ status: 404, body: '' });
  });
  await page.goto('/');
  await expect(page.locator('.portrait svg[role="img"]')).toBeVisible();
  await expect(page.locator('.portrait img')).toHaveCount(0);
  expect(attempts.map(url => new URL(url).pathname)).toEqual([
    '/cases/case001/portraits/brian.webp', '/cases/case001/portraits/brian.jpg',
  ]);
});
