// Codigo legado de metas removido do fluxo ativo.
// O controller abaixo usa o novo modelo MetaEmpresa -> MetaFilial -> MetaVendedor.

const { Op, fn, col } = require('sequelize');
const sequelize = require('../database/connection');

const MetaEmpresa = require('../models/MetaEmpresa');
const MetaFilial = require('../models/MetaFilial');
const MetaVendedor = require('../models/MetaVendedor');
const Empresa = require('../models/Empresa');
const Filial = require('../models/Filial');
const Vendedor = require('../models/Vendedor');
const Venda = require('../models/Venda');

const MAX_LIST_LIMIT = 100;

function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
}

function roundCurrency(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    return Number(parsed.toFixed(2));
}

function sameCurrency(a, b) {
    return Math.abs(roundCurrency(a) - roundCurrency(b)) <= 0.01;
}

function formatDateOnly(value) {
    if (!value) return null;
    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) return null;

        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    return String(value).slice(0, 10);
}

function normalizeDateOnly(value) {
    if (!value) return null;

    const normalized = formatDateOnly(value);
    if (!normalized) return null;
    const [year, month, day] = normalized.split('-').map(Number);

    if (!year || !month || !day) return null;

    return normalized;
}

function normalizeDateStart(value) {
    if (!value) return null;
    const normalized = normalizeDateOnly(value);
    if (!normalized) return null;
    const [year, month, day] = normalized.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function normalizeDateEnd(value) {
    if (!value) return null;
    const normalized = normalizeDateOnly(value);
    if (!normalized) return null;
    const [year, month, day] = normalized.split('-').map(Number);
    return new Date(year, month - 1, day, 23, 59, 59, 999);
}

function getMetaStatus(meta, referenceDate = new Date()) {
    const start = normalizeDateOnly(meta.startDate);
    const end = normalizeDateOnly(meta.endDate);
    const reference = normalizeDateOnly(referenceDate);

    if (reference < start) return 'nao iniciada';
    if (reference > end) return 'encerrada';
    return 'vigente';
}

function buildPeriodoConflitWhere({ idEmpresa, startDate, endDate, excludeId }) {
    const start = normalizeDateOnly(startDate);
    const end = normalizeDateOnly(endDate);

    const where = {
        idEmpresa,
        [Op.and]: [
            { startDate: { [Op.lte]: end } },
            { endDate: { [Op.gte]: start } }
        ]
    };

    if (excludeId) {
        where.id = { [Op.ne]: excludeId };
    }

    return where;
}

function buildPeriodoFiltroWhere(startDate, endDate) {
    const where = {};
    const start = normalizeDateOnly(startDate);
    const end = normalizeDateOnly(endDate);

    if (start && end) {
        where[Op.and] = [
            { startDate: { [Op.lte]: end } },
            { endDate: { [Op.gte]: start } }
        ];
        return where;
    }

    if (start) {
        where.endDate = { [Op.gte]: start };
    }

    if (end) {
        where.startDate = { [Op.lte]: end };
    }

    return where;
}

function validarPayloadMeta(payload) {
    const errors = [];

    if (!payload.startDate) {
        errors.push('startDate é obrigatório.');
    }

    if (!payload.endDate) {
        errors.push('endDate é obrigatório.');
    }

    if (payload.startDate && payload.endDate) {
        const start = normalizeDateOnly(payload.startDate);
        const end = normalizeDateOnly(payload.endDate);

        if (end < start) {
            errors.push('endDate não pode ser menor que startDate.');
        }
    }

    if (!(toNumber(payload.metaEmpresa) > 0)) {
        errors.push('metaEmpresa deve ser maior que zero.');
    }

    if (!Array.isArray(payload.filiais) || payload.filiais.length === 0) {
        errors.push('A meta deve possuir ao menos uma filial.');
    }

    const filialIds = new Set();
    const vendedorIds = new Set();

    if (Array.isArray(payload.filiais)) {
        let totalFiliais = 0;

        payload.filiais.forEach((filial, index) => {
            const filialLabel = `filiais[${index}]`;

            if (!filial.idFilial) {
                errors.push(`${filialLabel}.idFilial é obrigatório.`);
            }

            if (!(toNumber(filial.meta) > 0)) {
                errors.push(`${filialLabel}.meta deve ser maior que zero.`);
            }

            if (filial.idFilial) {
                const filialKey = String(filial.idFilial);
                if (filialIds.has(filialKey)) {
                    errors.push(`A filial ${filial.idFilial} foi informada mais de uma vez.`);
                }
                filialIds.add(filialKey);
            }

            if (!Array.isArray(filial.vendedores) || filial.vendedores.length === 0) {
                errors.push(`${filialLabel}.vendedores deve possuir ao menos um vendedor.`);
            }

            let totalVendedores = 0;

            if (Array.isArray(filial.vendedores)) {
                filial.vendedores.forEach((vendedor, vendedorIndex) => {
                    const vendedorLabel = `${filialLabel}.vendedores[${vendedorIndex}]`;

                    if (!vendedor.idVendedor) {
                        errors.push(`${vendedorLabel}.idVendedor é obrigatório.`);
                    }

                    if (!(toNumber(vendedor.meta) > 0)) {
                        errors.push(`${vendedorLabel}.meta deve ser maior que zero.`);
                    }

                    if (vendedor.idVendedor) {
                        const vendedorKey = String(vendedor.idVendedor);
                        if (vendedorIds.has(vendedorKey)) {
                            errors.push(`O vendedor ${vendedor.idVendedor} foi informado mais de uma vez na meta.`);
                        }
                        vendedorIds.add(vendedorKey);
                    }

                    totalVendedores += roundCurrency(vendedor.meta);
                });
            }

            totalFiliais += roundCurrency(filial.meta);

            if (Array.isArray(filial.vendedores) && !sameCurrency(totalVendedores, filial.meta)) {
                errors.push(`A soma das metas dos vendedores da filial ${filial.idFilial} deve ser igual à meta da filial.`);
            }
        });

        if (!sameCurrency(totalFiliais, payload.metaEmpresa)) {
            errors.push('A soma das metas das filiais deve ser igual à metaEmpresa.');
        }
    }

    return errors;
}

async function validarEmpresa(idEmpresa, transaction) {
    const empresa = await Empresa.findOne({
        where: { idEmpresa },
        attributes: ['idEmpresa', 'nome'],
        transaction
    });

    if (!empresa) {
        const error = new Error('Empresa não encontrada.');
        error.status = 404;
        throw error;
    }

    return empresa;
}

async function validarRelacionamentos(idEmpresa, filiais, transaction) {
    const filialIds = filiais.map(filial => String(filial.idFilial));
    const vendedoresPayload = filiais.flatMap(filial => filial.vendedores.map(vendedor => ({
        ...vendedor,
        idFilial: String(filial.idFilial)
    })));
    const vendedorIds = vendedoresPayload.map(vendedor => Number(vendedor.idVendedor));

    const filiaisDb = await Filial.findAll({
        where: {
            idEmpresa,
            idFilial: { [Op.in]: filialIds }
        },
        attributes: ['idFilial', 'nomeFantasia'],
        transaction
    });

    if (filiaisDb.length !== filialIds.length) {
        const found = new Set(filiaisDb.map(filial => String(filial.idFilial)));
        const missing = filialIds.filter(idFilial => !found.has(String(idFilial)));

        const error = new Error(`Filiais não encontradas para a empresa: ${missing.join(', ')}.`);
        error.status = 422;
        throw error;
    }

    const vendedoresDb = await Vendedor.findAll({
        where: {
            idEmpresa,
            id: { [Op.in]: vendedorIds }
        },
        attributes: ['id', 'idFilial', 'nomeCompleto'],
        transaction
    });

    if (vendedoresDb.length !== vendedorIds.length) {
        const found = new Set(vendedoresDb.map(vendedor => Number(vendedor.id)));
        const missing = vendedorIds.filter(idVendedor => !found.has(Number(idVendedor)));

        const error = new Error(`Vendedores não encontrados para a empresa: ${missing.join(', ')}.`);
        error.status = 422;
        throw error;
    }

    const vendedoresMap = new Map(
        vendedoresDb.map(vendedor => [String(vendedor.id), vendedor])
    );

    vendedoresPayload.forEach(vendedorPayload => {
        const vendedorDb = vendedoresMap.get(String(vendedorPayload.idVendedor));

        if (!vendedorDb || String(vendedorDb.idFilial) !== String(vendedorPayload.idFilial)) {
            const error = new Error(`O vendedor ${vendedorPayload.idVendedor} não pertence à filial ${vendedorPayload.idFilial}.`);
            error.status = 422;
            throw error;
        }
    });

    return { filiaisDb, vendedoresDb };
}

function sortMetaTree(meta) {
    if (!meta || !Array.isArray(meta.filiais)) {
        return meta;
    }

    meta.filiais.sort((a, b) => String(a.idFilial).localeCompare(String(b.idFilial)));

    meta.filiais.forEach(filial => {
        if (Array.isArray(filial.vendedores)) {
            filial.vendedores.sort((a, b) => Number(a.idVendedor) - Number(b.idVendedor));
        }
    });

    return meta;
}

async function buscarRealizadoPorVendedores(idEmpresa, vendedorIds, startDate, endDate) {
    if (!Array.isArray(vendedorIds) || vendedorIds.length === 0) {
        return new Map();
    }

    const rows = await Venda.findAll({
        attributes: [
            'idVendedor',
            [fn('SUM', col('valorTotal')), 'realizado']
        ],
        where: {
            idEmpresa,
            idVendedor: { [Op.in]: vendedorIds },
            createdAt: {
                [Op.between]: [
                    normalizeDateStart(startDate),
                    normalizeDateEnd(endDate)
                ]
            }
        },
        group: ['idVendedor'],
        raw: true
    });

    return new Map(
        rows.map(row => [String(row.idVendedor), roundCurrency(row.realizado)])
    );
}

function montarResumoVendedor(metaEmpresa, metaFilial, metaVendedor, realizadoMap) {
    const meta = roundCurrency(metaVendedor.meta);
    const realizado = roundCurrency(realizadoMap.get(String(metaVendedor.idVendedor)) || 0);
    const falta = roundCurrency(Math.max(meta - realizado, 0));
    const percentual = meta > 0 ? roundCurrency((realizado / meta) * 100) : 0;

    return {
        id: metaVendedor.idVendedor,
        nome: metaVendedor.vendedor ? metaVendedor.vendedor.nomeCompleto : null,
        nomeFilial: metaFilial.filial ? metaFilial.filial.nomeFantasia : null,
        meta,
        realizado,
        falta,
        percentual,
        metaBatida: realizado >= meta,
        status: getMetaStatus(metaEmpresa)
    };
}

function montarResumoFilial(metaEmpresa, metaFilial, realizadoMap) {
    const vendedores = Array.isArray(metaFilial.vendedores)
        ? metaFilial.vendedores.map(metaVendedor => montarResumoVendedor(metaEmpresa, metaFilial, metaVendedor, realizadoMap))
        : [];

    const metaTotal = roundCurrency(metaFilial.meta);
    const realizado = roundCurrency(vendedores.reduce((total, vendedor) => total + vendedor.realizado, 0));
    const falta = roundCurrency(Math.max(metaTotal - realizado, 0));
    const percentual = metaTotal > 0 ? roundCurrency((realizado / metaTotal) * 100) : 0;

    return {
        id: metaEmpresa.id,
        idMetaFilial: metaFilial.id,
        idFilial: metaFilial.idFilial,
        filialNome: metaFilial.filial ? metaFilial.filial.nomeFantasia : null,
        startDate: formatDateOnly(metaEmpresa.startDate),
        endDate: formatDateOnly(metaEmpresa.endDate),
        metaTotal,
        realizado,
        falta,
        percentual,
        status: getMetaStatus(metaEmpresa),
        updatedAt: metaEmpresa.updatedAt,
        vendedores
    };
}

function montarDetalheMeta(metaEmpresa, realizadoMap) {
    const filiais = Array.isArray(metaEmpresa.filiais)
        ? metaEmpresa.filiais.map(metaFilial => montarResumoFilial(metaEmpresa, metaFilial, realizadoMap))
        : [];

    const metaTotal = roundCurrency(metaEmpresa.metaEmpresa);
    const realizado = roundCurrency(filiais.reduce((total, filial) => total + filial.realizado, 0));
    const falta = roundCurrency(Math.max(metaTotal - realizado, 0));
    const percentual = metaTotal > 0 ? roundCurrency((realizado / metaTotal) * 100) : 0;

    return {
        id: metaEmpresa.id,
        idEmpresa: metaEmpresa.idEmpresa,
        startDate: formatDateOnly(metaEmpresa.startDate),
        endDate: formatDateOnly(metaEmpresa.endDate),
        metaEmpresa: metaTotal,
        realizado,
        falta,
        percentual,
        status: getMetaStatus(metaEmpresa),
        metaBatida: realizado >= metaTotal,
        updatedAt: metaEmpresa.updatedAt,
        filiais
    };
}

function montarItemListagem(metaEmpresa) {
    const filiais = Array.isArray(metaEmpresa.filiais)
        ? metaEmpresa.filiais.map(metaFilial => ({
            idMetaFilial: metaFilial.id,
            idFilial: metaFilial.idFilial,
            filialNome: metaFilial.filial ? metaFilial.filial.nomeFantasia : null,
            meta: roundCurrency(metaFilial.meta),
            vendedores: Array.isArray(metaFilial.vendedores)
                ? metaFilial.vendedores.map(metaVendedor => ({
                    idVendedor: metaVendedor.idVendedor,
                    nome: metaVendedor.vendedor ? metaVendedor.vendedor.nomeCompleto : null,
                    meta: roundCurrency(metaVendedor.meta)
                }))
                : []
        }))
        : [];

    return {
        id: metaEmpresa.id,
        startDate: formatDateOnly(metaEmpresa.startDate),
        endDate: formatDateOnly(metaEmpresa.endDate),
        metaEmpresa: roundCurrency(metaEmpresa.metaEmpresa),
        status: getMetaStatus(metaEmpresa),
        updatedAt: metaEmpresa.updatedAt,
        filiais
    };
}

async function carregarMetaCompleta(idEmpresa, id) {
    const meta = await MetaEmpresa.findOne({
        where: { idEmpresa, id },
        include: [
            {
                model: MetaFilial,
                as: 'filiais',
                where: { idEmpresa },
                attributes: ['id', 'idFilial', 'meta', 'createdAt', 'updatedAt'],
                required: false,
                include: [
                    {
                        model: Filial,
                        as: 'filial',
                        attributes: ['idFilial', 'nomeFantasia'],
                        where: { idEmpresa },
                        required: false
                    },
                    {
                        model: MetaVendedor,
                        as: 'vendedores',
                        attributes: ['id', 'idVendedor', 'meta', 'createdAt', 'updatedAt'],
                        required: false,
                        include: [
                            {
                                model: Vendedor,
                                as: 'vendedor',
                                attributes: ['id', 'idFilial', 'nomeCompleto'],
                                required: false
                            }
                        ]
                    }
                ]
            }
        ]
    });

    if (!meta) {
        return null;
    }

    return sortMetaTree(meta.toJSON());
}

async function recriarDistribuicao(metaId, idEmpresa, filiais, transaction) {
    for (const filial of filiais) {
        const metaFilial = await MetaFilial.create({
            idMetaEmpresa: metaId,
            idEmpresa,
            idFilial: filial.idFilial,
            meta: roundCurrency(filial.meta)
        }, { transaction });

        const vendedoresPayload = filial.vendedores.map(vendedor => ({
            idMetaFilial: metaFilial.id,
            idVendedor: vendedor.idVendedor,
            meta: roundCurrency(vendedor.meta)
        }));

        await MetaVendedor.bulkCreate(vendedoresPayload, { transaction });
    }
}

async function postMeta(req, res) {
    const transaction = await sequelize.transaction();

    try {
        const { idEmpresa } = req.params;
        const payload = req.body;
        const normalizedStartDate = normalizeDateOnly(payload.startDate);
        const normalizedEndDate = normalizeDateOnly(payload.endDate);
        const errors = validarPayloadMeta(payload);

        if (errors.length > 0) {
            await transaction.rollback();
            return res.status(422).json({ message: 'Erro de validação da meta.', errors });
        }

        await validarEmpresa(idEmpresa, transaction);
        await validarRelacionamentos(idEmpresa, payload.filiais, transaction);

        const conflito = await MetaEmpresa.findOne({
            where: buildPeriodoConflitWhere({
                idEmpresa,
                startDate: normalizedStartDate,
                endDate: normalizedEndDate
            }),
            transaction
        });

        if (conflito) {
            await transaction.rollback();
            return res.status(422).json({
                message: 'Já existe uma meta conflitante para a empresa no período informado.'
            });
        }

        const metaEmpresa = await MetaEmpresa.create({
            idEmpresa,
            startDate: normalizedStartDate,
            endDate: normalizedEndDate,
            metaEmpresa: roundCurrency(payload.metaEmpresa)
        }, { transaction });

        await recriarDistribuicao(metaEmpresa.id, idEmpresa, payload.filiais, transaction);

        await transaction.commit();

        const metaCriada = await carregarMetaCompleta(idEmpresa, metaEmpresa.id);

        return res.status(201).json({
            message: 'Meta cadastrada com sucesso',
            meta: metaCriada
        });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        return res.status(error.status || 500).json({
            message: error.message || 'Erro ao cadastrar meta'
        });
    }
}

async function listMetas(req, res) {
    try {
        const { idEmpresa } = req.params;
        const {
            idFilial,
            idVendedor,
            startDate,
            endDate,
            status,
            limit
        } = req.query;

        const metaWhere = {
            idEmpresa,
            ...buildPeriodoFiltroWhere(startDate, endDate)
        };

        const queryLimit = Math.min(
            Math.max(Number(limit) || 50, 1),
            MAX_LIST_LIMIT
        );

        const metas = await MetaEmpresa.findAll({
            where: metaWhere,
            include: [
                {
                    model: MetaFilial,
                    as: 'filiais',
                    attributes: ['id', 'idFilial', 'meta'],
                    required: !!idFilial || !!idVendedor,
                    where: {
                        idEmpresa,
                        ...(idFilial ? { idFilial } : {})
                    },
                    include: [
                        {
                            model: Filial,
                            as: 'filial',
                            attributes: ['idFilial', 'nomeFantasia'],
                            where: { idEmpresa },
                            required: false
                        },
                        {
                            model: MetaVendedor,
                            as: 'vendedores',
                            attributes: ['id', 'idVendedor', 'meta'],
                            required: !!idVendedor,
                            ...(idVendedor ? { where: { idVendedor } } : {}),
                            include: [
                                {
                                    model: Vendedor,
                                    as: 'vendedor',
                                    attributes: ['id', 'nomeCompleto'],
                                    required: false
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [['id', 'DESC']],
            limit: queryLimit
        });

        let response = metas.map(meta => montarItemListagem(sortMetaTree(meta.toJSON())));

        if (status) {
            response = response.filter(meta => meta.status === status);
        }

        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao buscar metas' });
    }
}

async function getMeta(req, res) {
    try {
        const { idEmpresa, id } = req.params;

        const meta = await carregarMetaCompleta(idEmpresa, id);

        if (!meta) {
            return res.status(404).json({ message: 'Meta não encontrada' });
        }

        const vendedorIds = meta.filiais.flatMap(filial =>
            filial.vendedores.map(vendedor => vendedor.idVendedor)
        );

        const realizadoMap = await buscarRealizadoPorVendedores(
            idEmpresa,
            vendedorIds,
            meta.startDate,
            meta.endDate
        );

        return res.status(200).json(montarDetalheMeta(meta, realizadoMap));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao buscar meta' });
    }
}

async function putMeta(req, res) {
    const transaction = await sequelize.transaction();

    try {
        const { idEmpresa, id } = req.params;
        const payload = req.body;
        const normalizedStartDate = normalizeDateOnly(payload.startDate);
        const normalizedEndDate = normalizeDateOnly(payload.endDate);
        const errors = validarPayloadMeta(payload);

        if (errors.length > 0) {
            await transaction.rollback();
            return res.status(422).json({ message: 'Erro de validação da meta.', errors });
        }

        const metaAtual = await MetaEmpresa.findOne({
            where: { idEmpresa, id },
            include: [
                {
                    model: MetaFilial,
                    as: 'filiais',
                    where: { idEmpresa },
                    attributes: ['id']
                }
            ],
            transaction
        });

        if (!metaAtual) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Meta não encontrada' });
        }

        await validarEmpresa(idEmpresa, transaction);
        await validarRelacionamentos(idEmpresa, payload.filiais, transaction);

        const conflito = await MetaEmpresa.findOne({
            where: buildPeriodoConflitWhere({
                idEmpresa,
                startDate: normalizedStartDate,
                endDate: normalizedEndDate,
                excludeId: id
            }),
            transaction
        });

        if (conflito) {
            await transaction.rollback();
            return res.status(422).json({
                message: 'Já existe uma meta conflitante para a empresa no período informado.'
            });
        }

        await MetaEmpresa.update({
            startDate: normalizedStartDate,
            endDate: normalizedEndDate,
            metaEmpresa: roundCurrency(payload.metaEmpresa)
        }, {
            where: { id, idEmpresa },
            transaction
        });

        const metaFilialIds = metaAtual.filiais.map(filial => filial.id);

        if (metaFilialIds.length > 0) {
            await MetaVendedor.destroy({
                where: { idMetaFilial: { [Op.in]: metaFilialIds } },
                transaction
            });
        }

        await MetaFilial.destroy({
            where: { idMetaEmpresa: id, idEmpresa },
            transaction
        });

        await recriarDistribuicao(id, idEmpresa, payload.filiais, transaction);

        await transaction.commit();

        const metaAtualizada = await carregarMetaCompleta(idEmpresa, id);

        return res.status(200).json({
            message: 'Meta atualizada com sucesso',
            meta: metaAtualizada
        });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        return res.status(error.status || 500).json({
            message: error.message || 'Erro ao atualizar meta'
        });
    }
}

async function deleteMeta(req, res) {
    const transaction = await sequelize.transaction();

    try {
        const { idEmpresa, id } = req.params;

        const meta = await MetaEmpresa.findOne({
            where: { idEmpresa, id },
            include: [
                {
                    model: MetaFilial,
                    as: 'filiais',
                    where: { idEmpresa },
                    attributes: ['id']
                }
            ],
            transaction
        });

        if (!meta) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Meta não encontrada' });
        }

        const metaFilialIds = meta.filiais.map(filial => filial.id);

        if (metaFilialIds.length > 0) {
            await MetaVendedor.destroy({
                where: { idMetaFilial: { [Op.in]: metaFilialIds } },
                transaction
            });
        }

        await MetaFilial.destroy({
            where: { idMetaEmpresa: id, idEmpresa },
            transaction
        });

        await MetaEmpresa.destroy({
            where: { idEmpresa, id },
            transaction
        });

        await transaction.commit();

        return res.status(200).json({ message: 'Meta deletada com sucesso' });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        return res.status(500).json({ message: 'Erro ao deletar meta' });
    }
}

async function getResumoMetas(req, res) {
    try {
        const { idEmpresa } = req.params;
        const { idFilial, startDate, endDate } = req.query;

        if (!idFilial) {
            return res.status(422).json({
                message: 'idFilial é obrigatório para o resumo da meta.'
            });
        }

        const metas = await MetaEmpresa.findAll({
            where: {
                idEmpresa,
                ...buildPeriodoFiltroWhere(startDate, endDate)
            },
            include: [
                {
                    model: MetaFilial,
                    as: 'filiais',
                    required: true,
                    where: { idEmpresa, idFilial },
                    attributes: ['id', 'idFilial', 'meta'],
                    include: [
                        {
                            model: Filial,
                            as: 'filial',
                            attributes: ['idFilial', 'nomeFantasia'],
                            where: { idEmpresa },
                            required: false
                        },
                        {
                            model: MetaVendedor,
                            as: 'vendedores',
                            attributes: ['id', 'idVendedor', 'meta'],
                            required: false,
                            include: [
                                {
                                    model: Vendedor,
                                    as: 'vendedor',
                                    attributes: ['id', 'idFilial', 'nomeCompleto'],
                                    required: false
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [['updatedAt', 'DESC']]
        });

        if (metas.length === 0) {
            return res.status(404).json({
                message: 'Meta não encontrada'
            });
        }

        const meta = sortMetaTree(metas[0].toJSON());
        const metaFilial = meta.filiais[0];

        const vendedorIds = metaFilial.vendedores.map(vendedor => vendedor.idVendedor);
        const realizadoMap = await buscarRealizadoPorVendedores(
            idEmpresa,
            vendedorIds,
            meta.startDate,
            meta.endDate
        );

        return res.status(200).json({
            metaEncontrada: true,
            meta: montarResumoFilial(meta, metaFilial, realizadoMap)
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao buscar resumo da meta' });
    }
}

async function getMetaVendedor(req, res) {
    try {
        const { idEmpresa } = req.params;
        const idVendedor = req.params.idVendedor || req.params.id;
        const { referenceDate, startDate, endDate } = req.query;

        if (!idVendedor) {
            return res.status(422).json({ message: 'idVendedor é obrigatório.' });
        }

        const vendedor = await Vendedor.findOne({
            where: {
                idEmpresa,
                id: idVendedor
            },
            attributes: ['id', 'idFilial', 'nomeCompleto']
        });

        if (!vendedor) {
            return res.status(404).json({ message: 'Vendedor não encontrado' });
        }

        const metas = await MetaEmpresa.findAll({
            where: {
                idEmpresa,
                ...buildPeriodoFiltroWhere(startDate, endDate)
            },
            include: [
                {
                    model: MetaFilial,
                    as: 'filiais',
                    required: true,
                    where: { idEmpresa },
                    attributes: ['id', 'idFilial', 'meta'],
                    include: [
                        {
                            model: Filial,
                            as: 'filial',
                            attributes: ['idFilial', 'nomeFantasia'],
                            where: { idEmpresa },
                            required: false
                        },
                        {
                            model: MetaVendedor,
                            as: 'vendedores',
                            required: true,
                            where: { idVendedor },
                            attributes: ['id', 'idVendedor', 'meta'],
                            include: [
                                {
                                    model: Vendedor,
                                    as: 'vendedor',
                                    attributes: ['id', 'idFilial', 'nomeCompleto'],
                                    required: false
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [
                ['endDate', 'DESC'],
                ['updatedAt', 'DESC']
            ]
        });

        if (metas.length === 0) {
            return res.status(404).json({
                message: 'Meta para o vendedor não encontrada'
            });
        }

        const metasJson = metas.map(meta => sortMetaTree(meta.toJSON()));
        const reference = referenceDate ? normalizeDateStart(referenceDate) : new Date();

        let metaEscolhida = metasJson.find(meta => getMetaStatus(meta, reference) === 'vigente');

        if (!metaEscolhida) {
            metaEscolhida = metasJson[0];
        }

        const metaFilial = metaEscolhida.filiais.find(filial =>
            filial.vendedores.some(metaVendedor => Number(metaVendedor.idVendedor) === Number(idVendedor))
        );

        if (!metaFilial) {
            return res.status(200).json({
                hasMeta: false,
                idVendedor: vendedor.id,
                nome: vendedor.nomeCompleto,
                idFilial: vendedor.idFilial,
                nomeFilial: null
            });
        }

        const metaVendedor = metaFilial.vendedores.find(item => Number(item.idVendedor) === Number(idVendedor));

        const realizadoMap = await buscarRealizadoPorVendedores(
            idEmpresa,
            [Number(idVendedor)],
            metaEscolhida.startDate,
            metaEscolhida.endDate
        );

        const resumo = montarResumoVendedor(metaEscolhida, metaFilial, metaVendedor, realizadoMap);

        return res.status(200).json({
            hasMeta: true,
            idVendedor: vendedor.id,
            nome: vendedor.nomeCompleto,
            idFilial: metaFilial.idFilial,
            nomeFilial: metaFilial.filial ? metaFilial.filial.nomeFantasia : null,
            startDate: formatDateOnly(metaEscolhida.startDate),
            endDate: formatDateOnly(metaEscolhida.endDate),
            meta: resumo.meta,
            realizado: resumo.realizado,
            falta: resumo.falta,
            percentual: resumo.percentual,
            status: getMetaStatus(metaEscolhida, reference),
            metaBatida: resumo.metaBatida
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao buscar meta do vendedor' });
    }
}

module.exports = {
    postMeta,
    listMetas,
    getMeta,
    getResumoMetas,
    getMetaVendedor,
    putMeta,
    deleteMeta,

};
