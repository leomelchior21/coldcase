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
  await page.goto('/teacher/case/001/print');await unlockTeacher(page);await page.emulateMedia({media:'print'});await expect(page.locator('.print-toolbar')).toBeHidden();await expect(page.locator('.print-sheet')).toHaveCount(16);await page.pdf({path:'test-results/cold-case-evidence-pack.pdf',format:'A4',printBackground:false,preferCSSPageSize:true});
});
