const axios = require("axios");
const Integracao = require("../models/Integracao");
const Pipeline = require('../models/Pipeline');
const PipelineStatus = require('../models/PipelineStatuses')

// function toCents(value) {
//   if (!value) return 0;
//   // Converte para número e multiplica por 100
//   const numberValue = typeof value === "string" ? parseFloat(value.replace(",", ".")) : Number(value);
//   return Math.round(numberValue * 100);
// }
function toCents(value) {
  if (!value) return 0;

  const numberValue = typeof value === "string" 
    ? parseFloat(value.replace(",", ".")) 
    : Number(value);

  // Converte para centavos
  const cents = Math.round(numberValue * 100);

  // Remove os dois últimos dígitos (dividindo por 100 e truncando)
  return Math.floor(cents / 100);
}

async function getPipilene(idEmpresa, idFilial){
  const where = {
    idEmpresa,
    idFilial
  };

  const pipeline = await Pipeline.findOne({ where });

  if (!pipeline) {
    throw new Error("Integração Kommo não encontrada para este pipeline");
  }

  return {
    pipeline_id: pipeline.pipeline_id,
    responsible_user_id: pipeline.responsible_user_id,
    name: pipeline.name ? pipeline.name.replace(/^Funil\s*/i, "") : "Matriz"
  };

}

async function getPipelineStatus(idEmpresa, pipeline_id, type){
  const where = {
    idEmpresa,
    pipeline_id,
    type
  };

  const pipelineStatus = await PipelineStatus.findOne({ where });

  if (!pipelineStatus) {
    throw new Error("Integração Kommo não encontrada para este status pipeline");
  }

  return {
    pipeline_id: pipelineStatus.pipeline_id,
    responsible_user_id: pipelineStatus.responsible_user_id,
    statuses_id: pipelineStatus.statuses_id
  };

}

async function getKommoIntegracao(idEmpresa) {
  const where = {
    idEmpresa,
    tipoIntegracao: "CRM",
    nomeIntegracao: "Kommo"
  };

  const integracao = await Integracao.findOne({ where });

  if (!integracao) {
    throw new Error("Integração Kommo não encontrada para esta empresa");
  }

  return {
    baseUrl: integracao.url,
    token: integracao.token
    
  };
}

// Criar contato no Kommo
async function criarContatoNoKommo(idEmpresa, idFilial, cliente, empresa) {
  const { baseUrl, token } = await getKommoIntegracao(idEmpresa);
  const { pipeline_id, responsible_user_id, name } = await getPipilene(idEmpresa, idFilial);

  const payload = [
    {
      name: cliente.nomeCompleto,
      pipeline_id: pipeline_id,
      status_id: 78787703,
      responsible_user_id: responsible_user_id,
      custom_fields_values: [
        {
          field_id: 376884, // Telefone
          values: [{ value: `+55${(cliente.celular || cliente.telefone || "").replace(/\D/g, "")}`, enum_id: 302432 }]
        },
        {
          field_id: 376886, // Email
        values: [{ value: cliente.email, enum_id: 302444 }]
        },
        {
          field_id: 1012860, // CPF
          values: [{ value: { vat_id: cliente.cpf }  }]
        },
        {
          field_id: 1012862, // Data de nascimento
            values: [{
                value: cliente.dtNascimento
                ? new Date(cliente.dtNascimento).toISOString().replace(/\.\d{3}Z$/, "+00:00")
                : null
            }]
        },
        {
          field_id: 1012864, // Observacoes
          values: [{ value: `Cadastro de contato da ${name}` }]
          // values: [{ value: "Cadastro teste da Loja 17" }]
        }
      ].filter(f => f.values[0].value) // remove campos nulos
    }
  ];

  console.log("post cliente: ", JSON.stringify(payload, null, 2));

  const response = await axios.post(
    `${baseUrl}/contacts`,
    payload,
    { headers: { 
        Authorization: `Bearer ${token}`, 
        "Content-Type": "application/json"
      } 
    }
  );

//   const response = await axios.get(
//   `${baseUrl}/contacts/16613194`,
//   {
//     headers: { 
//       Authorization: `Bearer ${token}`, 
//       "Content-Type": "application/json"
//     }
//   }
// );
    return response.data;
}

