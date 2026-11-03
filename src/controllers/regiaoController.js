const { Op } = require('sequelize');
const Regiao = require('../models/Regiao');

const getPayload = (body = {}) => ({
  nome: String(body.nome || '').trim(),
  descricao: body.descricao ? String(body.descricao).trim() : null,
  ativo: body.ativo === undefined ? true : Boolean(body.ativo),
});

async function postRegiao(req, res) {
  try {
    const { idEmpresa } = req.params;
    const payload = getPayload(req.body);

    if (!payload.nome) {
      return res.status(400).json({ message: 'Informe o nome da região.' });
    }

    const exists = await Regiao.findOne({ where: { idEmpresa, nome: payload.nome } });
    if (exists) {
      return res.status(400).json({ message: 'Região já cadastrada no sistema.' });
    }

    const regiao = await Regiao.create({ ...payload, idEmpresa });
    return res.status(201).json({ message: 'Região cadastrada com sucesso.', regiao });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao cadastrar região.', error });
  }
}

async function listRegioes(req, res) {
  try {
    const { idEmpresa } = req.params;
    const where = { idEmpresa };
    const search = String(req.query.search || '').trim();

    if (search) {
      where[Op.or] = [
        { nome: { [Op.like]: `%${search}%` } },
        { descricao: { [Op.like]: `%${search}%` } },
      ];
    }

    const regioes = await Regiao.findAll({ where, order: [['nome', 'ASC']] });
    return res.status(200).json(regioes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar regiões.', error });
  }
}

async function getRegiao(req, res) {
  try {
    const regiao = await Regiao.findOne({
      where: { idEmpresa: req.params.idEmpresa, id: req.params.id },
    });

    if (!regiao) return res.status(404).json({ message: 'Região não encontrada.' });
    return res.status(200).json(regiao);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar região.', error });
  }
}

async function putRegiao(req, res) {
  try {
    const { idEmpresa, id } = req.params;
    const payload = getPayload(req.body);

    if (!payload.nome) {
      return res.status(400).json({ message: 'Informe o nome da região.' });
    }

    const exists = await Regiao.findOne({
      where: { idEmpresa, nome: payload.nome, id: { [Op.ne]: id } },
    });
    if (exists) return res.status(400).json({ message: 'Região já cadastrada no sistema.' });

    const [updated] = await Regiao.update(payload, { where: { idEmpresa, id } });
    if (!updated) return res.status(404).json({ message: 'Região não encontrada.' });

    const regiao = await Regiao.findOne({ where: { idEmpresa, id } });
    return res.status(200).json({ message: 'Região atualizada com sucesso.', regiao });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao atualizar região.', error });
  }
}

async function deleteRegiao(req, res) {
  try {
    const deleted = await Regiao.destroy({
      where: { idEmpresa: req.params.idEmpresa, id: req.params.id },
    });

    if (!deleted) return res.status(404).json({ message: 'Região não encontrada.' });
    return res.status(200).json({ message: 'Região excluída com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao excluir região.', error });
  }
}

module.exports = {
  postRegiao,
  listRegioes,
  getRegiao,
  putRegiao,
  deleteRegiao,
};
