import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
const stripModuleSyntax = (source) => source.replace(/^export /gm, "").replace(/^import .*?;\n/gm, "");
const [core, player, content] = await Promise.all([readFile("src/lib/core.js", "utf8"), readFile("src/lib/player.js", "utf8"), readFile("src/content.js", "utf8")]);
await Promise.all([cp("manifest.json", "dist/manifest.json"), writeFile("dist/content.js", [core, player, content].map(stripModuleSyntax).join("\n"))]);