// Criar orçamento no Kommo
async function criarOrcamentoNoKommo(idEmpresa, idFilial, orcamento, cliente, vendedor, produtos, totais) {
  const { baseUrl, token } = await getKommoIntegracao(idEmpresa);
  const { pipeline_id, responsible_user_id, name } = await getPipilene(idEmpresa, idFilial);
  const type = 1; // name: Orçamento
  const { statuses_id } = await getPipelineStatus(idEmpresa, pipeline_id, type);

// monta os custom fields dinamicamente
  const customFields = [];

  // Possui exame de vista
  if (orcamento.idReceita !== null && orcamento.idReceita !== undefined) {
    customFields.push({
      field_id: 990586,
      values: [{ value: "Sim" }]
    });
  }

  // Loja (pela filial)
  customFields.push({
    field_id: 582404,
    values: [
      { 
        value: `${name}`,
        enum_id: 468578
      }
    ]
  });

  // Origem (sempre Sistema)
  customFields.push({
    field_id: 714648,
    values: [
      { 
        value: "Sistema", 
        enum_id: 841318 
      }
    ]
  });

  // Deseja (sempre Quer comprar)
  customFields.push({
    field_id: 990584,
    values: [
      { 
        value: "Quer comprar", 
        enum_id: 813876 
      }
    ]
  });

  // Atendimento (sempre Físico)
  customFields.push({
    field_id: 990588,
    values: [
      { 
        value: "Físico", 
        enum_id: 813892 
      }
    ]
  });

  console.log('nome: ', cliente.nomeCompleto);
  console.log('idCRM: ', cliente.idCRM);

  const ORPayload = [
    {
        name: `Cliente: ${cliente?.nomeCompleto} - Vendedor: ${vendedor.nomeCompleto}`,
        pipeline_id: pipeline_id,
        status_id: statuses_id,
        responsible_user_id: responsible_user_id,
        price: toCents(totais.total || 0),
        custom_fields_values: customFields,
        _embedded: {
        contacts: [
            {
            id: cliente?.idCRM,
            is_main: true
            }
        ],
        tags: (produtos || []).map(p => {
            let tagText = `${p.referencia} - ${p.descricao} - R$ ${p.valorTotal}`;

            if (tagText.length > 50) {
            tagText = tagText.substring(0, 47) + "...";
            }

            return { name: tagText };
        })
        }
    }
  ];

  console.log("post orçamento: ", JSON.stringify(ORPayload, null, 2));

  // const response = await axios.post(
  //   `${baseUrl}/leads/complex`,
  //   ORPayload,
  //   { headers: { 
  //       Authorization: `Bearer ${token}`, 
  //       "Content-Type": "application/json"
  //     } 
  //   }
    
  // );
const response = await axios.get(
  `${baseUrl}/leads/14138422`,
  { 
    headers: { 
      Authorization: `Bearer ${token}`, 
      "Content-Type": "application/json"
    } 
  }
);
  return response.data;
}

