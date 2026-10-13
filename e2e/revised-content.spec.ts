import { test, expect } from '@playwright/test';
import { evidenceArtwork } from '../src/cases/case001-artwork';
import { case001 } from '../src/cases/case001';

test('every clue uses a loaded generated illustration and keeps record facts readable', async ({ page }, testInfo) => {
  const failures: string[] = [];
  page.on('response', response => { if (response.url().includes('/cases/case001/') && response.status() >= 400) failures.push(response.url()); });
  await page.goto('/case/001');
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('cold-case:001:v1') || 'null')?.opened === true);
  await page.evaluate(() => {
    const key='cold-case:001:v1', state=JSON.parse(localStorage.getItem(key)!);
    Object.assign(state,{solved:[1,2,3,4,5,6,7,8],cameraCodeAccepted:true,timeAccepted:true,archive1220Unlocked:true,selectedSuspect:'emily'});
    localStorage.setItem(key,JSON.stringify(state));
  });
  await page.reload();
  for (const [id,artwork] of Object.entries(evidenceArtwork)) {
    await page.getByRole('button',{name:`Open ${case001.documents.find(d=>d.id===id)!.title}`,exact:true}).click();
    const dialog=page.getByRole('dialog');
    const illustration = dialog.getByRole('img', { name: artwork.alt, exact: true });
    await expect(illustration).toHaveAttribute('src', `/cases/case001/evidence/${artwork.file}.webp`);
    await expect.poll(() => illustration.evaluate(node => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0)).toBe(true);
    if(id==='FINAL-01')await dialog.screenshot({path:`test-results/${testInfo.project.name}-final-evidence.png`});
    await page.getByRole('button',{name:'Close dialog'}).click();
  }
  expect(failures).toEqual([]);
});

test('student print pack has blank answers and no revealing photo or solved record',async({page})=>{
  await page.goto('/teacher/case/001/print');
  await expect(page.locator('.print-sheet')).toHaveCount(16);
  await expect(page.locator('.print-documents')).not.toContainText(/\b280\b|\b27\b|15:40|1540|1220|2440|\b204\b|\bB4\b|\b68\b|BLUE BACKPACK|OPERATOR: BRIAN|ASSISTANT: EMILY/i);
  expect(await page.locator('.answer-line').count()).toBeGreaterThan(40);
  for(const cell of await page.locator('.worksheet-comparison td').all())await expect(cell).toHaveText('');
  await expect(page.locator('img[src*="equipment-log"]')).toHaveCount(0);
  await expect(page.locator('img[src*="timeline-record-v2"]')).toHaveCount(1);
  await page.emulateMedia({media:'print'});
  expect(await page.locator('.worksheet-photo.cctv-monochrome').evaluate(node=>getComputedStyle(node).filter)).toContain('grayscale(1)');
});

test('explicit variable instructions and seven generated portraits are used throughout the case', async ({ page }) => {
  const broken: string[] = [];
  page.on('response', response => { if (response.url().includes('/portraits/') && response.status() >= 400) broken.push(response.url()); });
  await page.goto('/');
  const brian = page.getByRole('img', { name: 'Illustrated school portrait of Brian' });
  await expect(brian).toHaveAttribute('src', '/cases/case001/portraits/brian.webp');
  await page.getByRole('button', { name: 'OPEN FILE', exact: true }).click();
  const editor = page.getByRole('textbox', { name: 'Python code editor' });
  await expect(editor).toContainText('Create the variable camera_log.');
  await expect(editor).toContainText('The security camera log is 257880.');
  await expect(editor).toContainText('Use print(result).');
  await page.getByRole('button', { name: 'Open Suspect board', exact: true }).click();
  const dialog = page.getByRole('dialog');
  for (const name of ['Emily','Tyler','Luke','Anna','Noah','Sophie']) {
    const portrait = dialog.getByRole('img', { name: `Illustrated school portrait of ${name}` });
    await expect(portrait).toHaveAttribute('src', `/cases/case001/portraits/${name.toLowerCase()}.webp`);
    await expect(portrait).toBeVisible();
    expect(await portrait.evaluate(node => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0)).toBe(true);
    await expect(dialog.getByRole('button', { name: `Inspect ${name}` })).toBeVisible();
  }
  await expect(dialog).not.toContainText('Maya');
  await expect(dialog).not.toContainText('B4');
  expect(broken).toEqual([]);
});
