const Laboratorio = require('../models/Laboratorio');


// Função para cadastrar um novo laboratório
async function postLaboratorio(req, res) {
    try {
        const laboratorioData = req.body;
        const { idEmpresa } = req.params; 
        const { cnpj } = req.body; 

        const laboratorioExists = await Laboratorio.findOne({ 
            where: { 
                cnpj: cnpj,
                idEmpresa: idEmpresa 
            } 
        });

        if (laboratorioExists) {
            return res.status(400).json({
                error: "Laboratório já cadastrado no sistema"
            });
        }

        // Adiciona o cpf como idMedico no objeto medicoData
        laboratorioData.idEmpresa = idEmpresa;
        laboratorioData.idLaboratorio = cnpj;

        const laboratorio = await Laboratorio.create(laboratorioData);

        res.status(201).json({ message: 'Laboratório cadastrado com sucesso', laboratorio });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar laboratório', error });
    }
}

// função para consulta por todos os laboratórios da empresa
async function listLaboratorio(req, res) {
    try {
        const { idEmpresa } = req.params; 
        const laboratorio = await Laboratorio.findAll({
            where: { 
                idEmpresa: idEmpresa 
            },
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(laboratorio);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar laboratórios', error });
    }
}

// Função para consulta de laboratório por cpf
async function getLaboratorio(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const laboratorio = await Laboratorio.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (!laboratorio) {
            return res.status(404).json({ message: 'Laboratório não encontrado' });
        }

        res.status(200).json(laboratorio);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar laboratório', error });
    }
}

// Função para atualizar um laboratório
async function putLaboratorio(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const laboratorioData = req.body; 

        // Atualiza o laboratório no banco de dados
        const [updated] = await Laboratorio.update(laboratorioData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (updated) {
            // Busca o laboratório atualizado para retornar na resposta
            const laboratorio = await Laboratorio.findByPk(id);
            res.status(200).json({ message: 'Laboratório atualizado com sucesso', laboratorio });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Laboratório não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar laboratório', error });
    }
}

// Função para deletar um laboratório pelo CPF
async function deleteLaboratorio(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta o laboratório no banco de dados
        const deleted = await Laboratorio.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Laboratório deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'laboratório não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar laboratório', error });
    }
}


module.exports = {
    postLaboratorio,
    listLaboratorio,
    getLaboratorio,
    putLaboratorio,
    deleteLaboratorio
};