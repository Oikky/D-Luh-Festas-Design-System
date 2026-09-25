/* `npm test`: sobe o emulador do Firestore, roda os testes e derruba o emulador.
   No Windows o `emulators:exec` deixa o Java do emulador vivo na porta 8080 — daí o passo final. */
const { spawnSync, execSync } = require("node:child_process");

const r = spawnSync('npx firebase emulators:exec --only firestore --project demo-dluh "npm --prefix worker test"',
  { stdio: "inherit", shell: true, cwd: `${__dirname}/..` });

if (process.platform === "win32") {
  try {
    const linhas = execSync("netstat -ano -p tcp", { encoding: "utf8" }).split("\n").filter(l => /:8080\s.*LISTENING/.test(l));
    for (const pid of new Set(linhas.map(l => l.trim().split(/\s+/).pop()))) execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
  } catch { /* nada escutando: tudo certo */ }
}
process.exit(r.status ?? 1);
