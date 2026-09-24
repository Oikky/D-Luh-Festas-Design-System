/* Os dois modelos de contrato da D'Luh Festas, transcritos dos geradores atuais. */
window.DLUH_CONTRATOS = {
  buffet: {
    id: "buffet",
    nome: "Prestação de serviços de buffet",
    descricao: "Para festas e eventos com buffet da D'Luh — equipe, cardápio, utensílios e horários.",
    icone: "chef-hat",
    titulo: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE BUFFET",
    grupos: [
      { titulo: "Contratante", campos: [
        { id: "contratante_nome", rot: "Nome", req: true, span: 2 },
        { id: "contratante_end", rot: "Endereço", req: true, span: 2 },
        { id: "contratante_cpf", rot: "CPF / CNPJ", req: true } ] },
      { titulo: "Evento", campos: [
        { id: "evento_tipo", rot: "Tipo de evento", req: true, ph: "Aniversário de 15 anos" },
        { id: "data_evento", rot: "Data do evento", tipo: "date", req: true },
        { id: "local_evento", rot: "Local / espaço", req: true, span: 2 },
        { id: "inicio", rot: "Início", tipo: "time", req: true },
        { id: "fim", rot: "Término", tipo: "time", req: true },
        { id: "duracao", rot: "Duração", ph: "4 horas" },
        { id: "tolerancia", rot: "Tolerância", ph: "30 minutos" },
        { id: "convidados", rot: "Convidados", tipo: "number", req: true },
        { id: "chegada", rot: "Chegada da equipe", tipo: "time" },
        { id: "antecedencia", rot: "Antecedência de preparo", ph: "2 horas" } ] },
      { titulo: "Equipe", campos: [
        { id: "garcons", rot: "Garçons", tipo: "number" },
        { id: "cozinheiras", rot: "Cozinheiras", tipo: "number" },
        { id: "organizadores", rot: "Organizadores", tipo: "number" },
        { id: "auxiliares", rot: "Auxiliares", tipo: "number" } ] },
      { titulo: "Valores", campos: [
        { id: "valor_total", rot: "Valor total", tipo: "dinheiro", req: true },
        { id: "valor_extenso", rot: "Valor por extenso", req: true, span: 2 },
        { id: "entrada", rot: "Entrada", tipo: "dinheiro" },
        { id: "data_entrada", rot: "Data da entrada", tipo: "date" },
        { id: "cidade", rot: "Comarca / cidade", ph: "Montes Claros" } ] }
    ],
    abertura: "CONTRATANTE: {{contratante_nome}}\nEndereço: {{contratante_end}}\nCPF/CNPJ: {{contratante_cpf}}\n\nCONTRATADA: LUCIANA DE AGUILAR FREITAS, proprietária da empresa D'Luh Festas, com sede em Montes Claros, na Rua Visconde de Taunay, 278, Bairro Vila Maria Cândida, CEP 39402-394, Estado de Minas Gerais.\n\nAs partes acima identificadas têm, entre si, justo e contratado o presente Contrato de Prestação de Serviços de Buffet, oferecido pela D'Luh Festas, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente.",
    clausulas: [
      { t: "CLÁUSULA 1ª – DO OBJETO", c: "A presente contratação tem como objeto a prestação de serviços de buffet, pela CONTRATADA, para {{evento_tipo}} da CONTRATANTE, a realizar-se no dia {{data_evento}}, no espaço {{local_evento}}, com início às {{inicio}} e término às {{fim}}." },
      { t: "CLÁUSULA 2ª", c: "O evento terá duração de {{duracao}}, com tolerância de {{tolerancia}}, e contará com a presença estimada de {{convidados}} convidados. O local e horário do evento são os descritos na cláusula anterior." },
      { t: "CLÁUSULA 3ª – DAS OBRIGAÇÕES DA CONTRATANTE", c: "A CONTRATANTE compromete-se a fornecer todas as informações necessárias para a adequada realização do serviço, especificando detalhes do evento e a forma de execução dos serviços contratados." },
      { t: "CLÁUSULA 4ª", c: "A CONTRATANTE deverá realizar o pagamento conforme estipulado na Cláusula 11 deste contrato." },
      { t: "CLÁUSULA 5ª – DAS OBRIGAÇÕES DA CONTRATADA", c: "A CONTRATADA deverá prestar os serviços conforme especificações da CONTRATANTE, iniciando-se às {{inicio}} e finalizando às {{fim}}. Os produtos servidos deverão ser de alta qualidade." },
      { t: "CLÁUSULA 6ª", c: "A CONTRATADA se responsabiliza por fornecer utensílios como pratos, copos, taças, talheres, bandejas, réchauds, baldes de gelo, entre outras especificações em anexo, para execução dos serviços." },
      { t: "CLÁUSULA 7ª", c: "A CONTRATADA deverá estar presente no local do evento às {{chegada}}, a fim de realizar a preparação do espaço com antecedência mínima de {{antecedencia}}." },
      { t: "CLÁUSULA 8ª", c: "Serão disponibilizados para a execução do serviço: {{equipe}}." },
      { t: "CLÁUSULA 9ª", c: "A CONTRATADA será exclusivamente responsável por seus colaboradores, incluindo cumprimento de obrigações trabalhistas, previdenciárias, fiscais e sociais." },
      { t: "CLÁUSULA 10ª", c: "Todos os colaboradores da CONTRATADA deverão estar devidamente uniformizados, apresentando conduta adequada e profissional." },
      { t: "CLÁUSULA 11ª – DO PREÇO E CONDIÇÕES DE PAGAMENTO", c: "O serviço será remunerado no valor de R$ {{valor_total}} ({{valor_extenso}}), com entrada de R$ {{entrada}} em {{data_entrada}}." },
      { t: "CLÁUSULA 12ª – DO INADIMPLEMENTO", c: "Em caso de inadimplemento da CONTRATANTE, incidirão multa de 2%, juros de mora de 1% ao mês e correção monetária. Em caso de cobrança judicial, serão acrescidos honorários advocatícios de 20% e custas processuais." },
      { t: "CLÁUSULA 13ª – DA DEVOLUÇÃO", c: "Todos os utensílios fornecidos deverão ser devolvidos em perfeito estado. Em caso de danos ou extravios, a CONTRATANTE deverá arcar com o valor de reposição conforme anexo, no prazo máximo de 24 horas após o evento, sob pena de aplicação de multa, juros e correção conforme cláusula anterior." },
      { t: "CLÁUSULA 14ª – DA RESCISÃO", c: "O contrato poderá ser rescindido unilateralmente por qualquer das partes, mediante comunicação escrita com justificativa, respeitado o prazo mínimo de 60 (sessenta) dias antes da data do evento." },
      { t: "CLÁUSULA 15ª", c: "Salvo rescisão conforme cláusula anterior, a parte que descumprir o contrato deverá pagar multa de 50% (cinquenta por cento) do valor total, sem prejuízo de eventuais perdas e danos." },
      { t: "CLÁUSULA 16ª", c: "Caso necessário, e havendo possibilidade, a CONTRATADA poderá complementar os serviços de buffet durante o evento." },
      { t: "CLÁUSULA 17ª", c: "O cardápio será preparado de acordo com o número de convidados informado. A CONTRATADA não será responsável por eventuais insuficiências caso haja número superior ao estipulado." },
      { t: "CLÁUSULA 18ª", c: "Qualquer alteração neste contrato deverá ser feita por meio de Termo Aditivo, assinado por ambas as partes." },
      { t: "CLÁUSULA 19ª – DO FORO", c: "Fica eleito o foro da Comarca de {{cidade}}/MG para dirimir quaisquer dúvidas ou litígios decorrentes deste contrato." }
    ],
    assinaturas: ["Nome e assinatura do Contratado:", "Nome e assinatura do Contratante:", "Testemunha 1:", "Testemunha 2:"]
  },

  salao: {
    id: "salao",
    nome: "Locação do salão de festas",
    descricao: "Para quem aluga só o espaço — chave, horários, danos ao patrimônio e regras de som.",
    icone: "party-popper",
    titulo: "CONTRATO DE LOCAÇÃO DO SALÃO DE FESTAS",
    grupos: [
      { titulo: "Salão", campos: [
        { id: "salao_nome", rot: "Nome do salão", req: true, span: 2 },
        { id: "locadora_nome", rot: "Locadora", req: true, span: 2, def: "LUCIANA DE AGUILAR FREITAS" },
        { id: "locadora_cpf", rot: "CPF da locadora" },
        { id: "locadora_endereco", rot: "Endereço da locadora", span: 2 } ] },
      { titulo: "Locatário (cliente)", campos: [
        { id: "nome", rot: "Nome completo", req: true, span: 2 },
        { id: "cpf", rot: "CPF", req: true },
        { id: "rg", rot: "RG" },
        { id: "estado_civil", rot: "Estado civil", tipo: "opcao", opcoes: ["solteiro(a)", "casado(a)", "divorciado(a)", "viúvo(a)"] },
        { id: "profissao", rot: "Profissão" },
        { id: "endereco", rot: "Endereço", req: true, span: 2 },
        { id: "bairro", rot: "Bairro" },
        { id: "cidade", rot: "Cidade", def: "Montes Claros" },
        { id: "uf", rot: "UF", def: "MG" },
        { id: "telefone", rot: "Telefone", ph: "(38) 99999-9999" } ] },
      { titulo: "Evento", campos: [
        { id: "tipo_festa", rot: "Tipo de festa", req: true, ph: "de aniversário infantil" },
        { id: "data_evento", rot: "Data", tipo: "date", req: true },
        { id: "hora_inicio", rot: "Início", tipo: "time", req: true },
        { id: "hora_chave", rot: "Entrega da chave", tipo: "time" },
        { id: "hora_saida", rot: "Retirada dos pertences", tipo: "time" },
        { id: "itens_fornecidos", rot: "Itens fornecidos", span: 2, ph: "mesas, cadeiras, som ambiente e brinquedos" },
        { id: "decibeis", rot: "Limite de som (dB)", tipo: "number", def: "70" },
        { id: "leis_municipais", rot: "Leis municipais", span: 2 } ] },
      { titulo: "Valores e prazos", campos: [
        { id: "valor_total", rot: "Valor da locação", tipo: "dinheiro", req: true },
        { id: "valor_total_extenso", rot: "Valor por extenso", span: 2 },
        { id: "entrada", rot: "Entrada já paga", tipo: "dinheiro" },
        { id: "entrada_extenso", rot: "Entrada por extenso", span: 2 },
        { id: "forma_entrada", rot: "Forma da entrada", tipo: "opcao", opcoes: ["Pix", "Cartão", "Dinheiro"] },
        { id: "saldo", rot: "Saldo", tipo: "dinheiro", auto: true },
        { id: "saldo_extenso", rot: "Saldo por extenso", span: 2 },
        { id: "prazo_saldo_dias", rot: "Prazo do saldo (dias antes)", tipo: "number", def: "7" },
        { id: "prazo_desistencia_dias", rot: "Prazo de desistência (dias)", tipo: "number", def: "30" },
        { id: "foro", rot: "Foro", def: "Montes Claros" } ] }
    ],
    abertura: "Por este instrumento particular de contrato, de um lado como;\n\nLOCADORA: {{locadora_nome}}, portadora do CPF: {{locadora_cpf}}, residente e domiciliada a {{locadora_endereco}}, na cidade de Montes Claros – MG, e de outro lado como:\n\nLOCATÁRIO: {{nome}}, {{estado_civil}}, {{profissao}}, portador do CPF: {{cpf}}, RG {{rg}}, residente e domiciliado a {{endereco}}, {{bairro}}, {{cidade}} – {{uf}}, Telefone {{telefone}}. Doravante denominado simplesmente LOCATÁRIO, resolvem pactuar o presente contrato, de acordo com as condições e cláusulas seguintes;",
    clausulas: [
      { t: "1ª Cláusula", c: "É objeto do presente contrato do salão de festas {{salao_nome}} de propriedade da LOCADORA para realização de Festa {{tipo_festa}}, no dia {{data_evento}} às {{hora_inicio}}. A entrega da chave será às {{hora_chave}} do mesmo dia." },
      { t: "2ª Cláusula", c: "São obrigações da LOCADORA:", sub: [
        "2.1 Colocar a disposição do LOCATÁRIO a área ora locada em perfeitas condições de uso.",
        "2.2 Fornecer {{itens_fornecidos}}.",
        "2.3 Informar todos os requisitos de segurança que salão oferece.",
        "2.4 Caso a LOCADORA desista de alugar o espaço, deverá comunicar ao LOCATÁRIO com antecedência de {{prazo_desistencia_dias}} dias, ficando obrigada a devolver assim o sinal já pago." ] },
      { t: "3ª Cláusula", c: "São obrigações do LOCATÁRIO:", sub: [
        "3.1 Efetuar o pagamento do valor da locação de {{valor_total}} ({{valor_total_extenso}}) ao LOCADOR, sendo {{entrada}} ({{entrada_extenso}}) já pago via {{forma_entrada}} e o restante {{saldo}} ({{saldo_extenso}}) ATÉ {{prazo_saldo_dias}} dias antes do dia da festa.",
        "3.2 Caso o LOCATÁRIO desista de realizar o evento, o valor da entrada, só será devolvido se avisar com antecedência de no mínimo {{prazo_desistencia_dias}} dias.",
        "3.3 Usar com zelo as dependências bem como todos os equipamentos e outros materiais colocados à sua disposição, sem qualquer dano.",
        "3.4 Responder por quaisquer danos causados ao patrimônio da LOCADORA, indenizando pela totalidade dos prejuízos que por ventura venha a ocorrer, quer por terceiros ou por elementos sob a subordinação direta ou indireta do LOCATÁRIO;",
        "3.5 É vedado ao LOCATÁRIO colocar mesas e cadeiras fora do salão de festas de qualquer forma, podendo causar transtornos entre vizinhança e LOCADORA.",
        "3.6 Fica estabelecida ainda que o LOCATÁRIO seguirá rigorosamente as leis municipais do meio ambiente ({{leis_municipais}}), comprometendo em manter a intensidade do volume/ volume do som em {{decibeis}} decibéis (som ambiente).",
        "3.7 Incidentes de qualquer natureza decorrente da festa (atividade), dentro ou fora do recinto, será única e exclusiva de responsabilidade do LOCATÁRIO.",
        "3.8 Na devolução do ambiente é de responsabilidade do LOCATÁRIO entregar o ambiente na mais perfeita ordem e limpeza possível.",
        "3.9 O LOCATÁRIO se compromete a retirar tudo que foi levado para dentro do salão pertencente ao mesmo até as {{hora_saida}} do dia seguinte." ] },
      { t: "5ª Cláusula", c: "A LOCADORA não se responsabiliza por objeto de quaisquer naturezas, esquecido dentro do salão de festas." },
      { t: "6ª Cláusula", c: "A LOCADORA não tem nenhuma responsabilidade se por qualquer eventualidade climática o LOCATÁRIO não puder usufruir de algum espaço no salão de festa bem como os brinquedos." },
      { t: "7ª Cláusula", c: "As partes elegem o foro da comarca de {{foro}} para solucionar as dúvidas oriundas deste contrato. E por acharem justos e contratados, assinam o presente em duas vias de igual teor, que o assinam." }
    ],
    assinaturas: ["LOCADORA", "LOCATÁRIO"]
  }
};
