import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root = path.resolve(import.meta.dirname, '..');
const pagePath = name => path.join(root, name === 'admin' ? 'apps/administration/admin.html' : 'apps/website/'+name+'.html');
const pages = ['index','about','ministries','events','media','contact','admin'];
let count = 0;
for (const page of pages) {
  const html = fs.readFileSync(pagePath(page), 'utf8');
  assert.match(html, /<title>[^<]+<\/title>/i, page + ': missing title');
  assert.match(html, /name="viewport"/i, page + ': missing viewport');
  assert.match(html, /href="css\/refinement.css"/i, page + ': missing shared presentation styles');
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!/\bsrc\s*=/.test(match[1])) { new vm.Script(match[2], { filename: page + '.html inline script' }); count++; }
  }
}
for (const name of fs.readdirSync(path.join(root, 'packages/shared/js')).filter(n=>n.endsWith('.js'))) {
  new vm.Script(fs.readFileSync(path.join(root,'js',name),'utf8'), {filename:name}); count++;
}
assert.ok(fs.statSync(path.join(root,'packages/ui/css/refinement.css')).size > 0);
console.log('PASS: 7 pages and ' + count + ' scripts. Visual and functional release checks remain required.');

const admin = fs.readFileSync(pagePath('admin'),'utf8');
assert.equal([...admin.matchAll(/id="adminPageTitle"/g)].length,1,'admin must have one dynamic title');
assert.doesNotMatch(admin, /<h2>(Membership Management|Financial Management|Events Management|Ministry Management|Reports & Analytics|Settings)<\/h2>/, 'duplicate department heading');
assert.doesNotMatch(admin, /type="password"/, 'demo must not solicit passwords');
const events = fs.readFileSync(pagePath('events'),'utf8');
assert.doesNotMatch(events, /<\/i">/, 'malformed icon closing tag');
assert.match(events, /aria-label="Weekly service schedule"/);
const shared = fs.readFileSync(path.join(root,'packages/shared/js/main.js'),'utf8');
assert.doesNotMatch(shared, /Message sent successfully!/);
console.log('PASS: static regression checks for headings, demo credentials, events and delivery messaging.');

for (const name of pages.filter(x=>x!=='admin')) assert.doesNotMatch(fs.readFileSync(pagePath(name),'utf8'), /href=["'][^"']*admin\.html/i);