// Criar ordem de serviço no Kommo
async function criarOrdemServicoNoKommo(idEmpresa, idFilial, ordemServico, cliente, vendedor, produtos, totais) {
  const { baseUrl, token } = await getKommoIntegracao(idEmpresa);
  const { pipeline_id, responsible_user_id, name } = await getPipilene(idEmpresa, idFilial);
  const type = 2; // name: Em produção - OS
  const { statuses_id } = await getPipelineStatus(idEmpresa, pipeline_id, type);

// monta os custom fields dinamicamente
  const customFields = [];

  // Possui exame de vista
  if (ordemServico.idReceita !== null && ordemServico.idReceita !== undefined) {
    customFields.push({
      field_id: 990586,
      values: [{ value: "Sim" }]
    });
  }

  // Loja (pela filial)
  customFields.push({
    field_id: 582404,
    values: [
      { 
        value: `${name}`,
        enum_id: 468578
      }
    ]
  });

  // Origem (sempre Sistema)
  customFields.push({
    field_id: 714648,
    values: [
      { 
        value: "Sistema", 
        enum_id: 841318 
      }
    ]
  });

  // Deseja (sempre Quer comprar)
  customFields.push({
    field_id: 990584,
    values: [
      { 
        value: "Quer comprar", 
        enum_id: 813876 
      }
    ]
  });

  // Atendimento (sempre Físico)
  customFields.push({
    field_id: 990588,
    values: [
      { 
        value: "Físico", 
        enum_id: 813892 
      }
    ]
  });

  const OSPayload = [
    {
        name: `Cliente: ${cliente.nomeCompleto} - Vendedor: ${vendedor.nomeCompleto}`,
        pipeline_id: pipeline_id,
        status_id: statuses_id, // em produção = OS
        responsible_user_id: responsible_user_id,
        price: toCents(totais.total || 0),
        custom_fields_values: customFields,
        _embedded: {
        contacts: [
            {
            id: cliente?.idCRM,
            is_main: true
            }
        ],
        tags: (produtos || []).map(p => {
            let tagText = `${p.referencia} - ${p.descricao} - R$ ${p.valorTotal}`;

            if (tagText.length > 50) {
            tagText = tagText.substring(0, 47) + "...";
            }

            return { name: tagText };
        })
        }
    }
  ];

  console.log("post ordem de serviço: ", JSON.stringify(OSPayload, null, 2));

  const response = await axios.post(
    `${baseUrl}/leads/complex`,
    OSPayload,
    { headers: { 
        Authorization: `Bearer ${token}`, 
        "Content-Type": "application/json"
      } 
    }
  );

// const response = await axios.get(
//   `${baseUrl}/leads/14138422`,
//   { 
//     headers: { 
//       Authorization: `Bearer ${token}`, 
//       "Content-Type": "application/json"
//     } 
//   }
// );
  return response.data;
}

// Criar venda no Kommo
async function criarVendaNoKommo(idEmpresa, idFilial, venda, cliente, vendedor, produtos, totais) {
  const { baseUrl, token } = await getKommoIntegracao(idEmpresa);
  const { pipeline_id, responsible_user_id, name } = await getPipilene(idEmpresa, idFilial);
  const type = 3; // name: Venda ganha - Venda
  const { statuses_id } = await getPipelineStatus(idEmpresa, pipeline_id, type);

// monta os custom fields dinamicamente
  const customFields = [];

  // Possui exame de vista
  if (venda.idReceita !== null && venda.idReceita !== undefined) {
    customFields.push({
      field_id: 990586,
      values: [{ value: "Sim" }]
    });
  }

  // Loja (pela filial)
  customFields.push({
    field_id: 582404,
    values: [
      { 
        value: `${name}`,
        enum_id: 468578
      }
    ]
  });

  // Origem (sempre Sistema)
  customFields.push({
    field_id: 714648,
    values: [
      { 
        value: "Sistema", 
        enum_id: 841318 
      }
    ]
  });

  // Deseja (sempre Quer comprar)
  customFields.push({
    field_id: 990584,
    values: [
      { 
        value: "Quer comprar", 
        enum_id: 813876 
      }
    ]
  });

  // Atendimento (sempre Físico)
  customFields.push({
    field_id: 990588,
    values: [
      { 
        value: "Físico", 
        enum_id: 813892 
      }
    ]
  });

  const VDPayload = [
    {
        name: `Cliente: ${cliente.nomeCompleto} - Vendedor: ${vendedor.nomeCompleto}`,
        pipeline_id: pipeline_id,
        status_id: statuses_id, // Venda ganha - Venda
        responsible_user_id: responsible_user_id,
        price: toCents(totais.total || 0),
        custom_fields_values: customFields,
        _embedded: {
        contacts: [
            {
            id: cliente?.idCRM,
            is_main: true
            }
        ],
        tags: (produtos || []).map(p => {
            let tagText = `${p.referencia} - ${p.descricao} - R$ ${p.valorTotal}`;

            if (tagText.length > 50) {
            tagText = tagText.substring(0, 47) + "...";
            }

            return { name: tagText };
        })
        }
    }
  ];

  console.log("post venda: ", JSON.stringify(VDPayload, null, 2));

  const response = await axios.post(
    `${baseUrl}/leads/complex`,
    VDPayload,
    { headers: { 
        Authorization: `Bearer ${token}`, 
        "Content-Type": "application/json"
      } 
    }
  );

// const response = await axios.get(
//   `${baseUrl}/leads/14138422`,
//   { 
//     headers: { 
//       Authorization: `Bearer ${token}`, 
//       "Content-Type": "application/json"
//     } 
//   }
// );
  return response.data;
}

