import { test, expect, type Page } from '@playwright/test';
import { solutions } from '../tests/fixtures/casePrograms';

async function seedArchive(page: Page, stage: 'camera' | 'time' | 'done') {
  await page.goto('/case/001');
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('cold-case:001:v1') || 'null')?.opened === true);
  await page.evaluate(stage => {
    const key = 'cold-case:001:v1';
    const state = JSON.parse(localStorage.getItem(key)!);
    Object.assign(state, { solved: [1,2,3], results: {1:280,2:27,3:1540}, currentStep:3, cameraCodeAccepted:stage!=='camera',timeAccepted:stage==='done',archive1220Unlocked:stage==='done' });
    localStorage.setItem(key,JSON.stringify(state));
  },stage);
  await page.reload();
}

test('mechanical selectors support pointer drag, keyboard, and touch-sized controls', async({page},testInfo)=>{
  await seedArchive(page,'time');
  const terminal=page.getByRole('dialog',{name:'CCTV archive terminal'});
  const hour=terminal.getByRole('spinbutton',{name:'hour',exact:true});
  await hour.scrollIntoViewIfNeeded();const box=await hour.boundingBox();
  await page.mouse.move(box!.x+box!.width/2,box!.y+box!.height/2+24);await page.mouse.down();await page.mouse.move(box!.x+box!.width/2,box!.y+box!.height/2-48,{steps:6});await page.mouse.up();
  await expect(hour).toHaveAttribute('aria-valuenow','3');
  await hour.focus();await page.keyboard.press('ArrowUp');await expect(hour).toHaveAttribute('aria-valuenow','4');
  await page.keyboard.press('PageDown');await expect(hour).toHaveAttribute('aria-valuenow','23');
  const plus=terminal.getByRole('button',{name:'Advance 5 minutes'});
  expect((await plus.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  if(testInfo.project.name==='webkit-ipad')await plus.tap();else await plus.click();
  await expect(terminal.getByRole('spinbutton',{name:'minute',exact:true})).toHaveAttribute('aria-valuenow','5');
  expect(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight)).toBe(false);
});

test('confirmed case reset clears every CCTV phase and saved results',async({page})=>{
  for(const stage of ['camera','time','done'] as const){
    await seedArchive(page,stage);
    if(stage!=='done')await page.getByRole('button',{name:'Close dialog'}).click();
    await page.getByRole('button',{name:'RESET CASE',exact:true}).click();
    await page.getByRole('button',{name:'START OVER',exact:true}).click();
    const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('cold-case:001:v1')!));
    expect(state.cameraCodeAccepted).toBe(false);expect(state.timeAccepted).toBe(false);expect(state.archive1220Unlocked).toBe(false);expect(state.results).toEqual({});expect(state.evidence).toEqual(['BRIEF','BOARD']);
  }
});

test('color restoration respects reduced motion while preserving the original monochrome frame',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await seedArchive(page,'done');
  await page.getByRole('button',{name:/04 The footage/}).click();await page.getByRole('textbox',{name:'Python code editor'}).fill(solutions[3]);await page.getByRole('button',{name:'RUN CASE',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Restored CCTV frame'});await expect(dialog).toBeVisible();
  expect(await dialog.locator('.color-reveal img').evaluate(node=>getComputedStyle(node).animationName)).toBe('none');
  await dialog.getByRole('button',{name:'Original CCTV frame',exact:true}).click();
  expect(await page.getByRole('dialog').locator('.cctv-monochrome').evaluate(node=>getComputedStyle(node).filter)).toContain('grayscale(1)');
  await expect(page.getByRole('dialog').locator('.document-copy')).not.toContainText(/blue/i);
});

test('legacy student programs and results remain reviewable without granting new evidence',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'OPEN FILE',exact:true}).waitFor();
  await page.evaluate(()=>localStorage.setItem('cold-case:001:v1',JSON.stringify({version:1,caseId:'001',opened:true,solved:[1],codes:{1:'# My saved program\nhall_camera = 1\nextra_camera = 2\nresult = hall_camera + extra_camera\nprint(result)'},evidence:['C03']})));
  await page.goto('/case/001');await expect(page.getByRole('textbox',{name:'Python code editor'})).toContainText('257880');
  await page.getByRole('button',{name:'PREVIOUS NOTES',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('My saved program');await expect(page.getByRole('dialog')).toContainText('Saved result: 3');
  await page.getByRole('button',{name:'Close dialog'}).click();await expect(page.getByRole('button',{name:'Open Security camera record'})).toHaveCount(0);
});
