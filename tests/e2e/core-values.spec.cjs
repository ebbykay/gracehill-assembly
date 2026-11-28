const {test,expect}=require('@playwright/test');
for(const path of ['/index.html','/about.html'])test('official church core values on '+path,async({page})=>{
 await page.goto('http://127.0.0.1:4173'+path);
 const values=page.locator('[data-core-values] h3');
 await expect(values).toHaveText(['Fellowship','Discipleship','Transformation']);
});
