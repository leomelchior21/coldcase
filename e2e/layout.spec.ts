import { unlockTeacher } from './fixtures';
import { test, expect } from './fixtures';
test('landscape layouts keep Run and every step reachable; small screens retain evidence', async({page}) => {
  await page.goto('/case/001');
  for(const viewport of [{width:1366,height:768},{width:1024,height:768},{width:1180,height:820},{width:820,height:600},{width:844,height:390}]){
    await page.setViewportSize(viewport);
    await expect(page.getByRole('button',{name:'RUN CASE',exact:true})).toBeVisible();
    const run=await page.getByRole('button',{name:'RUN CASE',exact:true}).boundingBox();
    const dock=await page.locator('.step-dock').boundingBox();
    expect(run!.y+run!.height).toBeLessThanOrEqual(viewport.height);expect(dock!.y+dock!.height).toBeLessThanOrEqual(viewport.height);
    expect(run!.height).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight)).toBe(false);
    await expect(page.getByRole('button',{name:/08 The truth/})).toBeDisabled();await page.getByRole('button',{name:/03 Last seen/}).click();await expect(page.getByRole('heading',{name:'Last seen',exact:true})).toBeVisible();
    if(viewport.width<901){await page.getByRole('button',{name:/EVIDENCE \(/}).click();await page.getByRole('button',{name:'Open Case brief',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Brian was last seen');await page.getByRole('button',{name:'Close dialog'}).click();await page.getByRole('button',{name:'Close evidence desk'}).click();}
  }
  await page.setViewportSize({width:390,height:844});await expect(page.getByRole('heading',{name:'TURN YOUR DEVICE'})).toBeVisible();
});
test('A4 pack renders printable documents without game navigation',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='chromium','PDF generation is provided by Chromium.');
  await page.goto('/teacher/case/001/print');await unlockTeacher(page);await page.emulateMedia({media:'print'});await expect(page.locator('.print-toolbar')).toBeHidden();await expect(page.locator('.print-sheet')).toHaveCount(2);const pdf = await page.pdf({path:'test-results/cold-case-student-register.pdf',format:'A4',printBackground:false,preferCSSPageSize:true});expect(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)).toHaveLength(1);
  await expect(page.locator('.clue-worksheet')).toBeHidden();
  await page.emulateMedia({media:'screen'});
  await page.evaluate(() => { window.print = () => {}; });
  await page.getByRole('button',{name:'PRINT CLUE WORKSHEET',exact:true}).click();
  await page.emulateMedia({media:'print'});
  await expect(page.locator('.student-register')).toBeHidden();
  await expect(page.locator('.clue-box')).toHaveCount(8);
  for (const box of await page.locator('.clue-box').all()) {
    const size = await box.boundingBox();
    expect(size!.width / size!.height).toBeCloseTo(1, 2);
    expect(await box.evaluate(node => node.textContent)).toBe(await box.locator('h3').textContent());
  }
  const worksheet = await page.pdf({path:'test-results/cold-case-clue-worksheet.pdf',printBackground:false,preferCSSPageSize:true});
  expect(worksheet.toString('latin1').match(/\/Type\s*\/Page\b/g)).toHaveLength(1);
  await page.locator('.clue-worksheet').screenshot({path:'test-results/clue-worksheet.png'});
  await page.emulateMedia({media:'screen'});
  await page.getByRole('button',{name:'PRINT STUDENT REGISTER',exact:true}).click();
  await page.emulateMedia({media:'print'});
  await expect(page.locator('.clue-worksheet')).toBeHidden();
  await expect(page.locator('.student-register')).toBeVisible();
});
