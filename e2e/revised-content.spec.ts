import { unlockTeacher } from './fixtures';
import { test, expect } from './fixtures';
import { evidenceArtwork } from '../src/cases/case001-artwork';
import { case001, suspects } from '../src/cases/case001';

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

test('teacher tools offers the register and blank clue worksheet without highlighting the answer', async({page})=>{
  await page.goto('/teacher/case/001/print');await unlockTeacher(page);
  await expect(page.locator('.print-sheet')).toHaveCount(2);
  await expect(page.locator('.student-register tbody tr')).toHaveCount(30);
  await expect(page.locator('.student-register')).toContainText('Emily Carter');
  await expect(page.locator('.student-register')).toContainText('72427');
  await expect(page.locator('.student-register')).toContainText('Elena Brooks');
  await expect(page.locator('.student-register')).toContainText('39427');
  await expect(page.locator('.print-documents img')).toHaveCount(0);
  await expect(page.locator('.print-documents')).not.toContainText(/OPERATOR|ASSISTANT|recovered suffix|recovered prefix/i);
  await page.emulateMedia({media:'print'});
  await expect(page.locator('.print-toolbar')).toBeHidden();
});

test('explicit variable instructions and ten generated portraits are used throughout the case', async ({ page }) => {
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
  const locked = page.getByRole('dialog');
  await expect(locked).toContainText('FILES LOCKED');
  await expect(locked).not.toContainText('Emily');
  await expect(locked.locator('.portrait.redacted')).toHaveCount(9);
  for (const {name} of suspects) await expect(locked.getByRole('img', { name: `Illustrated school portrait of ${name}` })).toHaveCount(0);
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.evaluate(() => {
    const key = 'cold-case:001:v1', state = JSON.parse(localStorage.getItem(key)!);
    Object.assign(state, { solved: [1,2,3], cameraCodeAccepted: true, timeAccepted: true, archive1220Unlocked: true });
    localStorage.setItem(key, JSON.stringify(state));
  });
  await page.reload();
  await page.getByRole('button', { name: 'Open Suspect board', exact: true }).click();
  const dialog = page.getByRole('dialog');
  for (const {name} of suspects) {
    const portrait = dialog.getByRole('img', { name: `Illustrated school portrait of ${name}` });
    await expect(portrait).toHaveAttribute('src', `/cases/case001/portraits/${name.split(' ')[0].toLowerCase()}.webp`);
    await expect(portrait).toBeVisible();
    expect(await portrait.evaluate(node => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0)).toBe(true);
    await expect(dialog.getByRole('button', { name: `Inspect ${name}` })).toBeVisible();
  }
  await expect(dialog).toContainText('Maya Chen');
  await expect(dialog).not.toContainText('B4');
  expect(broken).toEqual([]);
});
