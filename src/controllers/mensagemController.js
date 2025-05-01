const Mensagem = require('../models/Mensagem');
const Mesangem = require('../models/Mensagem');


// Função para cadastrar um nova mensagem
async function postMensagem(req, res) {
    try {
        const mensagemData = req.body;
        const { idEmpresa } = req.params; 

        // Adiciona o idEmpresa como idEmpresa no objeto origemData
        mensagemData.idEmpresa = idEmpresa;

        const mensagem = await Mensagem.create(mensagemData);

        res.status(201).json({ message: 'Mensagem cadastrada com sucesso', mensagem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar mensagem', error });
    }
}

// função para consulta por todoas mensagens não lidas
async function listMensagem(req, res) {
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

        const mensagem = await Mensagem.findAll({
            where: whereConditions,
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(mensagem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar mensgem', error });
    }
}

// Função para consulta de mensagem por id
async function getMensagem(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        const mensagem = await Mensagem.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (!mensagem) {
            return res.status(404).json({ message: 'Mensagem não encontrada' });
        }

        res.status(200).json(mensagem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar mensagem', error });
    }
}

// Função para atualizar uma mensagem
async function putMensagem(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const mensagemData = req.body; 

        // Atualiza a mensagem no banco de dados
        const [updated] = await Mensagem.update(mensagemData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (updated) {
            // Busca a mensagem atualizado para retornar na resposta
            const mensagem = await Mensagem.findByPk(id);
            res.status(200).json({ message: 'Mensagem atualizada com sucesso', mensagem });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Mensagem não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar mensagem', error });
    }
}

// Função para deletar uma mensagem por id
async function deleteMensagem(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta a mensagem no banco de dados
        const deleted = await Mensagem.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Mensagem deletada com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Mensagem não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar mensagem', error });
    }
}

module.exports = {
    postMensagem,
    listMensagem,
    getMensagem,
    putMensagem,
    deleteMensagem
};