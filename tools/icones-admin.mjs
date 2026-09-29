/* Gera os ícones do app do admin (a marca D com "admin" embaixo) a partir de site/img/d-dluh.svg.
   Saída em ui_kits/admin/icones/: d.svg, favicon-32.png, apple-touch-icon.png (180),
   icone-192.png, icone-512.png e icone-maskable-512.png (desenho dentro da zona segura).
   Uso:  node tools/icones-admin.mjs   (precisa do pacote playwright e do Google Chrome instalado) */
import { chromium } from "playwright";
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = process.env.RAIZ || join(dirname(fileURLToPath(import.meta.url)), "..");
const SAIDA = join(RAIZ, "ui_kits/admin/icones");
mkdirSync(SAIDA, { recursive: true });
copyFileSync(join(RAIZ, "site/img/d-dluh.svg"), join(SAIDA, "d.svg"));
const d = "data:image/svg+xml;base64," + readFileSync(join(SAIDA, "d.svg")).toString("base64");

/* Fundo noite do admin, D dourado, "admin" no dourado claro do próprio D.
   `zona` é a fração do lado ocupada pelo desenho: 0.62 cabe no círculo seguro do maskable. */
const pagina = (lado, zona, raio, comTexto) => `<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@700&display=block" rel="stylesheet">
<style>
  html,body{margin:0;background:transparent}
  .i{width:${lado}px;height:${lado}px;border-radius:${raio * lado}px;background:#101018;display:flex;flex-direction:column;align-items:center;justify-content:center}
  .i img{width:${zona * lado}px;display:block}
  .i span{font:700 ${0.135 * zona * lado}px/1 Urbanist,sans-serif;letter-spacing:.14em;color:#e2c47a;margin-top:${0.06 * zona * lado}px;padding-left:.14em}
</style></head><body><div class="i"><img src="${d}">${comTexto ? "<span>admin</span>" : ""}</div></body></html>`;

const ICONES = [
  ["icone-512.png", 512, 0.72, 0.22, true],
  ["icone-192.png", 192, 0.72, 0.22, true],
  ["icone-maskable-512.png", 512, 0.56, 0, true],
  ["apple-touch-icon.png", 180, 0.66, 0, true],
  ["favicon-32.png", 32, 0.86, 0.22, false]
];

const nav = await chromium.launch({ channel: "chrome" }); // o Chrome instalado; sem baixar navegador
const aba = await nav.newPage();
for (const [nome, lado, zona, raio, comTexto] of ICONES) {
  await aba.setViewportSize({ width: lado, height: lado });
  await aba.setContent(pagina(lado, zona, raio, comTexto), { waitUntil: "networkidle" });
  await aba.evaluate(() => document.fonts.ready);
  await aba.locator(".i").screenshot({ path: join(SAIDA, nome), omitBackground: true });
  console.log("ok", nome);
}
await nav.close();
