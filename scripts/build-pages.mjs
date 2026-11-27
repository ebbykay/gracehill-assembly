import fs from 'node:fs';
import path from 'node:path';
const out = 'dist';
fs.mkdirSync(out,{recursive:true});
for (const name of ['index','about','ministries','events','media','contact']) {
  const source = fs.readFileSync('apps/website/'+name+'.html','utf8');
  if (/href=["']admin\.html/i.test(source)) throw new Error('Admin link in public site');
  fs.writeFileSync(path.join(out,name+'.html'),source);
}
fs.cpSync('packages/ui/css',path.join(out,'css'),{recursive:true});
fs.cpSync('packages/shared/js',path.join(out,'js'),{recursive:true});
fs.copyFileSync('gracehillassembly/church logo.png',path.join(out,'church logo.png'));
fs.writeFileSync(path.join(out,'.nojekyll'),'');
console.log('Public website assembled; admin and archive excluded.');
