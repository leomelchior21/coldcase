import { test, expect, type Page } from '@playwright/test';
import { solutions } from '../tests/fixtures/casePrograms';

async function code(page: Page, source: string) { await page.getByRole('textbox',{name:'Python code editor'}).fill(source); }
async function run(page: Page, index: number) { await code(page, solutions[index]); await page.getByRole('button',{name:'RUN CASE',exact:true}).click(); }
async function noOverflow(page: Page) { expect(await page.evaluate(() => ({ x: document.documentElement.scrollWidth > innerWidth, y: document.documentElement.scrollHeight > innerHeight }))).toEqual({x:false,y:false}); }
async function closeDocument(page: Page) { await page.getByRole('button',{name:'Close dialog'}).click(); }

test('complete recovered investigation, CCTV authentication, visual reveal, deduction and reload', async ({page},testInfo) => {
  test.setTimeout(240000);
  const errors:string[]=[]; page.on('pageerror',error=>errors.push(error.message)); page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text())});
  await page.goto('/'); await expect(page.getByRole('heading',{name:'WHO TOOK BRIAN?'})).toBeVisible(); await noOverflow(page);
  await page.getByRole('button',{name:'OPEN FILE',exact:true}).click();
  await expect(page.getByRole('heading',{name:'The camera code'})).toBeVisible();
  for(const id of [4,5,6,7,8]) await expect(page.locator('.step-tab').nth(id-1)).toBeDisabled();
  await code(page,'result = 280\nprint(result)');await page.getByRole('button',{name:'RUN CASE',exact:true}).click();await expect(page.locator('.console-output.error')).toBeVisible();
  for(let i=0;i<3;i++){
    await run(page,i);await expect(page.locator('.console-output.success')).toBeVisible();
    if(i<2){
      for(const id of [4,5,6,7,8]) await expect(page.locator('.step-tab').nth(id-1)).toBeDisabled();
      await page.getByRole('button',{name:'OPEN NEW EVIDENCE'}).click();
      const doc=page.getByRole('dialog');
      await expect(doc).toContainText(i===0?'CAMERA CODE: 280':'MISSING KEY: 27');
      await expect(doc).not.toContainText(i===0?'1220':'204');
      await closeDocument(page);await page.getByRole('button',{name:'NEXT STEP',exact:true}).click();
    }
  }
  const terminal=page.getByRole('dialog',{name:'CCTV archive terminal'});
  await expect(terminal).toBeVisible();await expect(page.locator('.interpreted-result')).toContainText('15:40');
  await expect(terminal.getByLabel('ENTER CAMERA CODE')).toHaveValue('');
  await closeDocument(page);
  for(const id of [4,5,6,7,8]) await expect(page.locator('.step-tab').nth(id-1)).toBeDisabled();
  await page.locator('.terminal-shortcut').click();
  await terminal.getByLabel('ENTER CAMERA CODE').fill('999');await terminal.getByRole('button',{name:/VERIFY CAMERA/}).click();await expect(terminal.getByRole('status')).toContainText('CAMERA NOT FOUND');
  await terminal.getByText('CHECK YOUR EVIDENCE',{exact:true}).click();await terminal.getByRole('button',{name:'Security camera record',exact:true}).click();
  await expect(terminal).toContainText('CAMERA CODE: 280');await terminal.getByRole('button',{name:'RETURN TO TERMINAL'}).click();
  await terminal.getByLabel('ENTER CAMERA CODE').fill('280');await terminal.getByRole('button',{name:/VERIFY CAMERA/}).click();await expect(terminal).toContainText('CAMERA 280 ACCEPTED');
  await closeDocument(page);
  for(const id of [4,5,6,7,8]) await expect(page.locator('.step-tab').nth(id-1)).toBeDisabled();
  await page.locator('.terminal-shortcut').click();
  await page.reload();await expect(terminal).toContainText('CAMERA 280 ACCEPTED');
  await expect(terminal.getByRole('spinbutton',{name:'hour',exact:true})).toHaveAttribute('aria-valuenow','0');
  await expect(terminal.getByRole('spinbutton',{name:'minute',exact:true})).toHaveAttribute('aria-valuenow','0');
  await terminal.getByRole('button',{name:/SEARCH ARCHIVE/}).click();await expect(terminal.getByRole('status')).toContainText('NO ARCHIVE AT THIS TIME');
  for(let i=0;i<9;i++)await terminal.getByRole('button',{name:'Decrease hour',exact:true}).click();
  for(let i=0;i<4;i++)await terminal.getByRole('button',{name:'Back 5 minutes',exact:true}).click();
  await expect(terminal.getByRole('spinbutton',{name:'hour',exact:true})).toHaveAttribute('aria-valuenow','15');
  await expect(terminal.getByRole('spinbutton',{name:'minute',exact:true})).toHaveAttribute('aria-valuenow','40');
  await page.screenshot({path:`test-results/${testInfo.project.name}-cctv-clock.png`});
  await terminal.getByRole('button',{name:/SEARCH ARCHIVE/}).click();await expect(terminal).toContainText('ARCHIVE FOUND');await expect(terminal.locator('.archive-file-code strong')).toHaveText('1220');
  await expect(terminal).not.toContainText(/blue/i);
  for(const id of [4,5,6,7,8]) await expect(page.locator('.step-tab').nth(id-1)).toBeEnabled();
  expect(await terminal.locator('.cctv-monochrome').evaluate(node=>getComputedStyle(node).filter)).toContain('grayscale(1)');
  await page.screenshot({path:`test-results/${testInfo.project.name}-cctv-monochrome.png`});
  await closeDocument(page);await page.reload();await expect(terminal).not.toBeVisible();
  await page.locator('.terminal-shortcut').click();await expect(terminal).toContainText('ARCHIVE FOUND');await expect(terminal.getByLabel('ENTER CAMERA CODE')).toHaveCount(0);
  await terminal.getByRole('button',{name:/CONTINUE TO THE FOOTAGE/}).click();
  await run(page,3);const footage=page.getByRole('dialog',{name:'Restored CCTV frame'});await expect(footage).toBeVisible();
  await expect.poll(()=>footage.locator('.color-reveal img').evaluate(node=>getComputedStyle(node).filter)).toBe('grayscale(0) contrast(1)');
  await expect(footage).toContainText('BLUE BACKPACK');await expect(footage).not.toContainText('Emily');
  await page.screenshot({path:`test-results/${testInfo.project.name}-footage.png`});await closeDocument(page);
  await expect(page.locator('.interpreted-result')).toContainText('2440');
  await page.getByRole('button',{name:'NEXT STEP',exact:true}).click();
  await run(page,4);await expect(page.locator('.interpreted-result')).toContainText('204');await page.getByRole('button',{name:'OPEN NEW EVIDENCE'}).click();await expect(page.getByRole('dialog')).toContainText('KEY: 27');await closeDocument(page);
  await page.getByRole('button',{name:'NEXT STEP',exact:true}).click();
  await run(page,5);await expect(page.getByRole('dialog',{name:'Room 204 access log'})).toBeVisible();await expect(page.locator('.verified-access-row')).toContainText('B4');await expect(page.locator('.verified-access-row')).toContainText('15:43');await closeDocument(page);
  await expect(page.locator('.interpreted-result')).toContainText('3 MINUTES LATER');await page.getByRole('button',{name:'NEXT STEP',exact:true}).click();
  await expect(page.getByRole('textbox',{name:'Python code editor'})).not.toContainText('Emily');
  await page.getByRole('button',{name:'Open Detailed suspect files',exact:true}).click();
  await page.getByRole('button',{name:'Inspect Tyler',exact:true}).click();await page.getByRole('button',{name:'CHECK CLUES FOR TYLER'}).click();
  await run(page,6);await expect(page.locator('.console-output.error')).toContainText('does not match all three clues');
  await page.getByRole('button',{name:'Open Detailed suspect files',exact:true}).click();await page.getByRole('button',{name:'Inspect Emily',exact:true}).click();await page.getByRole('button',{name:'CHECK CLUES FOR EMILY'}).click();
  await run(page,6);await expect(page.locator('.console-output.success')).toContainText('3 / 3 CLUES MATCH');await expect(page.locator('.console-output.success')).toContainText('Person of interest');
  await page.getByRole('button',{name:'OPEN NEW EVIDENCE'}).click();await expect(page.getByRole('dialog')).toContainText('Emily matches the evidence');await closeDocument(page);
  await page.getByRole('button',{name:'NEXT STEP',exact:true}).click();await run(page,7);await expect(page.locator('.interpreted-result')).toContainText('+68%');
  await page.getByRole('button',{name:'OPEN NEW EVIDENCE'}).click();await expect(page.getByRole('dialog')).toContainText('OPERATOR: BRIAN');await expect(page.getByRole('dialog')).toContainText('ASSISTANT: EMILY');await closeDocument(page);
  await page.getByRole('button',{name:'RECONSTRUCT THE CASE'}).click();await noOverflow(page);
  await page.getByRole('button',{name:'Emily',exact:true}).click();await page.getByRole('button',{name:'A Emily took Brian against his will.'}).click();await page.getByRole('button',{name:'CLOSE THE CASE'}).click();await expect(page.getByRole('status')).toContainText('A match does not prove guilt');
  await page.getByRole('button',{name:/B Brian and Emily went/}).click();await page.getByRole('button',{name:'CLOSE THE CASE'}).click();await expect(page.getByText('Brian was never in danger.',{exact:true})).toBeVisible();await expect(page.locator('.reconstruction-chain')).toContainText('CAMERA 280');await expect(page.locator('.reconstruction-chain')).toContainText('ARCHIVE 1220');await noOverflow(page);
  await page.screenshot({path:`test-results/${testInfo.project.name}-ending.png`});
  await page.reload();await expect(page.getByText('Brian was never in danger.',{exact:true})).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('cold-case:001:v1')!));expect(saved.archive1220Unlocked).toBe(true);expect(saved.solved).toHaveLength(8);expect(saved.results[4]).toBe(2440);expect(saved.codes[0]).toBeUndefined();expect(errors).toEqual([]);
});

