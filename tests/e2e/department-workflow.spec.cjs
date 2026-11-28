const {test,expect}=require('@playwright/test');
const origin='http://127.0.0.1:4174';
test('media workflow transitions update shared records',async({page})=>{
 await page.goto(origin+'/#media');
 const panel=page.locator('.demo-operations');
 await panel.getByRole('button',{name:'Submit media for review'}).click();
 await expect(panel.locator('.workflow-history')).toContainText('Draft → Review');
 await expect(page.locator('tbody tr').filter({hasText:'Demo sermon'})).toContainText('Review');
});
test('ministry assignment and removal work in the visible roster',async({page})=>{
 await page.goto(origin+'/#ministry');
 await page.getByLabel('Sample responsibility').fill('Demo coordinator');
 await page.getByRole('button',{name:'Assign sample member'}).click();
 await expect(page.locator('.roster-person')).toContainText('Demo coordinator');
 await page.getByRole('button',{name:'Remove sample assignment'}).click();
 await expect(page.locator('.roster-person')).toHaveCount(0);
});
test('care and communication transitions update the worklists without delivery',async({page})=>{
 await page.goto(origin+'/#care');
 const panel=page.locator('.demo-operations');
 await panel.getByRole('button',{name:'Schedule follow-up'}).click();
 await expect(panel.locator('.workflow-history')).toContainText('Open → Scheduled');
 await page.goto(origin+'/#communications');
 await panel.getByRole('button',{name:'Submit announcement for review'}).click();
 await panel.getByRole('button',{name:'Approve sample schedule'}).click();
 await expect(panel).toContainText('no message is transmitted');
 await expect(panel.locator('.workflow-history')).toContainText('Review → Scheduled');
});
