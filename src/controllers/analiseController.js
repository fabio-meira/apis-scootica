const { Op } = require('sequelize');
const moment = require('moment');
const Venda = require('../models/Venda');
const VendaProduto = require('../models/VendaProduto');
const OrdemProdutoTotal = require('../models/OrdemProdutoTotal');
const Pagamento = require('../models/Pagamento');
const Produto = require('../models/Produto');
const Vendedor = require('../models/Vendedor');
const Filial = require('../models/Filial');
const Conta = require('../models/Conta');
const MetaEmpresa = require('../models/MetaEmpresa');
const MetaFilial = require('../models/MetaFilial');
const MetaVendedor = require('../models/MetaVendedor');

const number = value => Number(value || 0);

function parseRange(query = {}) {
  const end = query.dataTo || query.endDate || moment().format('YYYY-MM-DD');
  const start = query.dataFrom || query.startDate || moment(end).subtract(29, 'days').format('YYYY-MM-DD');
  return {
    start: moment(start).startOf('day').toDate(),
    end: moment(end).endOf('day').toDate(),
    startDate: moment(start).format('YYYY-MM-DD'),
    endDate: moment(end).format('YYYY-MM-DD'),
  };
}

function parseMonthRange(query = {}) {
  const now = moment();
  const month = Number(query.mes || query.month || now.month() + 1);
  const year = Number(query.ano || query.year || now.year());
  const date = moment({ year, month: month - 1, date: 1 });
  const start = date.clone().startOf('month');
  const end = date.clone().endOf('month');
  return {
    month,
    year,
    start: start.toDate(),
    end: end.toDate(),
    startDate: start.format('YYYY-MM-DD'),
    endDate: end.format('YYYY-MM-DD'),
  };
}

function saleWhere(idEmpresa, idFilial, start, end) {
  return {
    idEmpresa,
    ...(idFilial ? { idFilial: String(idFilial) } : {}),
    createdAt: { [Op.between]: [start, end] },
  };
}

async function loadSales(idEmpresa, idFilial, start, end) {
  return Venda.findAll({
    where: saleWhere(idEmpresa, idFilial, start, end),
    attributes: ['id', 'idFilial', 'idVendedor', 'idOrdemServico', 'valorTotal', 'createdAt'],
    include: [
      {
        model: VendaProduto,
        as: 'produtos',
        attributes: ['idProduto', 'referencia', 'descricao', 'quantidade', 'preco', 'valorTotal'],
      },
      {
        model: OrdemProdutoTotal,
        as: 'totais',
        attributes: ['total', 'totalProdutos', 'desconto'],
        required: false,
      },
      {
        model: Vendedor,
        as: 'vendedor',
        attributes: ['nomeCompleto', 'comissao'],
        required: false,
      },
    ],
    order: [['createdAt', 'ASC']],
  });
}

async function getCostMap(idEmpresa, sales) {
  const ids = [...new Set(sales.flatMap(sale => (sale.produtos || []).map(item => item.idProduto).filter(Boolean)))];
  if (!ids.length) return new Map();

  const produtos = await Produto.findAll({
    where: { idEmpresa, id: { [Op.in]: ids } },
    attributes: ['id', 'precoCusto'],
  });
  return new Map(produtos.map(produto => [String(produto.id), number(produto.precoCusto)]));
}

function normalizeSales(sales, costMap) {
  return sales.map(sale => {
    const plain = sale.toJSON ? sale.toJSON() : sale;
    const totals = plain.totais || {};
    const net = number(plain.valorTotal || totals.total);
    const discount = number(totals.desconto);
    const gross = number(totals.totalProdutos) || net + discount;
    const products = (plain.produtos || []).map(product => {
      const quantity = number(product.quantidade);
      const revenue = number(product.valorTotal) || number(product.preco) * quantity;
      const cost = number(costMap.get(String(product.idProduto))) * quantity;
      return { ...product, quantity, revenue, cost, profit: revenue - cost };
    });

    return {
      ...plain,
      idFilial: plain.idFilial ? String(plain.idFilial) : null,
      net,
      gross,
      discount,
      products,
      vendedorNome: plain.vendedor?.nomeCompleto || 'Sem vendedor',
      vendedorComissao: number(plain.vendedor?.comissao),
    };
  });
}

