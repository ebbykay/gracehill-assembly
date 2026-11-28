const {test,expect}=require('@playwright/test');
const origin='http://127.0.0.1:4174';
test('household view opens member profile',async({page})=>{
 await page.goto(origin+'/#membership');
 await page.getByRole('button',{name:'Household groups',exact:true}).click();
 const grid=page.locator('.demo-member-grid');
 await expect(grid).toContainText('Household A');
 await grid.getByRole('button',{name:'Demo Member A',exact:true}).click();
 await expect(page.locator('.profile-header')).toContainText('Demo Member A');
});
test('calendar month navigation and reusable outline templates',async({page})=>{
 await page.goto(origin+'/#events');
 await page.getByRole('button',{name:'Next month',exact:true}).click();
 await expect(page.getByLabel('Calendar month')).toHaveValue('2027-01');
 await page.getByRole('button',{name:'Previous month',exact:true}).click();
 await page.getByRole('button',{name:'Load sample Sunday template'}).click();
 await page.getByLabel('Sample template name').fill('Demo reusable');
 await page.getByRole('button',{name:'Save outline as template'}).click();
 await page.getByLabel('Select programme for outline').selectOption({label:'Demo worship evening · 2026-12-13'});
 await page.getByRole('button',{name:'Apply saved template'}).click();
 await expect(page.locator('.demo-outline')).toContainText('100 minutes total');
});
test('report CSV is downloadable',async({page})=>{
 await page.goto(origin+'/#reports');
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'Download sample report CSV'}).click();
 expect((await download).suggestedFilename()).toBe('gracehill-sample-report.csv');
});
