import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const release = JSON.parse(readFileSync("releases.json", "utf8"));
if (release.current !== release.baseline || !/^v\d+$/.test(release.current)) throw new Error("Approve the current release before publishing");
if (release.versions.length > release.retention) throw new Error("Too many retained versions");
const root = process.env.SITE_PUBLIC_BASE ?? "/";
const base = `${root}versions/${release.current}/`;
const output = `dist-public/versions/${release.current}`;
rmSync("dist-public", { recursive: true, force: true });
for (const args of [["node_modules/typescript/bin/tsc", "-b"], ["node_modules/vite/bin/vite.js", "build", "--outDir", output, "--emptyOutDir"]]) {
  const result = spawnSync(process.execPath, args, { stdio: "inherit", env: { ...process.env, SITE_VERSION_BASE: base } });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
function files(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(join(dir,e.name)) : [join(dir,e.name)]); }
for (const version of release.versions) {
  if (!/^v\d+$/.test(version.id)) throw new Error("Invalid version");
  const dir = `dist-public/versions/${version.id}`;
  const versionBase = `${root}versions/${version.id}/`;
  if (version.id !== release.current) {
    const archive = `version-archive/${version.id}`;
    const checks = JSON.parse(readFileSync(`${archive}.json`, "utf8"));
    for (const [path, expected] of Object.entries(checks.files)) {
      if (createHash("sha256").update(readFileSync(join(archive,path))).digest("hex") !== expected) throw new Error(`Snapshot changed: ${version.id}/${path}`);
    }
    cpSync(archive,dir,{recursive:true});
    // Published snapshots already contain their routes and version banner.
    if (checks.publicBase === versionBase) continue;
    for (const path of files(dir).filter(p=>/\.(html|js|css)$/.test(p))) {
      let text = readFileSync(path,"utf8");
      // Archive bundles use a private-site base. Only adapt their known base prefix.
      text = text.replaceAll(`/versions/${version.id}/`,versionBase).replaceAll(`"/versions/${version.id}"`,`"${versionBase.slice(0,-1)}"`);
      writeFileSync(path,text);
    }
  }
  let html = readFileSync(join(dir,"index.html"),"utf8");
  if (!html.includes(`${versionBase}assets/`)) throw new Error(`Wrong asset base: ${version.id}`);
  html = html.replace("<body>",`<body><script>if(location.pathname.endsWith('/')&&location.pathname!==${JSON.stringify(versionBase)}){history.replaceState(null,'',location.pathname.slice(0,-1)+location.search+location.hash)}</script><nav style="padding:10px 20px;background:#10283d;color:white;font:14px system-ui"><strong>${version.id}</strong></nav>`);
  writeFileSync(join(dir,"index.html"),html);
  const equipment = JSON.parse(readFileSync(join(dir,"data/equipment.json"),"utf8"));
  for (const route of ["insights","sources","equipment","compare","development","technologies","cases",...(version.id === release.current ? ["feedback"] : []),...equipment.map(e=>`equipment/${e.id}`)]) {
    mkdirSync(join(dir,route),{recursive:true});writeFileSync(join(dir,route,"index.html"),html);
  }
}
const redirect = `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>세계 장비 검색</title><script>const root=${JSON.stringify(root)},base=${JSON.stringify(base)};const suffix=location.pathname.startsWith(root)?location.pathname.slice(root.length):'';if(!suffix.startsWith('versions/'))location.replace(base+(suffix==='index.html'?'':suffix)+location.search+location.hash);</script><p>세계 장비 검색 ${release.current}</p><a href="${base}">사이트 열기</a></html>`;
writeFileSync("dist-public/index.html",redirect);writeFileSync("dist-public/404.html",redirect);writeFileSync("dist-public/.nojekyll","");
writeFileSync("dist-public/versions/index.html",`<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>세계 장비 검색</title><script>location.replace(${JSON.stringify(base)}+location.search+location.hash)</script><a href="${base}">사이트 열기</a></html>`);
writeFileSync("dist-public/releases.json",JSON.stringify(release,null,2));
cpSync("presentations", "dist-public/presentations", { recursive: true });
console.log(`Public versions ready: ${release.versions.map(v=>v.id).join(', ')}`);
