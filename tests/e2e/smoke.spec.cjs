const {test,expect}=require('@playwright/test');
const pages=['index','about','ministries','events','media','contact'];
for(const width of [320,768,1440]){
 for(const name of pages){
  test(name+' at '+width,async({page})=>{
   await page.setViewportSize({width,height:900});
   const errors=[];
   page.on('pageerror',err=>errors.push(err.message));
   await page.goto('/'+name+'.html');
   await expect(page.locator('h1')).toHaveCount(1);
   await expect(page.locator('h1')).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
   const theme=page.locator('#themeToggle');
   await expect(theme).toBeVisible();
   const before=await page.locator('html').getAttribute('data-theme');
   await theme.click();
   await expect(page.locator('html')).not.toHaveAttribute('data-theme',before);
   expect(errors).toEqual([]);
  });
 }
}
test('public navigation never includes admin',async({page})=>{
 await page.goto('/index.html');
 await expect(page.locator('a[href*="admin.html"]')).toHaveCount(0);
});

test('homepage visitor journey',async({page})=>{
 await page.goto('/index.html');
 await expect(page.locator('main h1')).toHaveText('Raising Kingdom Giants');
 await expect(page.locator('.hero').getByRole('link',{name:'Plan Your Visit'})).toHaveAttribute('href','contact.html');
 await expect(page.locator('.home-visit-panel')).toBeVisible();
 await expect(page.locator('.stats-container')).toHaveCount(0);
 await page.locator('.hero').getByRole('link',{name:'Plan Your Visit'}).click();
 await expect(page).toHaveURL(/contact\.html$/);
});
