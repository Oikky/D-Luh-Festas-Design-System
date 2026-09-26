/* Autoriza o Worker a usar o Google Drive e a Agenda da conta da loja — roda uma vez só.
     node scripts/google-autorizar.js <CLIENT_ID> <CLIENT_SECRET>
   Abre o login do Google, recebe a autorização em http://localhost:5555, cria a pasta
   "D'Luh Sistema" no Drive e imprime o refresh token e o ID da pasta para colocar no Worker.
   O cliente OAuth (Google Cloud → APIs e serviços → Credenciais) é do tipo "App para computador". */
const http = require("node:http");
const { exec } = require("node:child_process");

const [clientId, clientSecret] = process.argv.slice(2);
if (!clientId || !clientSecret) {
  console.error("Uso: node scripts/google-autorizar.js <CLIENT_ID> <CLIENT_SECRET>");
  process.exit(1);
}
const REDIRECT = "http://localhost:5555";
const ESCOPOS = ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/calendar.events"];

const url = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
  client_id: clientId, redirect_uri: REDIRECT, response_type: "code",
  scope: ESCOPOS.join(" "), access_type: "offline", prompt: "consent"
});

const servidor = http.createServer(async (req, res) => {
  const code = new URL(req.url, REDIRECT).searchParams.get("code");
  if (!code) { res.end("Sem código."); return; }
  res.end("Pronto! Pode fechar esta aba e voltar ao terminal.");
  servidor.close();

  const token = await (await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: REDIRECT, grant_type: "authorization_code" })
  })).json();
  if (!token.refresh_token) { console.error("O Google não devolveu refresh token:", token); process.exit(1); }

  // Com o escopo drive.file o Worker só enxerga o que ele mesmo criou; por isso a pasta nasce aqui.
  const pasta = await (await fetch("https://www.googleapis.com/drive/v3/files?fields=id", {
    method: "POST",
    headers: { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: "D'Luh Sistema", mimeType: "application/vnd.google-apps.folder" })
  })).json();

  console.log("\nNa pasta backend/worker, rode e cole cada valor quando pedir:");
  console.log("  npx wrangler secret put GOOGLE_CLIENT_ID      →", clientId);
  console.log("  npx wrangler secret put GOOGLE_CLIENT_SECRET  → (o client secret que você passou)");
  console.log("  npx wrangler secret put GOOGLE_REFRESH_TOKEN  →", token.refresh_token);
  console.log(`\nE em wrangler.jsonc: "GOOGLE_DRIVE_PASTA": "${pasta.id}"  — depois npx wrangler deploy.`);
});

servidor.listen(5555, () => {
  console.log("Abrindo o login do Google… Se não abrir, copie este link no navegador:\n" + url);
  exec(`${process.platform === "win32" ? "start \"\"" : process.platform === "darwin" ? "open" : "xdg-open"} "${url}"`);
});
