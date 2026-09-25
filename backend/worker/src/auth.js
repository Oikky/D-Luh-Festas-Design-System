/* Dois lados do login:
   - quem chama o Worker manda o ID token do Firebase (login Google da tela); aqui ele é conferido
     com as chaves públicas do Google;
   - o próprio Worker entra no Firebase como a conta "sistema" (e-mail/senha) para gravar — as
     regras só deixam essa conta escrever. */
import { createRemoteJWKSet, jwtVerify } from "jose";

// Cache das chaves públicas do Google entre requisições (o jose respeita a validade delas).
const CHAVES = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));

export async function verificarToken(idToken, projectId) {
  const { payload } = await jwtVerify(idToken, CHAVES, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    algorithms: ["RS256"]
  });
  if (!payload.sub) throw new Error("token sem usuário");
  return payload; // email, email_verified, sub…
}

/* O ID token do sistema vale 1 h; guardamos entre requisições e renovamos 5 min antes de vencer.
   É um cache de credencial do Worker, não estado de nenhuma requisição. */
let tokenSistema = null;

export async function tokenDoSistema(env, fetchFn = fetch) {
  if (tokenSistema && tokenSistema.expira > Date.now() + 5 * 60_000) return tokenSistema.valor;
  const res = await fetchFn(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${env.FIREBASE_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: env.SISTEMA_EMAIL, password: env.SISTEMA_SENHA, returnSecureToken: true })
  });
  const r = await res.json();
  if (!res.ok) throw new Error(`Login do sistema falhou: ${r?.error?.message || res.status}`);
  tokenSistema = { valor: r.idToken, expira: Date.now() + Number(r.expiresIn) * 1000 };
  return tokenSistema.valor;
}

/* Para diagnóstico: o que as regras do Firestore enxergam da conta sistema (nunca o token em si). */
export function quemESistema() {
  if (!tokenSistema) return null;
  try {
    const p = JSON.parse(atob(tokenSistema.valor.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return { email: p.email, provedor: p.firebase?.sign_in_provider, aud: p.aud };
  } catch { return null; }
}