// Criar exame de vista no Kommo
async function criarExameVistaNoKommo(idEmpresa, idFilial, orcamento, cliente, medico) {
  const { baseUrl, token } = await getKommoIntegracao(idEmpresa);
  const { pipeline_id, responsible_user_id, name } = await getPipilene(idEmpresa, idFilial);
  const type = 4; // name: Exame de vista - Receita
  const { statuses_id } = await getPipelineStatus(idEmpresa, pipeline_id, type);

// monta os custom fields dinamicamente
  const customFields = [];

  // Possui exame de vista
  if (orcamento.idReceita !== null && orcamento.idReceita !== undefined) {
    customFields.push({
      field_id: 990586,
      values: [{ value: "Sim" }]
    });
  }

  // Loja (pela filial)
  customFields.push({
    field_id: 582404,
    values: [
      { 
        value: `${name}`,
        enum_id: 468578
      }
    ]
  });

  // Origem (sempre Sistema)
  customFields.push({
    field_id: 714648,
    values: [
      { 
        value: "Sistema", 
        enum_id: 841318 
      }
    ]
  });

  // Deseja (sempre Quer comprar)
  customFields.push({
    field_id: 990584,
    values: [
      { 
        value: "Quer comprar", 
        enum_id: 813876 
      }
    ]
  });

  // Atendimento (sempre Físico)
  customFields.push({
    field_id: 990588,
    values: [
      { 
        value: "Físico", 
        enum_id: 813892 
      }
    ]
  });

  const EVPayload = [
    {
        name: `EV Cliente - ${cliente.nomeCompleto} - Médico ${medico.nomeCompleto}`,
        pipeline_id: pipeline_id,
        status_id: statuses_id, 
        responsible_user_id: responsible_user_id,
        custom_fields_values: customFields,
        _embedded: {
        contacts: [
            {
            id: cliente?.idCRM,
            is_main: true
            }
        ],
        tags: [
          {
            name: `Exame de vista de ${cliente.nomeCompleto} - Médico ${medico.nomeCompleto}`
          }
        ]
      }
    }
  ];

  console.log("post exame de vista: ", JSON.stringify(EVPayload, null, 2));

  const response = await axios.post(
    `${baseUrl}/leads/complex`,
    EVPayload,
    { headers: { 
        Authorization: `Bearer ${token}`, 
        "Content-Type": "application/json"
      } 
    }
    
  );
// const response = await axios.get(
//   `${baseUrl}/leads/14138422`,
//   { 
//     headers: { 
//       Authorization: `Bearer ${token}`, 
//       "Content-Type": "application/json"
//     } 
//   }
// );
  return response.data;
}

// Atualizar o Kanban para de venda 
async function avancarKanbanKommo(idEmpresa, idFilial, idLead, type) {
    const { baseUrl, token } = await getKommoIntegracao(idEmpresa);
    const { pipeline_id, responsible_user_id, name } = await getPipilene(idEmpresa, idFilial);
    const { statuses_id } = await getPipelineStatus(idEmpresa, pipeline_id, type);
    
    const AVPayload = {
        status_id: statuses_id,                    // Para qual etapa mover
        pipeline_id: pipeline_id,                  // Funil do lead
        responsible_user_id: responsible_user_id   // Responsável no Kommo
    };

    console.log("avançar status: ", JSON.stringify(AVPayload, null, 2));

    try {
        const response = await axios.patch(
          `${baseUrl}/leads/${idLead}`,
            AVPayload,
            {
              headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json"
              }
            }
        );
        // const response = await axios.get(
        //   `${baseUrl}/leads/${idLead}`,
        //   { 
        //     headers: { 
        //       Authorization: `Bearer ${token}`, 
        //       "Content-Type": "application/json"
        //     } 
        //   }
        // );
        return response.data;

    } catch (err) {
        console.error("Erro ao avançar Kanban Kommo:", err.response?.data || err.message);
        throw err;
    }
}

module.exports = { 
    criarContatoNoKommo, 
    criarOrcamentoNoKommo,
    criarOrdemServicoNoKommo,
    criarVendaNoKommo,
    criarExameVistaNoKommo,
    avancarKanbanKommo
 };