function summarizeSales(sales) {
  const totalNet = sales.reduce((sum, sale) => sum + sale.net, 0);
  const totalGross = sales.reduce((sum, sale) => sum + sale.gross, 0);
  const discounts = sales.reduce((sum, sale) => sum + sale.discount, 0);
  const cmv = sales.reduce((sum, sale) => sum + sale.products.reduce((total, product) => total + product.cost, 0), 0);
  return {
    grossRevenue: totalGross,
    discounts,
    netRevenue: totalNet,
    cmv,
    salesCount: sales.length,
    ticketAverage: sales.length ? totalNet / sales.length : 0,
  };
}

async function getFilialMap(idEmpresa) {
  const filiais = await Filial.findAll({
    where: { idEmpresa },
    attributes: ['idFilial', 'nomeFantasia', 'razaoSocial'],
  });
  return new Map(filiais.map(filial => [String(filial.idFilial), filial.nomeFantasia || filial.razaoSocial || String(filial.idFilial)]));
}

async function paymentRows(idEmpresa, idFilial, sales, start, end) {
  const ids = sales.map(sale => sale.id).filter(Boolean);
  if (!ids.length) return [];

  const payments = await Pagamento.findAll({
    where: {
      idEmpresa,
      ...(idFilial ? { idFilial: String(idFilial) } : {}),
      idVenda: { [Op.in]: ids },
      createdAt: { [Op.between]: [start, end] },
    },
    attributes: ['tipoRecebimento', 'tipo', 'valor'],
  });
  const grouped = new Map();
  payments.forEach(payment => {
    const name = payment.tipoRecebimento || payment.tipo || 'Não informado';
    grouped.set(name, (grouped.get(name) || 0) + number(payment.valor));
  });
  return [...grouped.entries()].map(([name, value]) => ({ name, value }));
}

