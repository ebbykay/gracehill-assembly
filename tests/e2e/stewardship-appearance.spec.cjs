const {test,expect}=require('@playwright/test');
test('finance visual indicators respond to sample budget and appearance persists across modules',async({page})=>{
 await page.goto('http://127.0.0.1:4174/#finance');
 await expect(page.locator('.finance-chart-row')).toHaveCount(2);
 await expect(page.locator('.budget-utilization')).toContainText('24%');
 await page.getByLabel('Sample expense ceiling (GHS)').fill('100');
 await page.getByRole('button',{name:'Save sample budget'}).click();
 await expect(page.locator('.budget-utilization')).toContainText('120%');
 await page.getByRole('button',{name:'Dark appearance'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-admin-appearance','dark');
 await page.getByRole('button',{name:'Dashboard',exact:true}).click();
 await expect(page.locator('html')).toHaveAttribute('data-admin-appearance','dark');
 await page.getByRole('button',{name:'Dark appearance'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-admin-appearance','light');
});
