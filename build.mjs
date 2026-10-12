// Builds dist/: inlines minified CSS into each page and fingerprints script.js for long-term caching.
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import CleanCSS from 'clean-css';
import { minify } from 'terser';

const out = 'dist';
rmSync(out, { recursive: true, force: true });
mkdirSync(out);

for (const entry of ['icons', 'images', 'vendor', 'robots.txt', 'sitemap.xml', 'stylesheet.xsl', 'ads.txt', 'ethnic-makeup-seo-image.jpg']) {
  cpSync(entry, `${out}/${entry}`, { recursive: true });
}

const css = new CleanCSS({ level: 2 }).minify(readFileSync('styles.css', 'utf8'));
if (css.errors.length) throw new Error(css.errors.join('\n'));

const js = (await minify(readFileSync('script.js', 'utf8'), { compress: true, mangle: true })).code;
const jsName = `script.${createHash('sha256').update(js).digest('hex').slice(0, 10)}.js`;
writeFileSync(`${out}/${jsName}`, js);

const sw = (await minify(readFileSync('service-worker.js', 'utf8'))).code;
writeFileSync(`${out}/service-worker.js`, sw);

for (const page of ['index.html', 'services.html']) {
  const html = readFileSync(page, 'utf8')
    .replace('<link rel="stylesheet" href="styles.css" />', () => `<style>${css.styles}</style>`)
    .replace('src="script.js"', `src="/${jsName}"`);
  if (!html.includes('<style>') || !html.includes(jsName)) throw new Error(`${page}: asset placeholders not found`);
  writeFileSync(`${out}/${page}`, html);
}

console.log(`built ${out}/ (css ${css.styles.length}B inline, ${jsName} ${js.length}B)`);
