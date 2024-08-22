const Empresa = require('../models/Empresa');

async function postEmpresa(req, res) {
    try {
        const empresaData = req.body;
        const { idEmpresa } = req.body; 
        const { cnpj } = req.body; 

        // Verificar se empresa já está cadastrada
        const empresaExists = await Empresa.findOne({ 
            where: { 
                cnpj: cnpj,
                idEmpresa: idEmpresa 
            } 
        });

        if (empresaExists) {
            return res.status(400).json({
                error: "Empresa já cadastrado no sistema"
            });
        }

        // Adiciona o idEmpresa como idEmpresa no objeto empresaData
        empresaData.idEmpresa = idEmpresa;

        const empresa = await Empresa.create(empresaData);

        res.status(201).json({ message: 'Empresa cadastrado com sucesso', empresa });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar empresa', error });
    }
}

async function listEmpresas(req, res) {
    try {
        const { idEmpresa } = req.params; 
        const empresa = await Empresa.findAll();

        res.status(200).json(empresa);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar empresa', error });
    }
}

// Função para consulta de empresa por id
async function getByIdEmpresa(req, res) {
    try {
        const { id } = req.params; 

        const empresa = await Empresa.findOne({
            where: { 
                id: id 
            }
        });

        if (!empresa) {
            return res.status(404).json({ message: 'Empresa não encontrado' });
        }

        res.status(200).json(empresa);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar empresa', error });
    }
}

// Função para consulta de empresa por cnpj
async function getEmpresa(req, res) {
    try {
        const { cnpj } = req.params; 

        const empresa = await Empresa.findOne({
            where: { 
                cnpj: cnpj
            }
        });

        if (!empresa) {
            return res.status(404).json({ message: 'Emrpesa não encontrado' });
        }

        res.status(200).json(empresa);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar empresa', error });
    }
}

// Função para consulta de empresa por cnpj
async function getIdEmpresa(req, res) {
    try {
        const { idEmpresa } = req.params; 

        const empresa = await Empresa.findOne({
            where: { 
                idEmpresa: idEmpresa
            }
        });

        if (!empresa) {
            return res.status(404).json({ message: 'Emrpesa não encontrado' });
        }

        res.status(200).json(empresa);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar empresa', error });
    }
}

async function putEmpresa(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const empresaData = req.body; 

        // Atualiza a empresa no banco de dados
        const [updated] = await Empresa.update(empresaData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (updated) {
            // Busca a empresa atualizado para retornar na resposta
            const empresa = await Empresa.findByPk(id);
            res.status(200).json({ message: 'Empresa atualizada com sucesso', empresa });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Empresa não encontrada' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar empresa', error });
    }
}

async function deleteEmpresa(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        const deleted = await Empresa.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Empresa deletada com sucesso' });
        } else {
            res.status(404).json({ message: 'Empresa não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar empresa', error });
    }
}

module.exports = {
    postEmpresa,
    listEmpresas,
    getEmpresa,
    getByIdEmpresa,
    getIdEmpresa,
    putEmpresa,
    deleteEmpresa
};