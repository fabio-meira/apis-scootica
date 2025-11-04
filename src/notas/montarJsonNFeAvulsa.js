// notas/montarJsonNFeAvulsa.js
const Ibpt = require('../models/Ibpt');

//  Monta o JSON conforme a documentação da BrasilNFe
async function montarJsonNFeAvulsa(notaAvulsa, empresa) {
  const now = new Date();
  const dhEmi = now.toISOString();

  let totalTributosFederal = 0;
  let totalTributosEstadual = 0;

  // percorre os produtos e consulta o IBPT para cada NCM
  for (const p of notaAvulsa.produtos) {
    const valorItem = p.quantidade * p.preco;

  // busca os percentuais no IBPT pela NCM do produto
    const ibpt = await Ibpt.findOne({
      where: { Codigo: p.ncm.replace(/\D/g, ''), uf: empresa.uf }
    });

    if (ibpt) {
      const aliqFederal = parseFloat(ibpt.nacionalFederal) || 0;
      const aliqEstadual = parseFloat(ibpt.estadual) || 0;

      totalTributosFederal += (valorItem * aliqFederal) / 100;
      totalTributosEstadual += (valorItem * aliqEstadual) / 100;
    }
  };

  const totalTributos = totalTributosFederal + totalTributosEstadual;

  // RATEIO DOS VALORES GERAIS (desconto, frete, acréscimo)
  const descontoTotal = parseFloat(notaAvulsa?.totais?.desconto || 0);
  const freteTotal = parseFloat(notaAvulsa?.totais?.frete || 0);
  const acrescimoTotal = parseFloat(notaAvulsa?.totais?.acrescimo || 0);

  const totalProdutos = notaAvulsa.produtos.reduce(
    (acc, p) => acc + (p.quantidade * p.preco),
    0
  );

  // Cria os produtos com rateio proporcional
  const produtosComRateio = notaAvulsa.produtos.map((p) => {
    const valorProduto = p.quantidade * p.preco;
    const proporcao = totalProdutos > 0 ? valorProduto / totalProdutos : 0;

    const valorDesconto = descontoTotal * proporcao;
    const valorOutrasDespesas = (freteTotal + acrescimoTotal) * proporcao;
    const valorProdutoCalculado = valorProduto - valorDesconto + valorOutrasDespesas

    return {
      CodProdutoServico: p.referencia,
      NmProduto: p.descricao,
      EAN: p.codigoBarras || "SEM GTIN",
      NCM: p.ncm.replace(/\D/g, ''),
      CEST: p.cest || "",
      Quantidade: Number(p.quantidade),
      UnidadeComercial: p.unidadeMedida || "UN",
      // ValorDesconto: parseFloat(valorDesconto.toFixed(2)),
      ValorDesconto: 0,
      // ValorOutrasDespesas: parseFloat(valorOutrasDespesas.toFixed(2)),
      ValorOutrasDespesas: 0,
      // ValorUnitario: Number(p.preco),
      // ValorTotal: +(p.quantidade * p.preco).toFixed(2),
      ValorUnitario: parseFloat((valorProdutoCalculado / p.quantidade).toFixed(2)),
      ValorTotal: parseFloat(valorProdutoCalculado.toFixed(2)),
      CFOP: p.cfop,
      Imposto: {
        ICMS: {
          CodSituacaoTributaria: p.csosn,
          AliquotaICMS: 0,
          AliquotaMVA: 0,
          AliquotaICMSST: 0
        },
        PIS: {
          CodSituacaoTributaria: "99",
          Aliquota: 0
        },
        COFINS: {
          CodSituacaoTributaria: "99",
          Aliquota: 0
        },
        IPI: {
          CodSituacaoTributaria: 99,
          CodEnquadramento: 999,
          Aliquota: 0
        }
      }
    };
  });

  const pagamentos = (empresa.NFSimplesNac === true) 
  ? [
      {
        IndicadorPagamento: 0, // indPag
        FormaPagamento: "90", // SEM PAGAMENTO
        VlPago: 0,
        VlTroco: 0,
        TipoIntegracao: 0,
        CNPJCredenciadora: null,
        BandeiraOperadora: 0,
        NumeroAutorizacao: null
      }
    ]
  : notaAvulsa.pagamentos.map((pag) => {
      let tPag;
      switch (pag.tipoRecebimento) {
        case 'DINHEIRO': tPag = "01"; break;
        case 'CHEQUE': tPag = "02"; break;
        case 'CREDITO': tPag = "03"; break;
        case 'DEBITO': tPag = "04"; break;
        case 'CREDITO_LOJA': tPag = "05"; break;
        case 'VALE_ALIMENTACAO': tPag = "10"; break;
        case 'VALE_REFEICAO': tPag = "11"; break;
        case 'VALE_PRESENTE': tPag = "12"; break;
        case 'VALE_COMBUSTIVEL': tPag = "13"; break;
        case 'DUPLICATA': tPag = "14"; break;
        case 'BOLETO': tPag = "15"; break;
        case 'DEPOSITO_BANCARIO': tPag = "16"; break;
        case 'PIX': tPag = "17"; break;
        case 'TRANSFERENCIA_BANCARIA': tPag = "18"; break;
        case 'FIDELIDADE_CASHBACK': tPag = "19"; break;
        case 'SEM_PAGAMENTO': tPag = "90"; break;
        case 'OUTROS': default: tPag = "99"; break;
      }

      // Define indPag (à vista = 0, a prazo = 1, outros = 2)
      let indPag = 2;
      if (pag.parcela && pag.parcela > 1) {
        indPag = 1; // pagamento a prazo
      } else if (!pag.parcela || pag.parcela === 1) {
        indPag = 0; // pagamento à vista
      }

      return {
        IndicadorPagamento: indPag,
        FormaPagamento: tPag,
        VlPago: Number(pag.valor),
        VlTroco: 0,
        TipoIntegracao: 0,
        CNPJCredenciadora: null,
        BandeiraOperadora: 0,
        NumeroAutorizacao: null
      };
    });

  // Mensagem em Dados Adicionais
  const infCpl = `
    DOCUMENTO EMITIDO POR ME OU EPP OPTANTE PELO SIMPLES NACIONAL.
    NAO GERA DIREITO A CREDITO FISCAL DE IPI.
    Valor aprox. dos tributos: R$ ${totalTributos.toFixed(2)} (Federal: R$ ${totalTributosFederal.toFixed(2)} e Estadual: R$ ${totalTributosEstadual.toFixed(2)}). Fonte: IBPT
  `;
    // const infCpl = '';

  const json = {
    // Codigo: `${venda.id}`,
    Numero: `${notaAvulsa.id}`,
    Serie: 1,
    Modalidade: 1,
    TipoEmissao: 1,
    IndicadorPresenca: 1,
    ConsumidorFinal: true,
    NaturezaOperacao: notaAvulsa.tipoNFe || "REMESSA",
    ModeloDocumento: empresa.tipoNF || 55,
    Finalidade: 1,
    TipoAmbiente: empresa.ambienteSefaz,
    CalcularIBPT: false,
    Observacao: infCpl.trim(),
    IdentificadorInterno: `${notaAvulsa.id}`,
    EnviarEmail: false,
    Cliente: {
      CPFCNPJ: notaAvulsa.cliente.cnpj || notaAvulsa.cliente.cpf,
      NmCliente: notaAvulsa.cliente.nomeCompleto,
      CEP: notaAvulsa.cliente.cep,
      Logradouro: notaAvulsa.cliente.logradouro,
      Complemento: notaAvulsa.cliente.complemento || "",
      Numero: notaAvulsa.cliente.numero,
      Bairro: notaAvulsa.cliente.bairro,
      CodMunicipio: notaAvulsa.cliente.codCidade,
      NmMunicipio: notaAvulsa.cliente.cidade,
      UF: notaAvulsa.cliente.estado,
      CodPais: 1058,
      NmPais: "Brasil",
      Email: notaAvulsa.cliente.email || "",
      IndicadoIE: 9,
      IE: notaAvulsa.cliente.ie || "",
      Telefone: notaAvulsa.cliente.telefone || ""
    },
    // Produtos: venda.produtos.map((p) => ({
    //   CodProdutoServico: p.referencia,
    //   NmProduto: p.descricao,
    //   EAN: p.codigoBarras || "SEM GTIN",
    //   NCM: p.ncm.replace(/\D/g, ''),
    //   CEST: p.cest || "",
    //   Quantidade: Number(p.quantidade),
    //   UnidadeComercial: p.unidadeMedida || "UN",
    //   ValorDesconto: p.desconto || 0,
    //   ValorFrete: p.valorFrete || 0,
    //   ValorUnitario: Number(p.preco),
    //   ValorTotal: +(p.quantidade * p.preco).toFixed(2),
    //   CFOP: p.cfop,
    //   Imposto: {
    //     ICMS: {
    //       CodSituacaoTributaria: p.csosn, // CSOSN 102 Simples Nacional
    //       AliquotaICMS: 0,
    //       AliquotaMVA: 0,
    //       AliquotaICMSST: 0
    //     },
    //     PIS: {
    //       CodSituacaoTributaria: "99",
    //       Aliquota: 0
    //     },
    //     COFINS: {
    //       CodSituacaoTributaria: "99",
    //       Aliquota: 0
    //     },
    //     IPI: {
    //       CodSituacaoTributaria: 99,
    //       CodEnquadramento: 999,
    //       Aliquota: 0
    //     }
    //   }
    // })),
    Produtos: produtosComRateio,
    Pagamentos: pagamentos
  };
  // Log do JSON
  // console.log("JSON gerado para envio à BrasilNFe:\n", JSON.stringify(json, null, 2));

  return json;
}

module.exports = montarJsonNFeAvulsa;
