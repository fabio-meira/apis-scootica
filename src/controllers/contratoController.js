const Contrato = require('../models/Contrato');
const { Op } = require('sequelize');
const Mensagem = require('../models/Mensagem');
const nodemailer = require('nodemailer');
const qrcode = require('qrcode');
const crc = require('crc');
const sequelize = require('../database/connection');


// Função para cadastrar um novo contrato
async function postContrato(req, res) {
    const transaction = await sequelize.transaction(); 
    try {
        const contratoData = req.body;
        const { idEmpresa } = req.params; 

        // Adiciona o idEmpresa como idEmpresa no objeto contratoData
        contratoData.idEmpresa = idEmpresa;

        const contrato = await Contrato.create(contratoData, { transaction });

        await transaction.commit(); 

        res.status(201).json({ message: 'Contrato cadastrado com sucesso', contrato });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar contrato', error });
    }
}

// função para consulta por todos contratos
async function listContrato(req, res) {
    try {
        const { idEmpresa } = req.params; 
        const { lida } = req.query;

        // Construa o objeto de filtro
        const whereConditions = {
            idEmpresa: idEmpresa
        };
  
        if (lida !== undefined) {
            whereConditions.lida = lida === 'true'; // converte string para boolean
        }

        const contrato = await Contrato.findAll({
            where: whereConditions,
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(contrato);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar contrato', error });
    }
}

// Função para consulta de contrato por id
async function getContrato(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        const contrato = await Contrato.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (!contrato) {
            return res.status(404).json({ message: 'Contrato não encontrado' });
        }

        res.status(200).json(contrato);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar contrato', error });
    }
}

// Função para atualizar um contrato
async function putContrato(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const contratoData = req.body; 

        // Atualiza um contrato no banco de dados
        const [updated] = await Contrato.update(contratoData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (updated) {
            // Busca o contrato atualizado para retornar na resposta
            const contrato = await Contrato.findByPk(id);
            res.status(200).json({ message: 'Contrato atualizado com sucesso', contrato });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Contrato não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar contrato', error });
    }
}

// Função para deletar uma mensagem por id
async function deleteContrato(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta a mensagem no banco de dados
        const deleted = await Contrato.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Contrato deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Contrato não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar contrato', error });
    }
}

// Função para normalizar a data para o início do dia no horário local (GMT-3)
function normalizarParaInicioDoDiaLocal(data) {
    const dataLocal = new Date(data);
    // Define a hora para 00:00:00 no horário local
    dataLocal.setHours(0, 0, 0, 0); 
    return dataLocal;
}
  
async function validarContratos(req, res) {
    const transaction = await sequelize.transaction(); 
    try {
      const { idEmpresa, date } = req.params;
  
      if (!date) {
        return res.status(400).json({ message: 'Data de referência é obrigatória (formato: YYYY-MM-DD).' });
      }
  
      // Converte a data de referência para o horário local (GMT-3)
      const dataBase = normalizarParaInicioDoDiaLocal(`${date} 00:00:00-03:00`);
      console.log('dataBase: ', dataBase);
  
      const contratos = await Contrato.findAll({
        where: {
          ativo: true,
          pagamentoConfirmado: false,
          dtPagamento: {
            [Op.not]: null
          }
        }
      });
  
      const mensagensCriadas = [];
      console.log('date: ', date);
  
      for (const contrato of contratos) {
        // Normaliza a data de pagamento para o início do dia no horário local (GMT-3)
        const vencimento = normalizarParaInicioDoDiaLocal(new Date(contrato.dtPagamento));
        const fimAvaliacao = normalizarParaInicioDoDiaLocal(new Date(contrato.fimAvaliacao));
        const valor = Number(contrato.valorPlano || 0).toFixed(2);
  
        const diffDias = Math.ceil((vencimento - dataBase) / (1000 * 60 * 60 * 24));
        const diffDiasFree = Math.ceil((fimAvaliacao - dataBase) / (1000 * 60 * 60 * 24));
  
        // Validar dias de vencimento 5 e 10 e criar uma mensagem
        if (diffDias === 10 || diffDias === 5 || diffDias === 5) {
          const diasTexto = diffDias === 10 ? '10 dias' : '5 dias';
          const msg = `${contrato.nome}, sua mensalidade vence em ${diasTexto}, com o valor de R$ ${contrato.valorPlano}`;
  
          const novaMensagem = await Mensagem.create({
            idEmpresa: contrato.idEmpresa,
            chave: `Contrato`,
            mensagem: msg,
            lida: false,
            observacoes: `Contrato com vencimento em ${vencimento.toLocaleDateString('pt-BR')}.`
          }, { transaction } );
  
          mensagensCriadas.push(novaMensagem);
        }

        // Validar dias de avaliação
        if (diffDiasFree === 10 || diffDias === 5) {
        const diasTexto = diffDiasFree === 10 ? '10 dias' : '5 dias';
        const msg = `${contrato.nome}, sua avaliação termina em ${diasTexto}. Após essa data, será cobrado, mensalmente, o valor de R$ ${contrato.valorPlano}`;

        const novaMensagem = await Mensagem.create({
            idEmpresa: contrato.idEmpresa,
            chave: `Avaliação`,
            mensagem: msg,
            lida: false,
            observacoes: `Avaliação com vencimento em ${fimAvaliacao.toLocaleDateString('pt-BR')}.`
        }, { transaction } );

        mensagensCriadas.push(novaMensagem);
        }

        // Validar dias para gear boleto de pagamento
        if (diffDias === 10 && !contrato.boletoEnviado) {
            await gerarEEnviarPix(contrato);

            // Cria registro de mensagem
            const novaMensagem = await Mensagem.create({
                idEmpresa: contrato.idEmpresa,
                chave: `PIX`,
                mensagem: `PIX enviado para ${contrato.email}, valor R$ ${contrato.valorPlano}`,
                lida: false,
                observacoes: `PIX gerado com vencimento em ${new Date(contrato.dtPagamento).toLocaleDateString('pt-BR')}.`
              }, { transaction } );

              mensagensCriadas.push(novaMensagem);
        }
      }

      await transaction.commit(); 
  
      res.status(200).json({
        message: 'Validação concluída',
        mensagensCriadas
      });
  
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao validar contratos:', error);
      res.status(500).json({ message: 'Erro ao validar contratos', error });
    }
  }

// Função auxiliar que gera o código EMVCo (payload do QR Code)
function gerarPayloadPix({ chave, nome, cidade, valor, txid }) {
    if (!chave || !nome || !cidade || !valor) {
      throw new Error("Todos os parâmetros devem ser fornecidos: chave, nome, cidade, valor.");
    }
  
    nome = nome.substring(0, 25);
    cidade = cidade.substring(0, 15);
  
    function format(id, value) {
      const size = value.length.toString().padStart(2, '0');
      return `${id}${size}${value}`;
    }
  
    const merchantAccountInfo =
      format('00', 'BR.GOV.BCB.PIX') +
      format('01', chave);
  
    const additionalDataField =
      format('05', txid || '***');
  
    const payloadSemCRC =
      format('00', '01') +
      format('26', merchantAccountInfo) +
      format('52', '0000') +
      format('53', '986') +
      format('54', valor.toFixed(2).replace(',', '.')) +
      format('58', 'BR') +
      format('59', nome) +
      format('60', cidade) +
      format('62', additionalDataField);
  
    const crc16 = crc.crc16ccitt(Buffer.from(payloadSemCRC + '6304', 'utf8'))
      .toString(16)
      .toUpperCase()
      .padStart(4, '0');
  
    return payloadSemCRC + '6304' + crc16;
  }
async function gerarEEnviarPix(contrato) {
    // const transaction = await sequelize.transaction(); 
    try {

      if (!contrato || !contrato.valorPlano || !contrato.email || !contrato.id || !contrato.nome) {
        throw new Error("Contrato incompleto. Verifique os dados antes de continuar.");
        }
      // 1. Gerar payload PIX
      const payload = gerarPayloadPix({
        chave: 'fabio.meira@fabester.com.br',
        nome: 'F.F.Meira Desenvolvimento de Software Ltda',
        cidade: 'OSASCO',
        valor: parseFloat(contrato.valorPlano),
        txid: `OPT${contrato.id}`
      });
  
    //   const codigoPix = payload.payload;
  
      // 2. Gerar imagem do QR Code
      const bufferQRCode = await qrcode.toBuffer(payload);
  
      // 3. Enviar e-mail
      const transporter = nodemailer.createTransport({
        host: 'email-ssl.com.br',
        port: 465,
        secure: true,
        auth: {
          user: 'contato@fabester.com.br',
          pass: 'Ester@21032014',
        },
      });
  
      await transporter.sendMail({
        from: '"Optware" <contato@fabester.com.br>',
        to: contrato.email,
        subject: 'PIX para pagamento do contrato',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; text-align: center;">
          <img src="/img/optware_preto.png" alt="Optware" style="max-width: 150px; margin-bottom: 20px;" />  
          <h1 style="color: #7F5539; font-size: 24px;">Optware - Software de Óticas</h1>
            <h2 style="color: #333; font-size: 20px;">Pagamento via PIX</h2>
            <p style="font-size: 16px; color: #555;">Olá <strong>${contrato.nome}</strong>,</p>
            <p style="font-size: 16px; color: #555;">Valor do plano: <strong>R$ ${parseFloat(contrato.valorPlano).toFixed(2)}</strong></p>
            <img src="cid:qrcode" alt="PIX QR Code" style="max-width: 250px; margin: 20px 0;" />
            <p style="font-size: 14px; color: #777;">Ou copie e cole o código abaixo no seu aplicativo bancário:</p>
            <div style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; font-size: 14px;">${payload}</div>
          </div>
        `,
        attachments: [
          {
            filename: 'qrcode.png',
            content: bufferQRCode,
            cid: 'qrcode',
          },
        ],
      });
  
      contrato.boletoEnviado = true;
      await contrato.save();
  
    //   console.log(`✅ PIX enviado com sucesso para ${contrato.email}`);
    } catch (error) {
      console.error('❌ Erro ao gerar ou enviar PIX:', error);
    }
  }

module.exports = {
    postContrato,
    listContrato,
    getContrato,
    putContrato,
    deleteContrato,
    validarContratos
};