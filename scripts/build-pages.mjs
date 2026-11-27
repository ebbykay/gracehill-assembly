import fs from 'node:fs';
import path from 'node:path';
const out = 'dist';
fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});
const header = fs.readFileSync('packages/ui/components/site-header.html','utf8').trim();
const footer = fs.readFileSync('packages/ui/components/site-footer.html','utf8').trim();
for (const name of ['index','about','ministries','events','media','contact']) {
  let source = fs.readFileSync('apps/website/'+name+'.html','utf8');
  if (!source.includes('<!-- SITE_HEADER -->') || !source.includes('<!-- SITE_FOOTER -->')) throw new Error('Missing layout slots: '+name);
  const activeHeader = header.replace('href="'+name+'.html">'+({index:'Home',about:'About',ministries:'Ministries',events:'Events',media:'Media',contact:'Contact'}[name])+'</a>', 'href="'+name+'.html" class="active" aria-current="page">'+({index:'Home',about:'About',ministries:'Ministries',events:'Events',media:'Media',contact:'Contact'}[name])+'</a>');
  source = source.replace('<!-- SITE_HEADER -->',activeHeader).replace('<!-- SITE_FOOTER -->',footer);
  if (/href=["']admin\.html/i.test(source)) throw new Error('Admin link in public site');
  fs.writeFileSync(path.join(out,name+'.html'),source);
}
fs.cpSync('packages/ui/css',path.join(out,'css'),{recursive:true});
fs.cpSync('packages/shared/js',path.join(out,'js'),{recursive:true});
fs.copyFileSync('assets/branding/gracehill-logo.png',path.join(out,'gracehill-logo.png'));
fs.mkdirSync(path.join(out,'data'),{recursive:true});
const programmes=JSON.parse(fs.readFileSync('apps/website/data/programmes.json','utf8'));
if(!Array.isArray(programmes)) throw new Error('Invalid programme data');
fs.writeFileSync(path.join(out,'data/programmes.json'),JSON.stringify(programmes.filter(e=>e.published===true).map(({title,description,start,end})=>({title,description,start,end,published:true}))));
fs.writeFileSync(path.join(out,'.nojekyll'),'');
console.log('Public website assembled; admin and archive excluded.');
