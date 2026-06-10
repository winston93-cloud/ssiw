import { chromium } from 'playwright';

const outPath = '/home/mario/Proyectos/ssiw/public/guia/01-login.png';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1024, height: 575 },
  deviceScaleFactor: 1,
  colorScheme: 'dark',
});
const page = await context.newPage();

await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
await page.waitForSelector('#alumnoRef');
await page.fill('#alumnoRef', '12345');
await page.locator('#alumnoRef').blur();
await page.waitForTimeout(300);
await page.screenshot({ path: outPath, fullPage: false });
await context.close();
await browser.close();

console.log('Saved', outPath);
