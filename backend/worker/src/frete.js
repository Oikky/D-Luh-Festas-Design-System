/* Taxa de entrega pela Moblets (Let's Express), que roda na plataforma Machine: a estimativa oficial
   da corrida (POST /entregas/estimativas da API v2 da Machine), arredondada para cima no real.
   Precisa de quatro segredos (`npx wrangler secret put <NOME>`):
     MACHINE_API_KEY   a chave da central (a Moblets vê em Configuração > Integrações > Machine API)
     MACHINE_USUARIO   login de empresa da D'Luh no painel da Moblets (com permissão de API de entregas)
     MACHINE_SENHA     senha desse login
     LOJA_ENDERECO     de onde sai a entrega: "Rua X, 123|Bairro|Montes Claros|MG"
   Opcional: MACHINE_CATEGORIA (id da categoria, se a Moblets tiver mais de uma; sem ela vale a padrão).
   Sem esses segredos, ou se a Moblets não responder, a resposta é { disponivel: false } e a taxa
   continua sendo combinada na confirmação, como antes. */

const BASE = "https://api.taximachine.com.br/api/v2/integracao";
const texto = (v, max) => String(v ?? "").trim().slice(0, max);

function configurado(env) {
  return !!(env.MACHINE_API_KEY && env.MACHINE_USUARIO && env.MACHINE_SENHA && env.LOJA_ENDERECO);
}

/* O endereço que vem do site: rua, número, bairro, CEP, cidade e UF (a cidade e a UF vêm do ViaCEP;
   sem CEP, a loja é de Montes Claros). */
function localDe(l) {
  const rua = texto(l?.rua, 120), numero = texto(l?.numero, 20), bairro = texto(l?.bairro, 80);
  if (!rua || !bairro) return null;
  return {
    endereco: numero ? `${rua}, ${numero}` : rua, bairro,
    cidade: texto(l?.cidade, 60) || "Montes Claros", estado: (texto(l?.uf, 2) || "MG").toUpperCase(),
    cep: String(l?.cep || "").replace(/\D/g, "").slice(0, 8)
  };
}

/* Centavos arredondados para cima no real: R$ 11,40 vira R$ 12,00. */
const paraCimaNoReal = reais => Math.ceil(Math.round(reais * 100) / 100) * 100;

async function estimarFrete(env, local, { fetchFn = fetch } = {}) {
  const destino = localDe(local);
  if (!destino || !configurado(env)) return { disponivel: false };
  const [endereco, bairro, cidade, estado] = String(env.LOJA_ENDERECO).split("|").map(s => s.trim());
  const corpo = {
    endereco_partida: endereco, bairro_partida: bairro, cidade_partida: cidade || "Montes Claros", estado_partida: estado || "MG",
    endereco_desejado: destino.endereco + (destino.cep ? `, ${destino.cep}` : ""), bairro_desejado: destino.bairro,
    cidade_desejado: destino.cidade, estado_desejado: destino.estado,
    ...(env.MACHINE_CATEGORIA ? { categoria_id: Number(env.MACHINE_CATEGORIA) } : {})
  };
  try {
    const r = await fetchFn(`${BASE}/entregas/estimativas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": env.MACHINE_API_KEY,
        Authorization: "Basic " + btoa(`${env.MACHINE_USUARIO}:${env.MACHINE_SENHA}`)
      },
      body: JSON.stringify(corpo),
      signal: AbortSignal.timeout(8000)
    });
    const j = await r.json().catch(() => ({}));
    const valor = Number(j?.data?.estimativa_valor);
    if (!r.ok || !j.success || !(valor > 0)) {
      console.error(JSON.stringify({ msg: "estimativa Moblets recusada", status: r.status, erros: j?.errors }));
      return { disponivel: false };
    }
    return {
      disponivel: true,
      taxa: paraCimaNoReal(valor),
      km: Number(j.data.estimativa_km) || null,
      minutos: Number(j.data.estimativa_minutos) || null
    };
  } catch (e) {
    console.error(JSON.stringify({ msg: "estimativa Moblets falhou", erro: String(e) }));
    return { disponivel: false };
  }
}

export { estimarFrete, localDe, paraCimaNoReal, configurado };
