const FormaRecebimento = require('../models/FormaRecebimento');
const ParametrosJuros = require('../models/parametrosJuros');
const Banco = require('../models/Banco')

// Função para cadastrar nova forma de recebimento
async function postFormaRecebimento(req, res) {
    try {
        const formaData = req.body;
        const { idEmpresa } = req.params; 
        const { descricao } = req.body; 
        const { idBanco } = req.body; 
        const { tipoRecebimento } = req.body;
        const { parcelas = [] } = req.body;

        // Verificar se forma de recebimento já está cadastrado
        const formaExists = await FormaRecebimento.findOne({ 
            where: { 
                descricao: descricao,
                idBanco: idBanco,
                idEmpresa: idEmpresa 
            } 
        });

        if (formaExists) {
            return res.status(400).json({
                error: "Forma de recebimento já cadastrado no sistema"
            });
        }

        // Adiciona o idEmpresa como idEmpresa no objeto formaData
        formaData.idEmpresa = idEmpresa;

        const formaRecebimento = await FormaRecebimento.create(formaData);

        // Se tipoRecebimento for CREDIARIO, salva parcelas
        if (tipoRecebimento === 'Crediário' && Array.isArray(parcelas) && parcelas.length > 0) {
        const parametrosToCreate = parcelas.map(parcela => ({
            idEmpresa: idEmpresa,
            idFormaPagamento: formaRecebimento.id,
            quantidadeParcelas: parcela.qtdParcelas,
            jurosMensal: parcela.jurosMensal,
            ativo: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        await ParametrosJuros.bulkCreate(parametrosToCreate);
        }

        res.status(201).json({ message: 'Forma de recebimento cadastrada com sucesso', formaRecebimento });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar forma de recebimento', error });
    }
}

// função para consulta por todas as formas de recebimento da empresa
async function listFormaRecebimento(req, res) {
    try {
        const { idEmpresa } = req.params; 

        const formaRecebimento = await FormaRecebimento.findAll({
            where: { 
                idEmpresa: idEmpresa 
            },
            include: [
                { 
                    model: Banco, 
                    as: 'banco',
                    attributes: ['codigoBanco', 'nomeBanco', 'nome'] 
                },
                {
                    model: ParametrosJuros,
                    as: 'parametrosJuros', 
                    attributes: ['quantidadeParcelas', 'jurosMensal', 'ativo']
                }
            ],
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(formaRecebimento);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar forma de recebimento', error });
    }
}

// Função para consulta por id de forma de recebimento
async function getFormaRecebimento(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        const formaRecebimento = await FormaRecebimento.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            },
            include: [
                { 
                    model: Banco, 
                    as: 'banco',
                    attributes: ['codigoBanco', 'nomeBanco', 'nome'] 
                },
                {
                    model: ParametrosJuros,
                    as: 'parametrosJuros', 
                    attributes: ['quantidadeParcelas', 'jurosMensal', 'ativo']
                }
            ]
        });

        if (!formaRecebimento) {
            return res.status(404).json({ message: 'Forma de recebimento não encontrada' });
        }

        res.status(200).json(formaRecebimento);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar forma de recebimento', error });
    }
}

// Função para atualizar uma forma de recebimento
async function putFormaRecebimento(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const formaData = req.body; 

        // Atualiza a forma de recebimento no banco de dados
        const [updated] = await FormaRecebimento.update(formaData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (updated) {
            // Busca a forma de recebimento atualizado para retornar na resposta
            const formaRecebimento = await FormaRecebimento.findByPk(id);
            res.status(200).json({ message: 'Forma de recebimento atualizado com sucesso', formaRecebimento });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Forma de recebimento não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar forma de recebimento', error });
    }
}

// Função para deletar uma forma de recebimento por id
async function deleteFormaRecebimento(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta o forma de recebimento no banco de dados
        const deleted = await FormaRecebimento.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Forma de recebimento deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Forma de recebimento não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar forma de recebimento', error });
    }
}

module.exports = {
    postFormaRecebimento,
    listFormaRecebimento,
    getFormaRecebimento,
    putFormaRecebimento,
    deleteFormaRecebimento
};