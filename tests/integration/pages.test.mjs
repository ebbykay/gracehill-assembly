import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const pages=['index','about','ministries','events','media','contact'];
test('public artifact contains only approved root entries',()=>{
 assert.deepEqual(fs.readdirSync('dist').sort(),[...pages.map(x=>x+'.html'),'.nojekyll','css','js','data','gracehill-logo.png'].sort());
});
test('public navigation and shared resources resolve',()=>{
 for(const p of pages){
 const html=fs.readFileSync('dist/'+p+'.html','utf8');
 for(const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)){
 const ref=match[1];
 if(/^(?:css\/|js\/|[a-z]+\.html$)/.test(ref)) assert.ok(fs.existsSync(path.join('dist',ref)),p+': '+ref);
 }
 assert.doesNotMatch(html,/href=["'][^"']*admin\.html/i);
 }
});
test('logo is not empty',()=>assert.ok(fs.statSync('dist/gracehill-logo.png').size>0));

test('shared layout renders exactly once and marks current page',()=>{
 for(const name of pages){
 const html=fs.readFileSync('dist/'+name+'.html','utf8');
 assert.equal([...html.matchAll(/<header\b/g)].length,1);
 assert.equal([...html.matchAll(/<footer\b/g)].length,1);
 assert.match(html,new RegExp('href="'+name+'\\.html" class="active" aria-current="page"'));
 assert.doesNotMatch(html,/<!-- SITE_(HEADER|FOOTER) -->/);
 }
});

test('programme data exposes published records only',()=>{const records=JSON.parse(fs.readFileSync('dist/data/programmes.json','utf8'));assert.ok(Array.isArray(records));for(const r of records){assert.equal(r.published,true);assert.deepEqual(Object.keys(r).sort(),['description','end','published','start','title']);}});

test('media data exports published allowlisted records',()=>{const records=JSON.parse(fs.readFileSync('dist/data/media-resources.json','utf8'));assert.ok(Array.isArray(records));for(const r of records){assert.equal(r.published,true);assert.deepEqual(Object.keys(r).sort(),['description','format','published','title','url']);}});
