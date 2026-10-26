import { readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";

// Preserve shared URLs when a release number is corrected.
export function writeVersionAliases(outputRoot, manifest, publicRoot = "/") {
  const files = (dir, prefix = "") => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const relative = join(prefix, entry.name);
    return entry.isDirectory() ? files(join(dir, entry.name), relative) : [relative];
  });
  for (const [alias, target] of Object.entries(manifest.aliases ?? {})) {
    if (!/^v\d+$/.test(alias) || !/^v\d+$/.test(target) || manifest.versions.some(v => v.id === alias) || !manifest.versions.some(v => v.id === target)) throw new Error("Invalid version alias");
    const aliasBase = `${publicRoot}versions/${alias}/`;
    const targetBase = `${publicRoot}versions/${target}/`;
    for (const relative of files(join(outputRoot, "versions", target)).filter(path => /(^|\/)index\.html$/.test(path))) {
      const fallback = targetBase + relative.replace(/index\.html$/, "");
      const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Defense Astra ${target}</title><script>const oldBase=${JSON.stringify(aliasBase)},newBase=${JSON.stringify(targetBase)};let suffix=location.pathname.startsWith(oldBase)?location.pathname.slice(oldBase.length):'';suffix=suffix.replace(/index\\.html$/,'');location.replace(newBase+suffix+location.search+location.hash)</script><a href="${fallback}">사이트 열기</a></html>`;
      const destination = join(outputRoot, "versions", alias, relative);
      mkdirSync(dirname(destination), { recursive: true });
      writeFileSync(destination, html);
    }
  }
}
