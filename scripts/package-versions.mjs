import { readFileSync, writeFileSync, readdirSync, mkdirSync, renameSync, cpSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { writeVersionAliases } from "./version-aliases.mjs";

const manifest = JSON.parse(readFileSync("releases.json", "utf8"));
const versions = manifest.versions;
if (versions.length > manifest.retention || new Set(versions.map(v => v.id)).size !== versions.length) throw new Error("Version retention/identity mismatch");
if (!versions.some(v => v.id === manifest.baseline) || !versions.some(v => v.id === manifest.current)) throw new Error("Missing baseline or current version");
for (const v of versions) if (!/^v\d+$/.test(v.id)) throw new Error("Invalid version path");
const current = join("dist", "versions", manifest.current);
if (existsSync("dist/versions")) throw new Error("Run a fresh build before packaging versions");
const files = readdirSync("dist");
mkdirSync(current, { recursive: true });
for (const f of files) renameSync(join("dist", f), join(current, f));
for (const v of versions.filter(v => v.id !== manifest.current)) {
  const archive = JSON.parse(readFileSync(`version-archive/${v.id}.json`, "utf8"));
  for (const [path, expected] of Object.entries(archive.files)) {
    const actual = createHash("sha256").update(readFileSync(join("version-archive", v.id, path))).digest("hex");
    if (actual !== expected) throw new Error(`Historical snapshot changed: ${v.id}/${path}`);
  }
  cpSync(join("version-archive", v.id), join("dist", "versions", v.id), { recursive: true });
}
const escape = s => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
for (const v of versions) {
  const dir = join("dist", "versions", v.id);
  if (v.id !== manifest.current) {
    const snapshot = JSON.parse(readFileSync(`version-archive/${v.id}.json`, "utf8"));
    if (snapshot.publicBase === `/versions/${v.id}/`) continue;
  }
  let html = readFileSync(join(dir, "index.html"), "utf8");
  if (!html.includes(`/versions/${v.id}/assets/`)) throw new Error(`Wrong asset base for ${v.id}`);
  html = html.replace("<body>", `<body><script>if(location.pathname.endsWith('/')&&!/^\\/versions\\/v[0-9]+\\/$/.test(location.pathname)){history.replaceState(null,'',location.pathname.slice(0,-1)+location.search+location.hash)}</script><nav style="padding:10px 20px;background:#10283d;color:white;font:14px system-ui;display:flex;justify-content:space-between;gap:16px"><span>${escape(v.id)} · ${escape(v.title)} · ${escape(v.status)}</span></nav>`);
  writeFileSync(join(dir, "index.html"), html);
  const equipment = JSON.parse(readFileSync(join(dir, "data/equipment.json"), "utf8"));
  for (const route of ["insights", "sources", "equipment", "compare", "development", "technologies", "cases", ...(v.id === manifest.current ? ["feedback", "evidence", "options", "changes", "interiors"] : []), ...equipment.map(e => `equipment/${e.id}`)]) {
    mkdirSync(join(dir, route), { recursive: true });
    writeFileSync(join(dir, route, "index.html"), html);
  }
}
writeVersionAliases("dist", manifest);
writeFileSync("dist/releases.json", JSON.stringify(manifest, null, 2));
const landing = `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>세계 장비 검색</title><script>location.replace('/versions/${manifest.current}/'+location.search+location.hash)</script><a href="/versions/${manifest.current}/">사이트 열기</a></html>`;
writeFileSync("dist/index.html", landing);
writeFileSync("dist/versions/index.html", landing);
writeFileSync("dist/404.html", landing);
console.log(`Packaged ${versions.length} isolated versions; baseline=${manifest.baseline}, review=${manifest.current}`);
