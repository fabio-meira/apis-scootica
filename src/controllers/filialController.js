const Filial = require('../models/Filial');


// Função para cadastrar um novo laboratório
async function postFilial(req, res) {
    try {
        const filialData = req.body;
        const { idEmpresa } = req.params; 
        const { cnpj } = req.body; 
        const { idFilial } = req.body; 

        const filialExists = await Filial.findOne({ 
            where: { 
                idFilial: idFilial,
                cnpj: cnpj,
                idEmpresa: idEmpresa 
            } 
        });

        if (filialExists) {
            return res.status(400).json({
                error: "Filial já cadastrada no sistema"
            });
        }

        // Adiciona o idFilial como código da filial
        filialData.idEmpresa = idEmpresa;
        filialData.idFilial = idFilial;

        const filial = await Filial.create(filialData);

        res.status(201).json({ message: 'Filial cadastrada com sucesso', filial });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar filial', error });
    }
}

// função para consulta por todos as filiais da empresa
async function listFilial(req, res) {
    try {
        const { idEmpresa } = req.params; 
        const filial = await Filial.findAll({
            where: { 
                idEmpresa: idEmpresa 
            },
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(filial);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar Filiais', error });
    }
}

// Função para consulta de filial pelo idFilial
async function getFilial(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const filial = await Filial.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (!filial) {
            return res.status(404).json({ message: 'Filial não encontrada' });
        }

        res.status(200).json(filial);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar filial', error });
    }
}

// Função para atualizar uma filial
async function putFilial(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const filialData = req.body; 

        // Atualiza a filial no banco de dados
        const [updated] = await Filial.update(filialData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (updated) {
            // Busca uma filial atualizado para retornar na resposta
            const filial = await Filial.findByPk(id);
            res.status(200).json({ message: 'Filial atualizado com sucesso', filial });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Filial não encontrada' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar filial', error });
    }
}

// Função para deletar um filial pelo id
async function deleteFilial(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta a filial no banco de dados
        const deleted = await Filial.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Filial deletada com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Filial não encontrada' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar filial', error });
    }
}


module.exports = {
    postFilial,
    listFilial,
    getFilial,
    putFilial,
    deleteFilial
};