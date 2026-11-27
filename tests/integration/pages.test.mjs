import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const pages=['index','about','ministries','events','media','contact'];
test('public artifact contains only approved root entries',()=>{
 assert.deepEqual(fs.readdirSync('dist').sort(),[...pages.map(x=>x+'.html'),'.nojekyll','css','js','gracehill-logo.png'].sort());
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
