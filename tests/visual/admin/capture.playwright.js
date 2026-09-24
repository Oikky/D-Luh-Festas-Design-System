// Golden capture for ui_kits/admin. Run with the Playwright MCP `browser_run_code` tool
// while `python -m http.server 8765 --bind 127.0.0.1` serves the repo root. See README.md.
async (page) => {
  const OUT = "C:/Users/ikkys/Downloads/D'Luh Festas Design System/tests/visual/admin/";
  const URL = 'http://127.0.0.1:8765/ui_kits/admin/index.html';
  await page.addInitScript(() => {
    const st = window.setTimeout, si = window.setInterval;
    window.setTimeout = (f, d, ...a) => d === 2500 ? 0 : st(f, d, ...a);
    window.setInterval = (f, d, ...a) => d === 14000 ? 0 : si(f, d, ...a);
  });
  const BP = { desktop: [1280, 820], mobile: [390, 844] };
  const settle = (ms = 450) => page.waitForTimeout(ms);
  let bpNow;
  async function fresh(theme, bp) {
    await page.setViewportSize({ width: 1280, height: 820 });
    await page.goto(URL);
    await page.waitForFunction(() => document.querySelector('#root nav svg'));
    await page.evaluate(() => document.fonts.ready);
    if (theme === 'light') {
      await page.locator('nav').getByRole('button', { name: /^Configurações/ }).click();
      await page.getByRole('button', { name: /^Claro/ }).click();
      await page.getByRole('button', { name: 'Fechar', exact: true }).click();
    }
    await page.mouse.move(900, 500);
    const [w, h] = BP[bp];
    await page.setViewportSize({ width: w, height: h });
    await settle(600);
  }
  async function go(name) {
    await page.locator('nav').getByRole('button', { name: new RegExp('^' + name) }).first().click();
    await page.mouse.move(bpNow === 'desktop' ? 900 : 200, 500);
    await settle();
  }
  const done = [];
  const shot = async n => { await page.screenshot({ path: OUT + n + '.png' }); done.push(n); };
  for (const theme of ['light', 'dark']) {
    for (const bp of ['desktop', 'mobile']) {
      bpNow = bp;
      const p = `${bp}-${theme}-`;
      await fresh(theme, bp);
      for (const [id, name] of [['01-visao', 'Visão geral'], ['02-pedidos', 'Pedidos'], ['03-agenda', 'Agenda'], ['04-cozinha', 'Cozinha'], ['05-financeiro', 'Financeiro']]) {
        await go(name); await shot(p + id);
      }
      await page.getByRole('tab', { name: /^Contratos/ }).click(); await settle();
      await shot(p + '06-contratos');
      await page.getByRole('button', { name: 'Continuar' }).first().click(); await settle();
      if (bp === 'mobile') { await page.getByRole('button', { name: /Ver prévia/ }).click(); await settle(); }
      await shot(p + '06b-contratos-previa');
      const s = page.getByPlaceholder('Pesquise aqui qualquer coisa');
      await s.click(); await s.fill('maria'); await settle();
      await shot(p + '07-busca');
      await s.fill('xyzabc'); await settle();
      await shot(p + '07b-busca-vazia');
      await s.fill(''); await page.mouse.click(bp === 'desktop' ? 900 : 200, 600); await settle();
      await (bp === 'desktop' ? page.locator('nav').getByRole('button', { name: /^Notificações/ }) : page.getByRole('button', { name: 'Notificações' })).first().click();
      await page.mouse.move(900, 500); await settle();
      await shot(p + '08-notificacoes');
      await fresh(theme, bp);
      if (bp === 'desktop') {
        await page.locator('nav').getByRole('button', { name: /^Configurações/ }).click(); await page.mouse.move(900, 500); await settle();
        await shot(p + '09-configuracoes');
        await fresh(theme, bp);
      }
      await go('Pedidos');
      await page.getByRole('button', { name: 'Mais ações' }).first().click(); await settle();
      await shot(p + '10-pedidos-menu');
      await page.getByRole('menuitem', { name: 'Apagar pedido' }).click(); await settle();
      await shot(p + '11-pedidos-apagar');
      await page.getByRole('button', { name: 'Cancelar' }).click(); await settle();
      await page.getByRole('button', { name: 'Detalhes' }).first().click(); await settle();
      await shot(p + '12-pedidos-detalhes');
      await page.getByRole('button', { name: /^Pagamentos/ }).click(); await settle();
      await shot(p + '13-pedidos-pagamentos');
      if (bp === 'desktop') {
        await fresh(theme, bp); await go('Pedidos');
        await page.getByRole('button', { name: 'Pedido manual' }).click(); await settle();
        await shot(p + '14-pedidos-manual');
      }
      await fresh(theme, bp); await go('Cozinha');
      await page.getByRole('button', { name: 'Feito' }).first().click(); await settle();
      await shot(p + '15-cozinha-confirmar');
    }
  }
  return done.length + ' shots';
}
