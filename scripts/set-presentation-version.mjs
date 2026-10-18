import{readFileSync,writeFileSync,existsSync}from'node:fs';import{resolve}from'node:path';
const v=process.argv[2];if(!/^v[0-9]+$/.test(v||''))throw Error('Usage: node scripts/set-presentation-version.mjs v1|v2');
const root=resolve('presentations/ai-curiosity'),file=resolve(root,'versions',v,'index.html');if(!existsSync(file))throw Error('Unknown archived version');
const meta=JSON.parse(readFileSync(resolve(root,'versions.json'),'utf8'));if(!meta.versions.some(x=>x.id===v))throw Error('Version missing from registry');meta.current=v;
writeFileSync(resolve(root,'versions.json'),JSON.stringify(meta,null,2)+'\n');
writeFileSync(resolve(root,'index.html'),`<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>발표 ${v}</title><script>location.replace('versions/${v}/'+location.search+location.hash)</script><p><a href="versions/${v}/">${v} 발표 열기</a> · <a href="versions/">버전 기록</a></p></html>`);
console.log('Default presentation: '+v+'. Archived files remain unchanged. Commit and publish these two changed files.');
