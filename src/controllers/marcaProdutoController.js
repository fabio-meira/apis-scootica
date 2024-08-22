const MarcaProduto = require('../models/MarcaProduto');

// Função para cadastrar um novo marca de produto
async function postMarcaProduto(req, res) {
    try {
        const MarcaProdutoData = req.body;
        const { idEmpresa } = req.params; 
        const { nome } = req.body; 

        const marcaProdutoExists = await MarcaProduto.findOne({ 
            where: { 
                nome: nome,
                idEmpresa: idEmpresa 
            } 
        });

        if (marcaProdutoExists) {
            return res.status(400).json({
                error: "Marca de produto já cadastrado no sistema"
            });
        }

        // Adiciona o idEmpresa ao objeto marcaProduto
        MarcaProdutoData.idEmpresa = idEmpresa;

        const marcaProduto = await MarcaProduto.create(MarcaProdutoData);

        res.status(201).json({ message: 'Marca de produto cadastrado com sucesso', marcaProduto });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar marca de produto', error });
    }
}

// função para consulta por todos os marca de produtos da empresa
async function listMarcaProduto(req, res) {
    try {
        const { idEmpresa } = req.params; 
        const marcaProduto = await MarcaProduto.findAll({
            where: { 
                idEmpresa: idEmpresa 
            },
            order: [
                ['id', 'DESC']
            ]
        });
        
        if (!marcaProduto || marcaProduto.length === 0) {
            return res.status(404).json({ message: 'Marca de produto não encontrado' });
        }

        res.status(200).json(marcaProduto);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar marca de produto', error });
    }
}

// Função para consulta de marca de produto por id
async function getMarcaProduto(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const marcaProduto = await MarcaProduto.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (!marcaProduto) {
            return res.status(404).json({ message: 'Marca de produto não encontrado' });
        }

        res.status(200).json(marcaProduto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar marca de produto', error });
    }
}

// Função para atualizar um marca de produto por id
async function putMarcaProduto(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const MarcaProdutoData = req.body; 

        // Atualiza o marca de produto no banco de dados
        const [updated] = await MarcaProduto.update(MarcaProdutoData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (updated) {
            // Busca o marca de produto atualizado para retornar na resposta
            const marcaProduto = await MarcaProduto.findOne({ where: { idEmpresa, id } });
            res.status(200).json({ message: 'Marca de produto atualizado com sucesso', marcaProduto });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Marca de produto não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar marca de produto', error });
    }
}

// Função para deletar uma marca de produto pelo id
async function deleteMarcaProduto(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deletar a marca de produto no banco de dados
        const deleted = await MarcaProduto.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Marca de produto deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Marca de produto não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar marca de produto', error });
    }
}

module.exports = {
    postMarcaProduto,
    listMarcaProduto,
    getMarcaProduto,
    putMarcaProduto,
    deleteMarcaProduto
};
