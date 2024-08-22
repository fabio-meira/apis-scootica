const Vendedor = require('../models/Vendedor');

async function postVendedor(req, res) {
    try {
        const vendedorData = req.body;
        const { idEmpresa } = req.params; 
        const { cpf } = req.body; 

        const vendedorExists = await Vendedor.findOne({ 
            where: { 
                cpf: cpf,
                idEmpresa: idEmpresa 
            } 
        });

        if (vendedorExists) {
            return res.status(400).json({
                error: "Vendedor já cadastrado no sistema"
            });
        }
        
        // Adiciona o cpf como idVendedor no objeto vendedorData
        vendedorData.idMedico = vendedorData.registro;
        vendedorData.idEmpresa = idEmpresa;

        const vendedor = await Vendedor.create(vendedorData);

        res.status(201).json({ message: 'Vendedor cadastrado com sucesso', vendedor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar vendedor', error });
    }
}

async function listVendedores(req, res) {
    try {
        const { idEmpresa } = req.params; 
        const vendedor = await Vendedor.findAll({
            where: { 
                idEmpresa: idEmpresa 
            },
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(vendedor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar vendedores', error });
    }
}

async function getVendedor(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const vendedor = await Vendedor.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (!vendedor) {
            return res.status(404).json({ message: 'Vendedor não encontrado' });
        }

        res.status(200).json(vendedor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar vendedor', error });
    }
}

async function putVendedor(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const vendedorData = req.body; 

        // Atualiza o vendedor no banco de dados
        const [updated] = await Vendedor.update(vendedorData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (updated) {
            // Busca o vendedor atualizado para retornar na resposta
            const vendedor = await Vendedor.findByPk(id);
            res.status(200).json({ message: 'Vendedor atualizado com sucesso', vendedor });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Vendedor não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar vendedor', error });
    }
}

async function deleteVendedor(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta o médico no banco de dados
        const deleted = await Vendedor.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Vendedor deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Vendedor não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar vendedor', error });
    }
}


module.exports = {
    postVendedor,
    listVendedores,
    getVendedor,
    putVendedor,
    deleteVendedor
};