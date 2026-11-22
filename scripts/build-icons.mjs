// Extracts only the icons referenced in src/lib/constants/icons.ts (plus any raw
// "lucide:*" strings in src/) from @iconify-json/lucide into an offline subset.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const full = JSON.parse(readFileSync('node_modules/@iconify-json/lucide/icons.json', 'utf8'));
const names = new Set();

function walk(dir) {
	for (const f of readdirSync(dir)) {
		const p = join(dir, f);
		if (statSync(p).isDirectory()) walk(p);
		else if (/\.(ts|svelte)$/.test(f)) {
			for (const m of readFileSync(p, 'utf8').matchAll(/lucide:([a-z0-9-]+)/g)) names.add(m[1]);
		}
	}
}
walk('src');

const icons = {};
const aliases = {};
for (const n of names) {
	if (full.icons[n]) icons[n] = full.icons[n];
	else if (full.aliases?.[n]) {
		aliases[n] = full.aliases[n];
		const parent = full.aliases[n].parent;
		icons[parent] = full.icons[parent];
	} else console.warn(`Unknown lucide icon: ${n}`);
}

const subset = { prefix: 'lucide', width: full.width ?? 24, height: full.height ?? 24, icons, aliases };
writeFileSync('src/lib/constants/icon-set.json', JSON.stringify(subset));
console.log(`icon-set.json: ${Object.keys(icons).length} icons`);
