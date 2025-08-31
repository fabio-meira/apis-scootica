// function montarJsonNFe(venda, empresa) {
//   const cliente = venda.cliente;
//   const modelo = empresa.modeloNotaFiscal || 55; // 55 = NF-e, 65 = NFC-e

//   const now = new Date();
//   const dhEmi = now.toISOString();

//   return {
//     ambiente: "homologacao", // ou "producao", de acordo com config
//     infNFe: {
//       versao: "4.00",
//       ide: {
//         cUF: parseInt(empresa.codUF),
//         natOp: "VENDA DE MERCADORIA",
//         mod: modelo,
//         serie: 1,
//         nNF: 10,
//         tpNF: 1,
//         idDest: 1,
//         cMunFG: parseInt(empresa.codCidade),
//         tpImp: 1,
//         tpEmis: 1,
//         cDV: 0,
//         tpAmb: 2,
//         finNFe: 1,
//         indFinal: 1,
//         indPres: modelo === 55 ? 1 : 0,
//         procEmi: 0,
//         verProc: "1.0",
//         dhEmi
//       },
//       emit: {
//         CNPJ: empresa.cnpj,
//         xNome: empresa.razaoSocial,
//         xFant: empresa.nomeFantasia,
//         enderEmit: {
//           xLgr: empresa.logradouro,
//           nro: empresa.numero,
//           xBairro: empresa.bairro,
//           cMun: empresa.codCidade,
//           xMun: empresa.cidade,
//           UF: empresa.uf,
//           CEP: empresa.cep.replace(/\D/g, '')
//         },
//         IE: empresa.ie || "ISENTO",
//       },
//       dest: {
//         CPF: cliente.cpf,
//         xNome: cliente.nomeCompleto,
//         enderDest: {
//           xLgr: cliente.logradouro,
//           nro: cliente.numero,
//           xBairro: cliente.bairro,
//           cMun: cliente.codCidade,
//           xMun: cliente.cidade,
//           UF: cliente.estado,
//           CEP: cliente.cep.replace(/\D/g, ''),
//           cPais: "1058",
//           xPais: "BRASIL",
//           fone: cliente.celular
//         },
//         indIEDest: 9,
//         email: cliente.email
//       },
//       det: venda.produtos.map((p, index) => ({
//         nItem: index + 1,
//         prod: {
//           cProd: p.referencia,
//           cEAN: p.codigoBarras || "SEM GTIN",
//           xProd: p.descricao,
//           NCM: p.ncm.replace(/\D/g, ''),
//           CFOP: "5102",
//           uCom: p.unidadeMedida || "UN",
//           qCom: Number(p.quantidade),
//           vUnCom: Number(p.preco),
//           vProd: +(p.quantidade * p.preco).toFixed(2),
//           cEANTrib: p.codigoBarras || "SEM GTIN",
//           uTrib: "UN",
//           qTrib: Number(p.quantidade),
//           vUnTrib: Number(p.preco),
//           indTot: 1
//         },
//         imposto: {
//           ICMS: {
//             ICMSSN102: {
//               orig: 0,
//               CSOSN: "102"
//             }
//           },
//           PIS: {
//             PISOutr: {
//               CST: "99",
//               vBC: 0.00,
//               pPIS: 0.00,
//               vPIS: 0.00
//             }
//           },
//           COFINS: {
//             COFINSOutr: {
//               CST: "99",
//               vBC: 0.00,
//               pCOFINS: 0.00,
//               vCOFINS: 0.00
//             }
//           }
//         }
//       })),
//       total: {
//         ICMSTot: {
//           vBC: 0.00,
//           vICMS: 0.00,
//           vICMSDeson: 0.00,
//           vFCP: 0.00,
//           vBCST: 0.00,
//           vST: 0.00,
//           vFCPST: 0.00,
//           vFCPSTRet: 0.00,
//           vProd: Number(venda.totais.totalProdutos),
//           vFrete: Number(venda.totais.frete) || 0.00,
//           vSeg: 0.00,
//           vDesc: Number(venda.totais.desconto) || 0.00,
//           vII: 0.00,
//           vIPI: 0.00,
//           vIPIDevol: 0.00,
//           vPIS: 0.00,
//           vCOFINS: 0.00,
//           vOutro: 0.00,
//           vNF: Number(venda.totais.total)
//         }
//       },
//       transp: {
//         modFrete: 9
//       },
//       pag: {
//         detPag: venda.pagamentos.map((pag) => {
//           let tPag;
//           switch (pag.tipoRecebimento) {
//             case 'DINHEIRO':
//               tPag = "01"; break;
//             case 'CHEQUE':
//             tPag = "02"; break;
//             case 'CREDITO':
//                 tPag = "03"; break;
//             case 'DEBITO':
//                 tPag = "04"; break;
//             case 'CREDITO_LOJA':
//                 tPag = "05"; break;
//             case 'VALE_ALIMENTACAO':
//                 tPag = "10"; break;
//             case 'VALE_REFEICAO':
//                 tPag = "11"; break;
//             case 'VALE_PRESENTE':
//                 tPag = "12"; break;
//             case 'VALE_COMBUSTIVEL':
//                 tPag = "13"; break;
//             case 'DUPLICATA':
//                 tPag = "14"; break;
//             case 'BOLETO':
//                 tPag = "15"; break;
//             case 'DEPOSITO_BANCARIO':
//                 tPag = "16"; break;
//             case 'PIX':
//                 tPag = "17"; break;
//             case 'TRANSFERENCIA_BANCARIA':
//                 tPag = "18"; break;
//             case 'FIDELIDADE_CASHBACK':
//                 tPag = "19"; break;
//             case 'SEM_PAGAMENTO':
//                 tPag = "90"; break;
//             case 'OUTROS':
//             default:
//                 tPag = "99"; break;
//           }

