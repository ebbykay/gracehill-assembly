const {test,expect}=require('@playwright/test');
const origin='http://127.0.0.1:4174';
test('department indicators respond to record changes and history navigation',async({page})=>{
 await page.goto(origin+'/#membership');
 await expect(page.locator('.department-metric')).toHaveCount(3);
 await expect(page.locator('.record-status').first()).toHaveText('Active');
 await page.getByRole('button',{name:'Add fictional member'}).click();
 await page.getByLabel('Member',{exact:true}).fill('Demo new member');
 await page.getByLabel('Household',{exact:true}).fill('Household C');
 await page.getByRole('button',{name:'Save sample',exact:true}).click();
 await expect(page.locator('.department-metric').first()).toContainText('3');
 await page.getByRole('button',{name:'Financial Management',exact:true}).click();
 await expect(page.locator('.department-metrics')).toContainText('Net movement');
 await page.goBack();
 await expect(page.locator('h1')).toHaveText('Membership Management');
});
