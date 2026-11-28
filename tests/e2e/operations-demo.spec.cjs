const {test,expect}=require('@playwright/test');
const origin='http://127.0.0.1:4174';
test('attendance register updates shared report',async({page})=>{
 await page.goto(origin+'/#attendance');
 const panel=page.locator('.demo-operations');
 await panel.getByRole('checkbox',{name:'Demo Member A'}).check();
 await panel.getByRole('button',{name:'Save sample register'}).click();
 await expect(page.locator('tbody tr').first()).toContainText('1');
 await page.getByRole('button',{name:'Reports & Analytics',exact:true}).click();
 await expect(page.locator('.demo-operations')).toContainText('Recorded attendance: 33');
});
test('finance budget is calculated in minor currency units',async({page})=>{
 await page.goto(origin+'/#finance');
 const panel=page.locator('.demo-operations');
 await panel.getByLabel('Sample expense ceiling (GHS)').fill('300.50');
 await panel.getByRole('button',{name:'Save sample budget'}).click();
 await expect(panel).toContainText('180.50');
 await page.getByRole('button',{name:'Reports & Analytics',exact:true}).click();
 await expect(page.locator('.demo-operations')).toContainText('330');
 await page.getByRole('button',{name:'Financial Management',exact:true}).click();
 await expect(page.locator('.demo-operations')).toContainText('180.50');
});
test('worklists filter synthetic records and never send messages',async({page})=>{
 for(const [key,status,fixture] of [['ministry','Inactive','No matching sample records.'],['media','Review','Demo service photos'],['care','Scheduled','DEMO-002'],['communications','Scheduled','Demo volunteer meeting']]){
 await page.goto(origin+'/#'+key);
 const panel=page.locator('.demo-operations');
 await panel.getByLabel('Filter worklist status').selectOption(status);
 await expect(panel).toContainText(fixture);
 }
 await expect(page.locator('.demo-operations')).toContainText('no message is transmitted');
});
