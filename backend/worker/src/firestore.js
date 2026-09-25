/* Firestore pela API REST, com a mesma forma de uso do SDK de servidor (doc/collection/
   runTransaction/get/create/update/set) — é o que o Worker tem sem uma conta de serviço.
   Só cobre o que o sistema usa: campos de primeiro nível para serverTimestamp, sem consultas.

   Transações são "otimistas", como no SDK do navegador: em produção o Firestore recusa
   :beginTransaction para login de usuário (só conta de serviço pode). Então lemos normalmente,
   guardamos a versão (updateTime) de cada documento lido, e gravamos tudo num só :commit com a
   condição "só se ainda estiver nessa versão". Se alguém mudou no meio, o commit falha e a função
   roda de novo com os dados novos. */

const SERVER_TIMESTAMP = Symbol("serverTimestamp");
export const FieldValue = { serverTimestamp: () => SERVER_TIMESTAMP };

export class ErroFirestore extends Error {
  constructor(status, corpo) { super(`Firestore ${status}: ${corpo?.error?.message || ""}`); this.status = status; this.corpo = corpo; }
}

// ── Conversão de valores JS ⇄ Firestore ──
function codificar(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(codificar) } };
  return { mapValue: { fields: campos(v) } };
}
function campos(obj) {
  const f = {};
  for (const [k, v] of Object.entries(obj)) if (v !== SERVER_TIMESTAMP && v !== undefined) f[k] = codificar(v);
  return f;
}
function decodificar(v) {
  if ("nullValue" in v) return null;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("stringValue" in v) return v.stringValue;
  if ("timestampValue" in v) return new Date(v.timestampValue);
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(decodificar);
  if ("mapValue" in v) return lerCampos(v.mapValue.fields || {});
  return null;
}
function lerCampos(f) {
  return Object.fromEntries(Object.entries(f).map(([k, v]) => [k, decodificar(v)]));
}
const carimbos = dados => Object.keys(dados).filter(k => dados[k] === SERVER_TIMESTAMP)
  .map(fieldPath => ({ fieldPath, setToServerValue: "REQUEST_TIME" }));

function idAleatorio() {
  const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return Array.from(bytes, b => abc[b % abc.length]).join("");
}

// ── Referências e snapshots ──
class Doc {
  constructor(db, path) { this.db = db; this.path = path; this.id = path.split("/").pop(); }
  collection(nome) { return new Colecao(this.db, `${this.path}/${nome}`); }
  get nome() { return `${this.db.raiz}/${this.path}`; }
  async get() {
    const [snap] = await this.db._batchGet([this]);
    return snap;
  }
}
class Colecao {
  constructor(db, path) { this.db = db; this.path = path; }
  doc(id = idAleatorio()) { return new Doc(this.db, `${this.path}/${id}`); }
  async add(dados) {
    const ref = this.doc();
    await this.db._commit([escritaCriar(ref, dados)]);
    return ref;
  }
  /* Lista todos os documentos (sem filtro). Usado em testes e telas pequenas. */
  async listar() {
    const docs = [];
    let pageToken = "";
    do {
      const r = await this.db._req("GET", `/${this.path}?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ""}`);
      for (const d of r.documents || []) docs.push({ id: d.name.split("/").pop(), ...lerCampos(d.fields || {}) });
      pageToken = r.nextPageToken || "";
    } while (pageToken);
    return docs;
  }
}
class Snap {
  constructor(ref, doc) {
    this.ref = ref; this.id = ref.id; this.exists = !!doc;
    this.updateTime = doc?.updateTime || null;
    this._dados = doc ? lerCampos(doc.fields || {}) : undefined;
  }
  data() { return this._dados; }
  get(campo) { return this._dados?.[campo]; }
}

const escritaCriar = (ref, dados) => ({
  update: { name: ref.nome, fields: campos(dados) }, currentDocument: { exists: false }, updateTransforms: carimbos(dados)
});
const escritaAtualizar = (ref, dados) => ({
  update: { name: ref.nome, fields: campos(dados) }, updateMask: { fieldPaths: Object.keys(dados) },
  currentDocument: { exists: true }, updateTransforms: carimbos(dados)
});
const escritaSet = (ref, dados, { merge } = {}) => ({
  update: { name: ref.nome, fields: campos(dados) }, ...(merge ? { updateMask: { fieldPaths: Object.keys(dados) } } : {}),
  updateTransforms: carimbos(dados)
});

class Transacao {
  constructor(db) { this.db = db; this.escritas = []; this.lidos = new Map(); }
  async get(ref) {
    const [snap] = await this.db._batchGet([ref]);
    this.lidos.set(ref.nome, snap.updateTime); // null = não existia
    return snap;
  }
  create(ref, dados) { this.escritas.push(escritaCriar(ref, dados)); }
  update(ref, dados) { this.escritas.push(escritaAtualizar(ref, dados)); }
  set(ref, dados, opcoes) { this.escritas.push(escritaSet(ref, dados, opcoes)); }
  /* Cada escrita num documento lido só vale se ele ainda estiver como foi lido. */
  comCondicoes() {
    return this.escritas.map(w => {
      if (!this.lidos.has(w.update.name)) return w;
      const versao = this.lidos.get(w.update.name);
      return { ...w, currentDocument: versao ? { updateTime: versao } : { exists: false } };
    });
  }
}

/* Alguém mudou o documento entre a leitura e a gravação. */
const conflito = e => e instanceof ErroFirestore &&
  (e.status === 409 || ["ABORTED", "FAILED_PRECONDITION", "ALREADY_EXISTS"].includes(e.corpo?.error?.status));

/* `token` é uma função async que devolve o Bearer (ID token da conta do sistema, ou "owner" no emulador). */
export function criarFirestore({ projectId, token, host = "https://firestore.googleapis.com", fetchFn = fetch }) {
  const raiz = `projects/${projectId}/databases/(default)/documents`;
  const db = {
    raiz,
    doc: path => new Doc(db, path),
    collection: path => new Colecao(db, path),

    async _req(metodo, caminho, corpo) {
      const res = await fetchFn(`${host}/v1/${raiz}${caminho}`, {
        method: metodo,
        headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
        ...(corpo ? { body: JSON.stringify(corpo) } : {})
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw Object.assign(new ErroFirestore(res.status, json), { chamada: `${metodo} ${caminho.split("?")[0]}` });
      return json;
    },
    async _batchGet(refs) {
      const r = await db._req("POST", ":batchGet", { documents: refs.map(x => x.nome) });
      const porNome = new Map(r.filter(x => x.found).map(x => [x.found.name, x.found]));
      return refs.map(ref => new Snap(ref, porNome.get(ref.nome)));
    },
    _commit(writes) {
      return db._req("POST", ":commit", { writes });
    },

    async runTransaction(fn, tentativas = 8) {
      for (let i = 1; ; i++) {
        const tx = new Transacao(db);
        const resultado = await fn(tx);
        if (!tx.escritas.length) return resultado;
        try {
          await db._commit(tx.comCondicoes());
          return resultado;
        } catch (e) {
          if (!conflito(e) || i >= tentativas) throw e;
          const [espera] = crypto.getRandomValues(new Uint8Array(1));
          await new Promise(r => setTimeout(r, 15 * 2 ** Math.min(i, 5) + espera % 25));
        }
      }
    }
  };
  return db;
}
