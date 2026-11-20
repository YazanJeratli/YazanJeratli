// Exporte la carte de parrainage :
//   carte-parrainage-impression.pdf : recto + verso, 91 × 61 mm (fond perdu de 3 mm), pour l’imprimeur
//   carte-parrainage-recto.png / -verso.png : 85 × 55 mm (format fini), à envoyer sur WhatsApp
// Lancer : node carte-parrainage/rendu.cjs
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const dossier = __dirname;
  const url = 'file://' + path.join(dossier, 'carte.html');
  const browser = await chromium.launch();

  const page = await browser.newPage({ deviceScaleFactor: 4, viewport: { width: 520, height: 600 } });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  for (const face of ['recto', 'verso']) {
    const box = await page.locator(`#${face}`).boundingBox();
    // format fini : on retire les 3 mm de fond perdu (3 mm = 11,34 px CSS)
    const fond = (3 / 25.4) * 96;
    await page.screenshot({
      path: path.join(dossier, `carte-parrainage-${face}.png`),
      clip: { x: box.x + fond, y: box.y + fond, width: box.width - 2 * fond, height: box.height - 2 * fond }
    });
  }

  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: path.join(dossier, 'carte-parrainage-impression.pdf'),
    width: '91mm',
    height: '61mm',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();
  console.log('ok');
})();
