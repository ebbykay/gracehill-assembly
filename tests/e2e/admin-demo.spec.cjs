const {test,expect}=require('@playwright/test');
const origin='http://127.0.0.1:4174';
const pages={dashboard:'Dashboard',membership:'Membership Management',attendance:'Attendance',finance:'Financial Management',events:'Programme Management',ministry:'Ministry Management',media:'Media Management',care:'Pastoral Care',communications:'Communications',reports:'Reports & Analytics',settings:'Settings'};
for(const width of [320,768,1440])test('all administration modules at '+width,async({page})=>{
 await page.setViewportSize({width,height:900});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const [key,label] of Object.entries(pages)){
 await page.goto(origin+'/#'+key);await expect(page.locator('h1')).toHaveText(label);
 await expect(page.locator('.preview-warning')).toContainText('fictional');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 if(key!=='dashboard')await expect(page.locator('tbody tr').first()).toBeVisible();
 }
 expect(errors).toEqual([]);
});
test('programme demo creates and advances a fictional draft',async({page})=>{
 await page.goto(origin+'/#events');
 await page.getByRole('button',{name:'Create sample programme'}).click();
 await page.getByLabel('Programme',{exact:true}).fill('Demo browser fixture');
 await page.getByLabel('Date',{exact:true}).fill('2099-01-01');
 await page.getByRole('button',{name:'Save sample'}).click();
 await page.getByRole('searchbox').fill('Demo browser fixture');
 const row=page.locator('tbody tr').filter({hasText:'Demo browser fixture'});
 await row.getByRole('button',{name:'Submit for review'}).click();
 await row.getByRole('button',{name:'Publish sample'}).click();
 await row.getByRole('button',{name:'Archive'}).click();
 await expect(row).toContainText('archived');
 await page.reload();await expect(page.locator('tbody')).not.toContainText('Demo browser fixture');
});
test('finance form updates summary without external writes',async({page})=>{
 await page.goto(origin+'/#finance');
 await page.getByRole('button',{name:'Add sample transaction'}).click();
 await page.getByLabel('Transaction',{exact:true}).fill('Demo expense fixture');
 await page.getByLabel('Category',{exact:true}).selectOption('Expense');
 await page.getByLabel('Amount (GHS)',{exact:true}).fill('30');
 await page.getByRole('button',{name:'Save sample'}).click();
 await expect(page.locator('tbody')).toContainText('Demo expense fixture');
 await expect(page.locator('.demo-insights')).toContainText('300');
});
