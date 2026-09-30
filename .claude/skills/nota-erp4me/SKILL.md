---
name: nota-erp4me
description: Emite a nota fiscal (NFS-e ou NFC-e) de um pedido da D'Luh no ERP4ME da Alterdata (erpforme.alterdata.com.br / erp4me.one), preenchendo o formulário pelo navegador do Playwright e registrando o número no pedido. Use quando pedirem "emite a nota do PED-3005", "faz a NFS-e/NFC-e desse pedido", "nota fiscal no ERP4ME".
---

# Nota fiscal no ERP4ME (Playwright)

O ERP4ME não tem API aberta, então a nota sai pelo site, com o navegador do Playwright
(`mcp__plugin_playwright_playwright__*`). Carregue as ferramentas numa chamada só:
`browser_navigate, browser_snapshot, browser_click, browser_type, browser_fill_form, browser_select_option, browser_press_key, browser_wait_for, browser_take_screenshot, browser_run_code_unsafe`.

## Regras que não mudam

- **Nunca clique em "Gravar e Enviar" / "Gravar e enviar" sem o "sim" da pessoa na conversa**, depois
  de mostrar o resumo e a captura da tela preenchida. Enviar transmite à Sefaz/prefeitura. Isso não tem volta:
  errou, só cancelando a nota.
- **Nunca digite a senha do Passaporte Alterdata.** Caiu em `passaporte2.alterdata.com.br`: peça para a
  pessoa entrar na janela do Playwright e espere o "feito".
- Não cancele, exclua, inutilize nem mexa em Configurações do ERP4ME. Se faltar configuração, pare e diga o quê.
- Total da nota ≠ total do pedido → pare e mostre a diferença.
- Os campos abaixo foram lidos da tela em 29/09/2026 (versão 3.00.06). Se algo não bater, use
  `browser_snapshot` para achar o campo pelo rótulo e siga. Não adivinhe valor fiscal (natureza, série,
  código de serviço): pergunte.

## 1. Dados do pedido

```
node backend/scripts/nota-erp4me.mjs dados PED-3005
```
Precisa de `SISTEMA_SENHA` (variável de ambiente ou `backend/.env`). Sem ela, peça à pessoa, ou
então peça para ela colar os "Dados para a nota" da janela Nota fiscal do admin.

- `notaJaRegistrada` preenchido: avise e pergunte se é para emitir outra mesmo.
- Status "Cancelado": não emita.
- Tipo: se não disseram, pergunte. **NFS-e** serve para serviço (festa, decoração, locação). **NFC-e** é a
  venda ao consumidor (doces, bolos, salgados). Empresa (`tipo: "empresa"`) precisa de CNPJ.

## 2. Entrar no ERP4ME

`browser_navigate https://erpforme.alterdata.com.br/financeiro/dashboard`. Se abrir o Passaporte, a
pessoa faz o login (veja as Regras). O login fica guardado no perfil do Playwright.

Pop-ups que aparecem no caminho e devem ser fechados sem aceitar nada:
- tour roxo ("Movimento - Vendas", botão Próximo): feche no ×;
- "Enviar certificado": clique em **Enviar depois**. Se a nota for para ser enviada e não houver certificado, pare (item 5).

## 3a. NFC-e: Movimentos → Vendas

URL: `https://erpforme.alterdata.com.br/movimento/vendas` → botão **Novo** → modal "Novo Movimento".

| Campo | O que pôr |
|---|---|
| Natureza de Operação | a de venda NFC-e (o Modelo ao lado tem de virar **NFC-e**; se ficar NF-e, a natureza está errada) |
| Série | a série da NFC-e configurada; se houver mais de uma, pergunte |
| Pessoa | busque pelo CPF/CNPJ ou nome. Sem cadastro: consumidor não identificado (NFC-e) ou **+** para cadastrar, e só com o "ok" da pessoa |
| Data/Hora Emissão | deixe as de agora |
| Aba **Itens** | para cada item: "Código ou Descrição" (busque o produto cadastrado) → Quantidade → Valor Unitário (formato `12,50`) → **Adicionar** |
| Aba **Pagamento** | forma do pedido (`formaPagamento`: pix, dinheiro, cartão); valor = total |
| Aba **Complemento** → Observação | `Pedido PED-3005 — D'Luh Festas` |

A taxa de entrega entra como item ou como frete (aba Transporte), conforme o contador orientar. Se ninguém orientou, pergunte.
Produto que não existe no ERP4ME: pare e pergunte se é para cadastrar (Produtos → **+**) ou usar um genérico.

## 3b. NFS-e: Serviços → Nota de Serviço

URL: `https://erpforme.alterdata.com.br/vue/servico/notas` → **Novo**.
Se aparecer "O ERP4me não está configurado para emitir NFS-e", clique **Não** e pare (item 5).

| Campo | O que pôr |
|---|---|
| Número/Série DPS, Lote | deixe o que o sistema preencher |
| Competência | data da entrega/festa (`entrega.data`) |
| Pessoa / Tomador | busque pelo CPF/CNPJ ou nome; sem cadastro, **+** para cadastrar, e só com o "ok" (NFS-e pede endereço do tomador) |
| Serviço Prestado | o serviço cadastrado (ex.: buffet/decoração); o Código da Lista e o Código de Tributação Nacional vêm dele |
| Natureza de Operação | a de tributação normal no município, salvo instrução do contador |
| Discriminação | os itens, um por linha: `2× Bolo 1kg — R$ 120,00` + a taxa de entrega + `Pedido PED-3005` (máx. 2000 caracteres) |
| Quantidade / valor | 1 × total do pedido |
| Pagamento | forma do pedido; o valor da parcela tem de ser igual ao total, senão o ERP4ME recusa o envio |

Impostos: deixe o que o sistema calcular. Não mexa em retenções sem instrução.

## 4. Conferir, confirmar, enviar

1. `browser_take_screenshot` do formulário preenchido e resumo na conversa: tipo, tomador/pessoa, itens, total do
   ERP4ME × total do pedido.
2. Pergunte: "Posso gravar e enviar?". Só com "sim" clique em **Gravar e Enviar** (Vendas) ou
   **Gravar e enviar** (NFS-e). Se disserem "só grava", use **Gravar**. A nota fica em aberto e não é registrada no pedido.
3. Espere o status na listagem (Autorizado / Rejeitado / Processando). Rejeitado: mostre a mensagem e pare.
   Processando: espere e atualize; na NFS-e há "Consultar NFS-e" no menu ⋮ da linha.
4. Autorizada: pegue o número (coluna Número; na NFS-e, menu ⋮ → "Copiar número da NFS-e") e registre:
   ```
   node backend/scripts/nota-erp4me.mjs registrar PED-3005 NFS-e 152 12345678000190
   ```
   O número aparece no cartão do pedido no admin ("NFS-e 152").

## 5. O que falta configurar na conta (visto em 29/09/2026)

Antes da primeira nota, a conta "Augusto e Aguilar Buffet e Confe…" precisa de, no ERP4ME
(com o contador):
- **Certificado digital A1** (Configurações → Certificado): sem ele nada é transmitido;
- **NFS-e**: Configurações → NFS-e: marcar "Emite NFS-e", Inscrição Municipal, Simples Nacional, série DPS,
  ambiente **Produção**; e cadastrar o serviço em Serviços → Serviços;
- **NFC-e**: natureza de operação de venda NFC-e (hoje só há "Venda NF-e" e "Devolução de Compra"), série e CSC
  da NFC-e; e os produtos cadastrados.

Se algo disso faltar quando a skill rodar, diga exatamente o quê e pare. Não configure sozinho.