test('notes, evidence inspection, reset confirmation, and updated print pack', async({page})=>{
  await page.goto('/case/001');const editor=page.getByRole('textbox',{name:'Python code editor'});await expect(editor).toContainText('# CASE NOTE');
  await page.getByRole('button',{name:'HIDE CASE NOTE'}).click();await expect(editor).toHaveText('');await code(page,'camera_log = 257880');await page.getByRole('button',{name:'SHOW CASE NOTE'}).click();await expect(editor).toContainText('camera_log = 257880');await expect(editor).toContainText('# CASE NOTE');
  await page.getByRole('button',{name:'Open Suspect board',exact:true}).click();await page.getByRole('button',{name:'Inspect Emily'}).click();await expect(page.getByRole('dialog')).toContainText('Further records have not been recovered');await expect(page.getByRole('dialog')).not.toContainText('B4');await page.getByRole('button',{name:'Case brief',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Find the records.');await closeDocument(page);
  await page.getByRole('button',{name:'RESET',exact:true}).click();await page.getByRole('button',{name:'KEEP MY CODE'}).click();await expect(editor).toContainText('camera_log = 257880');await page.getByRole('button',{name:'RESET',exact:true}).click();await page.getByRole('button',{name:'RESET PROGRAM'}).click();await expect(editor).not.toContainText('camera_log = 257880');
  await page.getByRole('button',{name:'RESET CASE',exact:true}).click();await page.getByRole('button',{name:'KEEP MY CASE'}).click();await expect(page.getByRole('heading',{name:'The camera code'})).toBeVisible();await page.getByRole('button',{name:'RESET CASE',exact:true}).click();await page.getByRole('button',{name:'START OVER',exact:true}).click();await expect(page.getByRole('button',{name:'OPEN FILE',exact:true})).toBeVisible();
  await page.getByRole('link',{name:/TEACHER TOOLS/}).click();await expect(page.getByRole('button',{name:'PRINT CASE PACK'})).toBeVisible();await expect(page.locator('.print-sheet')).toHaveCount(16);await expect(page.locator('.print-documents')).not.toContainText('OPERATOR: BRIAN');await expect(page.locator('.answer-line').first()).toBeVisible();
});