//           // Definição automática do indPag
//           let indPag = 2; // padrão "outros"
//           if (pag.parcela && pag.parcela > 1) {
//             indPag = 1; // a prazo
//           } else if (!pag.parcela || pag.parcela === 1) {
//            indPag = 0; // à vista
//           }

//           return {
//             indPag,
//             tPag,
//             vPag: Number(pag.valor)
//           };
//         })
//       }
      

//     }
//   };
// }

// module.exports = montarJsonNFe;


function montarJsonNFe(venda, empresa) {
  const cliente = venda.cliente;
  const modelo = empresa.modeloNotaFiscal || 55; // 55 = NF-e, 65 = NFC-e

  const now = new Date();
  const dhEmi = now.toISOString();

  // --- Cálculo aproximado de tributos (valores fictícios, você deve substituir pelo cálculo via tabela IBPT)
  let totalTributosFederal = 27.5;
  let totalTributosEstadual = 18.0;

  venda.produtos.forEach((p) => {
    const valorItem = p.quantidade * p.preco;
    // Exemplo: valores fixos só para estruturar (substituir por consulta IBPT)
    const aliqFederal = p.aliqFederal || 0; 
    const aliqEstadual = p.aliqEstadual || 0;
    totalTributosFederal += (valorItem * aliqFederal) / 100;
    totalTributosEstadual += (valorItem * aliqEstadual) / 100;
  });

  const totalTributos = totalTributosFederal + totalTributosEstadual;

  // Mensagem em Dados Adicionais
  const infCpl = `
    Inf. Contribuinte: DOCUMENTO EMITIDO POR ME OU EPP OPTANTE PELO SIMPLES NACIONAL.
    NAO GERA DIREITO A CREDITO FISCAL DE IPI.
    Valor aprox. dos tributos: R$ ${totalTributos.toFixed(2)} (Federal: R$ ${totalTributosFederal.toFixed(2)} e Estadual: ${totalTributosEstadual.toFixed(2)}). Fonte: IBPT
    `;

  return {
    ambiente: "homologacao", 
    infNFe: {
      versao: "4.00",
      ide: {
        cUF: parseInt(empresa.codUF),
        natOp: "VENDA DE MERCADORIA",
        mod: modelo,
        serie: 1,
        nNF: 10,
        tpNF: 1,
        idDest: 1,
        cMunFG: parseInt(empresa.codCidade),
        tpImp: 1,
        tpEmis: 1,
        cDV: 0,
        tpAmb: 2,
        finNFe: 1,
        indFinal: 1,
        indPres: modelo === 55 ? 1 : 0,
        procEmi: 0,
        verProc: "1.0",
        dhEmi
      },
      emit: {
        CNPJ: empresa.cnpj,
        xNome: empresa.razaoSocial,
        xFant: empresa.nomeFantasia,
        enderEmit: {
          xLgr: empresa.logradouro,
          nro: empresa.numero,
          xBairro: empresa.bairro,
          cMun: empresa.codCidade,
          xMun: empresa.cidade,
          UF: empresa.uf,
          CEP: empresa.cep.replace(/\D/g, '')
        },
        IE: empresa.ie || "ISENTO",
      },
      dest: {
        CPF: cliente.cpf,
        xNome: cliente.nomeCompleto,
        enderDest: {
          xLgr: cliente.logradouro,
          nro: cliente.numero,
          xBairro: cliente.bairro,
          cMun: cliente.codCidade,
          xMun: cliente.cidade,
          UF: cliente.estado,
          CEP: cliente.cep.replace(/\D/g, ''),
          cPais: "1058",
          xPais: "BRASIL",
          fone: cliente.celular
        },
        indIEDest: 9,
        email: cliente.email
      },
      det: venda.produtos.map((p, index) => ({
        nItem: index + 1,
        prod: {
          cProd: p.referencia,
          cEAN: p.codigoBarras || "SEM GTIN",
          xProd: p.descricao,
          NCM: p.ncm.replace(/\D/g, ''),
          CFOP: "5102",
          uCom: p.unidadeMedida || "UN",
          qCom: Number(p.quantidade),
          vUnCom: Number(p.preco),
          vProd: +(p.quantidade * p.preco).toFixed(2),
          cEANTrib: p.codigoBarras || "SEM GTIN",
          uTrib: "UN",
          qTrib: Number(p.quantidade),
          vUnTrib: Number(p.preco),
          indTot: 1
        },
        imposto: {
          ICMS: {
            ICMSSN102: {
              orig: 0,
              CSOSN: "102"
            }
          },
          PIS: {
            PISOutr: {
              CST: "99",
              vBC: 0.00,
              pPIS: 0.00,
              vPIS: 0.00
            }
          },
          COFINS: {
            COFINSOutr: {
              CST: "99",
              vBC: 0.00,
              pCOFINS: 0.00,
              vCOFINS: 0.00
            }
          }
        }
      })),
      total: {
        ICMSTot: {
          vBC: 0.00,
          vICMS: 0.00,
          vICMSDeson: 0.00,
          vFCP: 0.00,
          vBCST: 0.00,
          vST: 0.00,
          vFCPST: 0.00,
          vFCPSTRet: 0.00,
          vProd: Number(venda.totais.totalProdutos),
          vFrete: Number(venda.totais.frete) || 0.00,
          vSeg: 0.00,
          vDesc: Number(venda.totais.desconto) || 0.00,
          vII: 0.00,
          vIPI: 0.00,
          vIPIDevol: 0.00,
          vPIS: 0.00,
          vCOFINS: 0.00,
          vOutro: 0.00,
          vNF: Number(venda.totais.total)
        }
      },
      transp: {
        modFrete: 9
      },
      pag: {
        detPag: venda.pagamentos.map((pag) => {
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

          let indPag = 2; 
          if (pag.parcela && pag.parcela > 1) {
            indPag = 1; 
          } else if (!pag.parcela || pag.parcela === 1) {
            indPag = 0; 
          }

          return {
            indPag,
            tPag,
            vPag: Number(pag.valor)
          };
        })
      },
      infAdic: {
        infCpl: infCpl.trim()
      }
    }
  };
}

module.exports = montarJsonNFe;
