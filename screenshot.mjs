import puppeteer from 'puppeteer';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, 'temporary screenshots');

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// Find next available screenshot number
function nextIndex() {
  const files = existsSync(outDir) ? readdirSync(outDir) : [];
  const nums = files
    .map(f => parseInt(f.match(/^screenshot-(\d+)/)?.[1] ?? '0', 10))
    .filter(n => !isNaN(n));
  return nums.length ? Math.max(...nums) + 1 : 1;
}

const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] ? `-${process.argv[3]}` : '';
const idx   = nextIndex();
const file  = join(outDir, `screenshot-${idx}${label}.png`);

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 800)); // let fonts/animations settle
await page.screenshot({ path: file, fullPage: true });
await browser.close();

console.log(`Saved: ${file}`);
