import { test, expect, unlockTeacher, type Page } from './fixtures';
import { solutions } from '../tests/fixtures/casePrograms';
import { case001, suspects } from '../src/cases/case001';

async function code(page: Page, source: string) { await page.getByRole('textbox',{name:/^(Python|C#) code editor$/}).fill(source); }
async function closeDocument(page: Page) { await page.getByRole('button',{name:'Close dialog'}).click(); }
async function openDiscoveries(page: Page, ids: string[]) {
  for (const id of ids) {
    const title = case001.documents.find(doc => doc.id === id)!.title;
    const spotlight = page.getByRole('dialog', {name:'New evidence recovered'});
    await expect(spotlight).toBeVisible();
    await spotlight.getByRole('button', {name:new RegExp(title)}).click();
    await expect(page.getByRole('dialog', {name:title, exact:true})).toBeVisible();
    if (id === 'FINAL-01') {
      await expect(page.getByRole('button', {name:'Student number register',exact:true})).toHaveCount(0);
      await expect(page.locator('.document-copy')).toContainText('FIRST TWO PASSWORD DIGITS: 72');
      await expect(page.locator('.document-copy')).not.toContainText(/Emily|Carter|demonstration/);
      await expect(page.locator('img[src*="equipment-log"]')).toHaveCount(0);
    }
    await closeDocument(page);
  }
}

for (const language of ['python','csharp'] as const) test(`complete ${language} case with ambiguous suspects, dramatic discoveries and both endings`, async ({page}, testInfo) => {
  test.setTimeout(240000);
  await page.addInitScript(language => { const key='cold-case:001:v1'; const state=JSON.parse(localStorage.getItem(key)!); state.language=language; localStorage.setItem(key, JSON.stringify(state)); }, language);
  const errors:string[]=[]; page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/case/001');
  for (let index=0;index<8;index++) {
    const step=case001.steps[index];
    if (index===3) {
      const terminal=page.getByRole('dialog',{name:'CCTV archive terminal'});
      await expect(terminal).toBeVisible();
      await terminal.getByLabel('ENTER CAMERA CODE').fill('999');
      await terminal.getByRole('button',{name:/VERIFY CAMERA/}).click();
      await expect(terminal.getByRole('status')).toContainText('CAMERA NOT FOUND');
      await terminal.getByLabel('ENTER CAMERA CODE').fill('280');
      await terminal.getByRole('button',{name:/VERIFY CAMERA/}).click();
      for(let i=0;i<9;i++) await terminal.getByRole('button',{name:'Decrease hour',exact:true}).click();
      for(let i=0;i<4;i++) await terminal.getByRole('button',{name:'Back 5 minutes',exact:true}).click();
      await terminal.getByRole('button',{name:/SEARCH ARCHIVE/}).click();
      await expect(terminal).toContainText('ARCHIVE FOUND');
      await expect(terminal).toContainText('N# 2');
      await terminal.getByRole('button',{name:/CONTINUE TO THE FOOTAGE/}).click();
    }
    const editor=page.getByRole('textbox',{name:/^(Python|C#) code editor$/});
    if(index>0) {
      await expect(editor).toContainText('VARIABLE_1');
      await expect(page.locator('.code-placeholder').first()).toBeVisible();
    }
    const source=language==='python'?solutions[index]:solutions[index].split('\n').map(line=>line.startsWith('print(')?'Console.WriteLine(result);':`int ${line};`).join('\n');
    await code(page, source);
    await page.getByRole('button',{name:'RUN CASE',exact:true}).click();
    await expect(page.locator('.console-output.success')).toBeVisible();
    if (index===0) await page.screenshot({path:`test-results/${testInfo.project.name}-${language}-discovery.png`});
    await openDiscoveries(page, step.unlockEvidence);
    if(index===5) {
      await page.getByRole('button',{name:'Open Detailed suspect files',exact:true}).click();
      await expect(page.locator('.suspect-card')).toHaveCount(9);
      for(const name of ['Emily Carter','Elena Brooks','Oliver Grant']) {
        const person=page.getByRole('button',{name:`Inspect ${name}`,exact:true});
        await expect(person).toContainText('Blue backpack'); await expect(person).toContainText('Card B4'); await expect(person).toContainText('Room 204');
      }
      await closeDocument(page);
    }
    if(index!==2 && index<7) await page.getByRole('button',{name:'NEXT STEP',exact:true}).click();
  }
  await page.getByRole('button',{name:'RECONSTRUCT THE CASE'}).click();
  await expect(page.locator('.deduction-suspects button')).toHaveCount(9);
  for (const suspect of suspects.filter(person => person.id !== 'emily')) {
    await page.getByRole('button',{name:suspect.name,exact:true}).click();
    await page.getByRole('button',{name:'CLOSE THE CASE'}).click();
    await expect(page.getByRole('alert')).toContainText('the mystery will never be solved');
    await page.getByRole('button',{name:/CHECK THE LEVELS AND TRY AGAIN/}).click();
    await expect(page.getByRole('heading',{name:'The missing prefix'})).toBeVisible();
    await page.getByRole('button',{name:'RECONSTRUCT THE CASE'}).click();
  }
  await page.getByRole('button',{name:'Emily Carter',exact:true}).click();
  await page.getByRole('button',{name:'CLOSE THE CASE'}).click();
  await expect(page.getByText('Brian was never in danger.',{exact:true})).toBeVisible();
  await expect(page.locator('.ending-scene img')).toBeVisible();
  await expect(page.locator('.reconstruction-chain')).toContainText('72427');
  await page.screenshot({path:`test-results/${testInfo.project.name}-${language}-ending.png`,animations:'disabled'});
  await page.reload();await expect(page.getByText('Brian was never in danger.',{exact:true})).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('cold-case:001:v1')!));
  expect(saved.solved).toHaveLength(8);expect(saved.results[7]).toBe(427);expect(saved.results[8]).toBe(72);expect(saved.closed).toBe(true);expect(errors).toEqual([]);
});

test('notes, evidence inspection, reset confirmation, and updated print pack', async({page})=>{
  await page.goto('/case/001');const editor=page.getByRole('textbox',{name:/^(Python|C#) code editor$/});await expect(editor).toContainText('# CASE NOTE');await expect(editor).toContainText('camera_log = 257880');
  await page.getByRole('button',{name:'HIDE CASE NOTE'}).click();await expect(editor).not.toContainText('# CASE NOTE');await expect(editor).toContainText('camera_log = 257880');await expect(editor).toContainText('print(result)');await code(page,'# my draft\ncamera_log = 257880');await page.getByRole('button',{name:'SHOW CASE NOTE'}).click();await expect(editor).toContainText('# my draft');await expect(editor).toContainText('# CASE NOTE');
  await page.getByRole('button',{name:'Open Suspect board',exact:true}).click();await expect(page.getByRole('dialog')).not.toContainText('Emily');await expect(page.getByRole('dialog')).toContainText('FILES LOCKED');await page.locator('.suspect-card').first().click();await expect(page.getByRole('dialog')).toContainText('Further records have not been recovered');await expect(page.getByRole('dialog')).not.toContainText('B4');await page.getByRole('button',{name:'Case brief',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Find the records.');await closeDocument(page);
  await page.getByRole('button',{name:'RESET',exact:true}).click();await page.getByRole('button',{name:'KEEP MY CODE'}).click();await expect(editor).toContainText('# my draft');await page.getByRole('button',{name:'RESET',exact:true}).click();await page.getByRole('button',{name:'RESET PROGRAM'}).click();await expect(editor).not.toContainText('# my draft');await expect(editor).toContainText('camera_log = 257880');
  await page.getByRole('button',{name:'RESET CASE',exact:true}).click();await page.getByRole('button',{name:'KEEP MY CASE'}).click();await expect(page.getByRole('heading',{name:'The camera code'})).toBeVisible();await page.getByRole('button',{name:'RESET CASE',exact:true}).click();await page.getByRole('button',{name:'START OVER',exact:true}).click();await expect(page.getByRole('button',{name:'OPEN FILE',exact:true})).toBeVisible();
  await page.getByRole('link',{name:/TEACHER TOOLS/}).click();await unlockTeacher(page);await expect(page.getByRole('button',{name:'PRINT STUDENT REGISTER'})).toBeVisible();await expect(page.locator('.print-sheet')).toHaveCount(1);await expect(page.locator('.print-documents')).not.toContainText('OPERATOR: BRIAN');await expect(page.locator('.student-register tbody tr')).toHaveCount(30);
});

