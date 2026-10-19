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

for (const thumbnails of ['available', 'missing'] as const) {
  test(`all artwork loads without WebP when small thumbnails are ${thumbnails}`, async ({ page }) => {
    const webpRequests: string[] = [];
    await page.route('**/*.webp', route => {
      webpRequests.push(route.request().url());
      return route.fulfill({ status: 200, contentType: 'image/webp', body: 'undecodable image' });
    });
    if (thumbnails === 'missing') await page.route('**/*.thumb.jpg', route => route.fulfill({ status: 404, body: '' }));
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
    if (thumbnails === 'available') expect(await page.locator('.evidence-thumbnail').first().evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeLessThanOrEqual(400);
    for (const id of Object.keys(evidenceArtwork)) {
      await page.getByRole('button', { name: `Open ${case001.documents.find(doc => doc.id === id)!.title}`, exact: true }).click();
      await expectJpegImages(page, '[role="dialog"] img');
      await page.getByRole('button', { name: 'Close dialog' }).click();
    }
    await page.getByRole('button', { name: 'Open Suspect board', exact: true }).click();
    await expect(page.locator('[role="dialog"] .portrait img')).toHaveCount(suspects.length);
    await expectJpegImages(page, '[role="dialog"] .portrait img');
    await page.getByRole('button', { name: 'Close dialog' }).click();
    await page.getByRole('button', { name: 'FINAL DEDUCTION', exact: true }).click();
    await expectJpegImages(page, '.deduction-suspects .portrait img');
    await page.getByRole('button', { name: 'Emily Carter', exact: true }).click();
    await page.getByRole('button', { name: 'CLOSE THE CASE', exact: true }).click();
    await expectJpegImages(page, '.ending-page img');
    expect(webpRequests).toEqual([]);
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
    '/cases/case001/portraits/brian.jpg', '/cases/case001/portraits/brian.webp',
  ]);
});

test('an undecodable JPEG can fall back to WebP', async ({ page }) => {
  await page.route('**/portraits/brian.jpg', route => route.fulfill({ status: 200, contentType: 'image/jpeg', body: 'undecodable image' }));
  await page.goto('/');
  const portrait = page.getByRole('img', { name: 'Illustrated school portrait of Brian' });
  await expect(portrait).toHaveAttribute('src', '/cases/case001/portraits/brian.webp');
  await expect.poll(() => portrait.evaluate(node => (node as HTMLImageElement).naturalWidth > 0)).toBe(true);
});

test('a failed clue can retry after a network failure without losing progress', async ({ page }) => {
  let blocked = true;
  await page.route(/\/evidence\/opening-comic\.(webp|jpg)(\?.*)?$/, route => blocked
    ? route.fulfill({ status: 503, body: 'Network temporarily unavailable' })
    : route.continue());
  await page.goto('/case/001');
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('cold-case:001:v1') || 'null')?.opened);
  await page.getByLabel('Value for camera_log', { exact: true }).fill('257880');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('cold-case:001:v1')!).codes[1])).toContain('camera_log = 257880');
  const saved = await page.evaluate(() => localStorage.getItem('cold-case:001:v1'));
  await page.getByRole('button', { name: 'Open Case brief', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'RETRY IMAGE', exact: true })).toBeVisible();
  blocked = false;
  await dialog.getByRole('button', { name: 'RETRY IMAGE', exact: true }).click();
  const image = dialog.locator('.case-comic img');
  await expect(image).toHaveAttribute('src', /opening-comic\.jpg\?retry=\d+/);
  await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).naturalWidth > 0)).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem('cold-case:001:v1'))).toBe(saved);
});
