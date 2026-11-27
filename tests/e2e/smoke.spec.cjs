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

test('about page presents church purpose and beliefs',async({page})=>{
 await page.goto('/about.html');
 await expect(page.locator('main h1')).toHaveText('About Gracehill Assembly');
 await expect(page.locator('.vision-card h3')).toHaveText('Our Vision');
 await expect(page.locator('.mission-card h3')).toHaveText('Our Mission');
 await expect(page.locator('.belief-item')).toHaveCount(6);
 await expect(page.locator('.timeline')).toHaveCount(0);
 await page.getByRole('link',{name:'Plan Your Visit'}).click();
 await expect(page).toHaveURL(/contact\.html$/);
});

test('ministries category navigation and participation',async({page})=>{
 await page.goto('/ministries.html');
 await expect(page.locator('main h1')).toHaveText('Our Ministries');
 await expect(page.getByRole('navigation',{name:'Ministry categories'}).locator('a')).toHaveCount(5);
 await expect(page.locator('.ministry-card')).toHaveCount(10);
 await expect(page.locator('.age-card')).toHaveCount(6);
 await expect(page.locator('main a[href="#"]')).toHaveCount(0);
 await page.getByRole('link',{name:'Ask About Serving'}).click();
 await expect(page).toHaveURL(/contact\.html$/);
});

test('programme filters distinguish past and future published events',async({page})=>{
 const record=(title,start,end,published=true)=>({title,start,end,published,description:'Test fixture'});
 await page.route('**/data/programmes.json',route=>route.fulfill({json:[record('Future fixture','2099-01-01T09:00:00Z','2099-01-01T11:00:00Z'),record('Past fixture','2000-01-01T09:00:00Z','2000-01-01T11:00:00Z'),record('Draft fixture','2099-01-01T09:00:00Z','2099-01-01T11:00:00Z',false)]}));
 await page.goto('/events.html');
 await expect(page.locator('#programme-list')).toContainText('Future fixture');
 await expect(page.locator('#programme-list article')).toHaveCount(1);
 await page.getByRole('button',{name:'Past',exact:true}).click();
 await expect(page.locator('#programme-list')).toContainText('Past fixture');
 await page.getByRole('button',{name:'All programmes'}).click();
 await expect(page.locator('#programme-list article')).toHaveCount(2);
 await expect(page.locator('#programme-list')).not.toContainText('Draft fixture');
});

test('media search and format filters exclude drafts and unsafe URLs',async({page})=>{
 const record=(title,format,published=true,url='https://example.com/resource')=>({title,format,published,url,description:'Test fixture'});
 await page.route('**/data/media-resources.json',route=>route.fulfill({json:[record('Prayer video','video'),record('Faith sermon','audio'),record('Draft fixture','audio',false),record('Unsafe fixture','audio',true,'javascript:alert(1)')]}));
 await page.goto('/media.html');
 await expect(page.locator('#media-library article')).toHaveCount(2);
 await page.getByRole('button',{name:'Sermons',exact:true}).click();
 await expect(page.locator('#media-library article')).toHaveCount(1);
 await expect(page.locator('#media-library')).toContainText('Faith sermon');
 await page.getByLabel('Search resources').fill('unmatched');
 await expect(page.locator('#media-library article')).toHaveCount(0);
 await expect(page.locator('#media-status')).toContainText('No published resources');
});