function groupProducts(sales) {
  const grouped = new Map();
  sales.forEach(sale => sale.products.forEach(product => {
    const key = product.referencia || product.idProduto || product.descricao || 'produto';
    const current = grouped.get(String(key)) || {
      ref: product.referencia || '',
      description: product.descricao || 'Produto sem descrição',
      quantity: 0,
      revenue: 0,
      cost: 0,
    };
    current.quantity += product.quantity;
    current.revenue += product.revenue;
    current.cost += product.cost;
    grouped.set(String(key), current);
  }));
  const total = [...grouped.values()].reduce((sum, item) => sum + item.revenue, 0);
  return [...grouped.values()]
    .map(item => ({
      ...item,
      profit: item.revenue - item.cost,
      margin: item.revenue ? ((item.revenue - item.cost) / item.revenue) * 100 : 0,
      share: total ? (item.revenue / total) * 100 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
}

function groupSellers(sales) {
  const grouped = new Map();
  sales.forEach(sale => {
    const key = String(sale.idVendedor || sale.vendedorNome);
    const current = grouped.get(key) || { name: sale.vendedorNome, sales: 0, orders: 0, total: 0 };
    current.sales += 1;
    current.orders += sale.idOrdemServico ? 1 : 0;
    current.total += sale.net;
    grouped.set(key, current);
  });
  return [...grouped.values()]
    .map(item => ({ ...item, average: item.sales ? item.total / item.sales : 0 }))
    .sort((a, b) => b.total - a.total);
}

async function buildReport(idEmpresa, query = {}) {
  const range = parseRange(query);
  const idFilial = query.idFilial || null;
  const loaded = await loadSales(idEmpresa, idFilial, range.start, range.end);
  const costMap = await getCostMap(idEmpresa, loaded);
  const sales = normalizeSales(loaded, costMap);
  const summary = summarizeSales(sales);
  const filialMap = await getFilialMap(idEmpresa);
  const stores = new Map();

  sales.forEach(sale => {
    const key = sale.idFilial || 'sem-filial';
    const current = stores.get(key) || { idFilial: key === 'sem-filial' ? null : key, name: filialMap.get(key) || 'Sem filial', value: 0 };
    current.value += sale.net;
    stores.set(key, current);
  });

  const payments = await paymentRows(idEmpresa, idFilial, sales, range.start, range.end);
  const paymentTotal = payments.reduce((sum, payment) => sum + payment.value, 0);
  const colors = ['#7F5539', '#B98558', '#6B9D82', '#A4C7B1', '#4E7CA1', '#B05B5B'];

  return {
    period: { from: range.startDate, to: range.endDate },
    filters: { idFilial },
    summary: {
      ...summary,
      paymentTotal,
      discountsPercent: summary.grossRevenue ? (summary.discounts / summary.grossRevenue) * 100 : 0,
    },
    payments: payments.map((payment, index) => ({ ...payment, color: colors[index % colors.length] })),
    stores: [...stores.values()]
      .map(store => ({ ...store, percent: summary.netRevenue ? (store.value / summary.netRevenue) * 100 : 0 }))
      .sort((a, b) => b.value - a.value),
    products: groupProducts(sales),
    sellers: groupSellers(sales),
    sales,
  };
}

async function getRelatorios(req, res) {
  try {
    const report = await buildReport(req.params.idEmpresa, req.query);
    const { sales, ...response } = report;
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao gerar relatório de vendas.', error });
  }
}

async function getDre(req, res) {
  try {
    const report = await buildReport(req.params.idEmpresa, req.query);
    const { idEmpresa } = req.params;
    const range = parseRange(req.query);
    const expenseWhere = {
      idEmpresa,
      tipo: 'Pagar',
      dataVencimento: { [Op.between]: [range.start, range.end] },
      ...(req.query.idFilial ? { idFilial: String(req.query.idFilial) } : {}),
    };
    const expenses = await Conta.findAll({ where: expenseWhere, attributes: ['idFilial', 'valor'] });
    const totalExpenses = expenses.reduce((sum, item) => sum + number(item.valor), 0);
    const byStoreExpenses = new Map();
    expenses.forEach(item => {
      const key = item.idFilial ? String(item.idFilial) : 'sem-filial';
      byStoreExpenses.set(key, (byStoreExpenses.get(key) || 0) + number(item.valor));
    });

    const summary = report.summary;
    const netProfit = summary.netRevenue - summary.cmv - totalExpenses;
    const filialMap = await getFilialMap(idEmpresa);
    const storeRows = report.stores.map(store => {
      const key = store.idFilial || 'sem-filial';
      const storeSales = report.sales?.filter(sale => (sale.idFilial || 'sem-filial') === key) || [];
      const storeSummary = summarizeSales(storeSales);
      const storeExpenses = byStoreExpenses.get(key) || 0;
      const profit = storeSummary.netRevenue - storeSummary.cmv - storeExpenses;
      return {
        store: store.name,
        netRevenue: storeSummary.netRevenue,
        cmv: storeSummary.cmv,
        assembly: 0,
        expenses: storeExpenses,
        netProfit: profit,
        margin: storeSummary.netRevenue ? (profit / storeSummary.netRevenue) * 100 : 0,
      };
    });

    return res.status(200).json({
      period: report.period,
      consolidado: {
        grossRevenue: summary.grossRevenue,
        discounts: summary.discounts,
        netRevenue: summary.netRevenue,
        cmv: summary.cmv,
        grossProfit: summary.netRevenue - summary.cmv,
        assembly: 0,
        operatingGross: summary.netRevenue - summary.cmv,
        expenses: totalExpenses,
        netProfit,
        margem: summary.netRevenue ? (netProfit / summary.netRevenue) * 100 : 0,
      },
      storeRows,
      ordersCount: 0,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao gerar DRE.', error });
  }
}

async function getSalarios(req, res) {
  try {
    const { idEmpresa } = req.params;
    const period = parseMonthRange(req.query);
    const idFilial = req.query.idFilial || null;
    const report = await buildReport(idEmpresa, {
      idFilial,
      dataFrom: period.startDate,
      dataTo: period.endDate,
    });
    const vendedores = await Vendedor.findAll({
      where: { idEmpresa, ...(idFilial ? { idFilial: String(idFilial) } : {}) },
      attributes: ['id', 'idFilial', 'nomeCompleto', 'comissao'],
      order: [['nomeCompleto', 'ASC']],
    });
    const salesBySeller = new Map(report.sellers.map(item => [String(item.name), item]));

    const metaEmpresa = await MetaEmpresa.findOne({
      where: {
        idEmpresa,
        startDate: { [Op.lte]: period.endDate },
        endDate: { [Op.gte]: period.startDate },
      },
      order: [['endDate', 'DESC']],
    });
    let target = number(metaEmpresa?.metaEmpresa);
    let metaFilialIds = [];
    if (metaEmpresa && idFilial) {
      const metaFilial = await MetaFilial.findOne({ where: { idMetaEmpresa: metaEmpresa.id, idFilial } });
      target = number(metaFilial?.meta) || target;
      if (metaFilial) metaFilialIds = [metaFilial.id];
    } else if (metaEmpresa) {
      const metasFiliais = await MetaFilial.findAll({ where: { idMetaEmpresa: metaEmpresa.id }, attributes: ['id'] });
      metaFilialIds = metasFiliais.map(item => item.id);
    }
    const metasVendedores = metaFilialIds.length
      ? await MetaVendedor.findAll({ where: { idMetaFilial: { [Op.in]: metaFilialIds } }, attributes: ['idVendedor', 'meta'] })
      : [];
    const targetBySeller = new Map(metasVendedores.map(item => [String(item.idVendedor), number(item.meta)]));

    const rows = vendedores.map(vendedor => {
      const sales = report.sales.filter(sale => String(sale.idVendedor) === String(vendedor.id)).reduce((sum, sale) => sum + sale.net, 0);
      const commission = sales * number(vendedor.comissao) / 100;
      return {
        role: 'Vendedor',
        seller: vendedor.nomeCompleto || 'Sem nome',
        idVendedor: vendedor.id,
        sales,
        base: 0,
        commission,
        awards: 0,
        bonus: 0,
        total: commission,
        target: targetBySeller.get(String(vendedor.id)) || 0,
      };
    });
    const realized = report.summary.netRevenue;
    return res.status(200).json({
      period: { month: period.month, year: period.year, from: period.startDate, to: period.endDate },
      filters: { idFilial },
      stores: [],
      goal: { realized, target, bonus: 0 },
      rows,
      totalPayroll: rows.reduce((sum, row) => sum + row.total, 0),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao calcular salários.', error });
  }
}

async function getDashboardResumo(req, res) {
  try {
    const { idEmpresa } = req.params;
    const idFilial = req.query.idFilial || null;
    const today = moment();
    const monthStart = today.clone().startOf('month').format('YYYY-MM-DD');
    const monthEnd = today.format('YYYY-MM-DD');
    const day = await buildReport(idEmpresa, { idFilial, dataFrom: today.format('YYYY-MM-DD'), dataTo: today.format('YYYY-MM-DD') });
    const month = await buildReport(idEmpresa, { idFilial, dataFrom: monthStart, dataTo: monthEnd });
    return res.status(200).json({
      today: day.summary,
      month: month.summary,
      topVendedores: month.sellers.slice(0, 5),
      topProdutos: month.products.slice(0, 5),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao carregar resumo do dashboard.', error });
  }
}

module.exports = {
  getRelatorios,
  getDre,
  getSalarios,
  getDashboardResumo,
};
