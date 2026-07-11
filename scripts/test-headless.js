const fs = require('fs');

(async () => {
  const { default: puppeteer } = await import('puppeteer');
  const url = process.env.URL || 'http://localhost:8080/produto/1';
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setViewport({ width: 1200, height: 900 });

  // forward console and page errors
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', (err) => console.error('PAGE ERROR:', err));

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // wait for app to mount and elements to appear
    await page.waitForSelector('.viewer-canvas', { timeout: 60000 });
    await page.waitForSelector('.colors-grid button', { timeout: 60000 });
    await page.waitForSelector('.sizes-grid button', { timeout: 60000 });

    // screenshot before
    await page.screenshot({ path: 'test-before.png', fullPage: false });

    // click first color
    const firstColor = await page.$('.colors-grid button');
    await firstColor.click();
    await sleep(600);

    // click a size (e.g., 40) if exists, otherwise first
    const sizeButtons = await page.$$('.sizes-grid button');
    let targetSizeButton = null;
    for (const b of sizeButtons) {
      const txt = await page.evaluate((el) => el.textContent.trim(), b);
      if (txt === '40') { targetSizeButton = b; break; }
    }
    if (!targetSizeButton) targetSizeButton = sizeButtons[0];
    await targetSizeButton.click();
    await sleep(800);

    // screenshot after
    await page.screenshot({ path: 'test-after.png', fullPage: false });

    // verify active classes
    const activeColor = await page.$eval('.colors-grid button.active', (el) => !!el).catch(() => false);
    const activeSize = await page.$eval('.sizes-grid button.active', (el) => el.textContent.trim()).catch(() => null);

    console.log('activeColorPresent:', activeColor);
    console.log('activeSizeLabel:', activeSize);

    if (!activeColor) throw new Error('Nenhuma cor marcada como ativa');
    if (!activeSize) throw new Error('Nenhum tamanho marcado como ativo');

    console.log('Teste headless concluído com sucesso. Capturas: test-before.png, test-after.png');
  } catch (err) {
    console.error('Erro no teste headless:', err);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
