const Categoria = require('../models/Categoria');


// Função para cadastrar um nova categoria
async function postCategoria(req, res) {
    try {
        const categoriaData = req.body;
        const { idEmpresa } = req.params; 
        const { descricao } = req.body; 

        // Verificar se categoria já está cadastrado
        const categoriaExists = await Categoria.findOne({ 
            where: { 
                descricao: descricao,
                idEmpresa: idEmpresa 
            } 
        });

        if (categoriaExists) {
            return res.status(400).json({
                error: "Categoria já cadastrado no sistema"
            });
        }

        // Adiciona o idEmpresa como idEmpresa no objeto categoriaData
        categoriaData.idEmpresa = idEmpresa;

        const categoria = await Categoria.create(categoriaData);

        res.status(201).json({ message: 'Categoria cadastrado com sucesso', categoria });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar categoria', error });
    }
}

// função para consulta por todos os categoria da empresa
async function listCategoria(req, res) {
    try {
        const { idEmpresa } = req.params; 

        const categoria = await Categoria.findAll({
            where: { 
                idEmpresa: idEmpresa 
            },
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(categoria);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar categoria', error });
    }
}

// Função para consulta de categoria por id
async function getCategoria(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        const categoria = await Categoria.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (!categoria) {
            return res.status(404).json({ message: 'Categoria não encontrado' });
        }

        res.status(200).json(categoria);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar categoria', error });
    }
}

// Função para atualizar um categoria
async function putCategoria(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const categoriaData = req.body; 

        // Atualiza o categoria no banco de dados
        const [updated] = await Categoria.update(categoriaData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (updated) {
            // Busca a categoria atualizado para retornar na resposta
            const categoria = await Categoria.findByPk(id);
            res.status(200).json({ message: 'Categoria atualizado com sucesso', categoria });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Categoria não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar categoria', error });
    }
}

// Função para deletar um categoria por id
async function deleteCategoria(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta o categoria no banco de dados
        const deleted = await Categoria.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Categoria deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Categoria não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar categoria', error });
    }
}

module.exports = {
    postCategoria,
    listCategoria,
    getCategoria,
    putCategoria,
    deleteCategoria
};