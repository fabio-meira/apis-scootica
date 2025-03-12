const router = require('express').Router()
const empresaController = require('./controllers/empresaController')
const clienteController = require('./controllers/clienteController')
const vendedorController = require('./controllers/vendedorController')
const fornecedorController = require('./controllers/fornecedorController')
const usuarioController = require('./controllers/usuarioController')
const produtoController = require('./controllers/produtoController')
const grupoProdutoController = require('./controllers/grupoProdutoController')
const subGrupoProdutoController = require('./controllers/subGrupoProdutoController')
const marcaProdutoController = require('./controllers/marcaProdutoController')
const colecaoProdutoController = require('./controllers/colecaoProdutoController')
const receitaMedicaController = require('./controllers/receitaMedicaController')
const orcamentoController = require('./controllers/orcamentoController')
const ordemServicoController = require('./controllers/ordemServicoController')
const categoriaController = require('./controllers/categoriaController')
const cepController = require('./controllers/cepController')
const ncmController = require('./controllers/ncmController')
const { auth } = require('./controllers/jwtAuth')
const { secret } = require('./controllers/secret')
const { IsAuthenticated } = require('./middleware/isAuthenticated')
const { IsAuthApiKey } = require('./middleware/isAtuthApiKey')
const authorization = require('./controllers/authorizationController'); 
const medicoController = require('./controllers/medicoController')
const laboratorioController = require('./controllers/laboratorioController')
const planoContaController = require('./controllers/planoContaController')
const formaRecebimentoController = require('./controllers/formaRecebimentoController')
const bancoController = require('./controllers/bancoController')
const codBancoController = require('./controllers/codBancoController')
const contasController = require('./controllers/contasController')
const vendaController = require('./controllers/vendaController')
const caixaController = require('./controllers/caixaController')
const dashboardController = require('./controllers/dashboardController')
const financeiroController = require('./controllers/financeiroController')
const origemController = require('./controllers/origemController')


// jwt-authorization
router.post('/oticas/token', authorization.auth);
router.get('/oticas/secret', IsAuthenticated, secret);

// rotas de empresas
router.post('/oticas/empresas', IsAuthApiKey, empresaController.postEmpresa);
router.put('/oticas/empresas/:idEmpresa', IsAuthApiKey, empresaController.putEmpresa);
router.get('/oticas/empresas', empresaController.listEmpresas);
router.get('/oticas/empresas/id/:id', IsAuthApiKey, empresaController.getByIdEmpresa);
router.get('/oticas/empresas/:idEmpresa', IsAuthApiKey, empresaController.getIdEmpresa);
router.get('/oticas/empresas/cnpj/:cnpj', IsAuthApiKey, empresaController.getEmpresa);

// rotas de clientes
router.post('/oticas/empresas/:idEmpresa/clientes', IsAuthApiKey, clienteController.postCliente);
router.put('/oticas/empresas/:idEmpresa/clientes/:id', IsAuthApiKey, clienteController.putCliente);
router.get('/oticas/empresas/:idEmpresa/clientes', IsAuthApiKey, clienteController.listCliente);
router.get('/oticas/empresas/:idEmpresa/clientes/pacientes', IsAuthApiKey, clienteController.getClientes);
router.get('/oticas/empresas/:idEmpresa/clientes/aniversariantes', IsAuthApiKey, clienteController.listClienteAniversario);
router.get('/oticas/empresas/:idEmpresa/clientes/aniversariantes/mes', IsAuthApiKey, clienteController.listClienteAniversarioMes);
router.get('/oticas/empresas/:idEmpresa/clientes/aniversariantes/ano', IsAuthApiKey, clienteController.listAniversariantesNoAno);
router.get('/oticas/empresas/:idEmpresa/clientes/:id', IsAuthApiKey, clienteController.getCliente);
router.get('/oticas/empresas/:idEmpresa/clientes/cpf/:cpf', IsAuthApiKey, clienteController.getClienteCpf);
router.delete('/oticas/empresas/:idEmpresa/clientes/:id', IsAuthApiKey, clienteController.deleteCliente);

// rota de médicos
router.post('/oticas/empresas/:idEmpresa/medicos', IsAuthApiKey, medicoController.postMedico);
router.get('/oticas/empresas/:idEmpresa/medicos', IsAuthApiKey, medicoController.listMedicos);
router.get('/oticas/empresas/:idEmpresa/medicos/cpf/:cpf', IsAuthApiKey, medicoController.getMedico);
router.get('/oticas/empresas/:idEmpresa/medicos/:id', IsAuthApiKey, medicoController.getIdMedico);
router.get('/oticas/empresas/:idEmpresa/medicos/receitas/:id', IsAuthApiKey, medicoController.getIdMedicoReceitas);
router.put('/oticas/empresas/:idEmpresa/medicos/cpf/:cpf', IsAuthApiKey, medicoController.putMedico);
router.put('/oticas/empresas/:idEmpresa/medicos/:id', IsAuthApiKey, medicoController.putIdMedico);
router.delete('/oticas/empresas/:idEmpresa/medicos/:id', IsAuthApiKey, medicoController.deleteMedico);


// rotas de receita médica
router.post('/oticas/empresas/:idEmpresa/receitas', IsAuthApiKey, receitaMedicaController.postReceita);
router.get('/oticas/empresas/:idEmpresa/receitas', IsAuthApiKey, receitaMedicaController.listReceitas);
router.get('/oticas/empresas/:idEmpresa/receitas/aniversario', IsAuthApiKey, receitaMedicaController.listReceitaAniversario);
router.get('/oticas/empresas/:idEmpresa/receitas/aniversario/hoje', IsAuthApiKey, receitaMedicaController.listReceitaAniversarioHoje);
router.get('/oticas/empresas/:idEmpresa/receitas/aniversario/mes', IsAuthApiKey, receitaMedicaController.listAniversarioMes);
router.get('/oticas/empresas/:idEmpresa/receitas/aniversario/ano', IsAuthApiKey, receitaMedicaController.listAniversarioAno);
router.get('/oticas/empresas/:idEmpresa/receitas/medico/:idMedico', IsAuthApiKey, receitaMedicaController.getReceitaMedico);
router.get('/oticas/empresas/:idEmpresa/receitas/paciente/:idCliente', IsAuthApiKey, receitaMedicaController.getReceitaPaciente);
router.get('/oticas/empresas/:idEmpresa/receitas/:id', IsAuthApiKey, receitaMedicaController.getReceita);
router.put('/oticas/empresas/:idEmpresa/receitas/:id', IsAuthApiKey, receitaMedicaController.putReceita);
router.delete('/oticas/empresas/:idEmpresa/receitas/:id', IsAuthApiKey, receitaMedicaController.deleteReceita);

// rotas de forncedores
router.post('/oticas/empresas/:idEmpresa/fornecedores', IsAuthApiKey, fornecedorController.postFornecedor);
router.get('/oticas/empresas/:idEmpresa/fornecedores', IsAuthApiKey, fornecedorController.listFornecedor);
router.get('/oticas/empresas/:idEmpresa/fornecedores/:id', IsAuthApiKey, fornecedorController.getFornecedor);
router.get('/oticas/empresas/:idEmpresa/fornecedores/cnpj/:cnpj', IsAuthApiKey, fornecedorController.getCnpjFornecedor);
router.put('/oticas/empresas/:idEmpresa/fornecedores/:id', IsAuthApiKey, fornecedorController.putFornecedor);
router.delete('/oticas/empresas/:idEmpresa/fornecedores/:id', IsAuthApiKey, fornecedorController.deleteFornecedor);

// rotas de laboratórios
router.post('/oticas/empresas/:idEmpresa/laboratorios', IsAuthApiKey, laboratorioController.postLaboratorio);
router.get('/oticas/empresas/:idEmpresa/laboratorios', IsAuthApiKey, laboratorioController.listLaboratorio);
router.get('/oticas/empresas/:idEmpresa/laboratorios/:id', IsAuthApiKey, laboratorioController.getLaboratorio);
router.put('/oticas/empresas/:idEmpresa/laboratorios/:id', IsAuthApiKey, laboratorioController.putLaboratorio);
router.delete('/oticas/empresas/:idEmpresa/laboratorios/:id', IsAuthApiKey, laboratorioController.deleteLaboratorio);

// rotas de vendedores
router.post('/oticas/empresas/:idEmpresa/vendedores', IsAuthApiKey, vendedorController.postVendedor);
router.get('/oticas/empresas/:idEmpresa/vendedores', IsAuthApiKey, vendedorController.listVendedores);
router.get('/oticas/empresas/:idEmpresa/vendedores/:id', IsAuthApiKey, vendedorController.getVendedor);
router.put('/oticas/empresas/:idEmpresa/vendedores/:id', IsAuthApiKey, vendedorController.putVendedor);
router.delete('/oticas/empresas/:idEmpresa/vendedores/:id', IsAuthApiKey, vendedorController.deleteVendedor);

// rotas de usuários
router.post('/oticas/empresas/:idEmpresa/usuarios', IsAuthApiKey, usuarioController.postUsuario);
router.get('/oticas/empresas/:idEmpresa/usuarios', IsAuthApiKey, usuarioController.listUsuarios);
router.get('/oticas/empresas/:idEmpresa/usuarios/:id', IsAuthApiKey, usuarioController.getUsuario);
router.get('/oticas/sccotica/login/:id', IsAuthApiKey, usuarioController.loginUsuario);
router.post('/oticas/sccotica/login/email/:email', IsAuthApiKey, usuarioController.loginEmail);
router.put('/oticas/empresas/:idEmpresa/usuarios/:id', IsAuthApiKey, usuarioController.putUsuario);
router.put('/oticas/sccotica/login/senha/:recoveryToken', IsAuthApiKey, usuarioController.putSenha);
router.delete('/oticas/empresas/:idEmpresa/usuarios/:id', IsAuthApiKey, usuarioController.deletarUsuario);

// rotas de produtos
router.post('/oticas/empresas/:idEmpresa/produtos', IsAuthApiKey, produtoController.postProduto);
router.get('/oticas/empresas/:idEmpresa/produtos', IsAuthApiKey, produtoController.listProdutos);
router.get('/oticas/empresas/:idEmpresa/produtos/:id', IsAuthApiKey, produtoController.getProduto);
router.get('/oticas/empresas/:idEmpresa/produtos/ean/:codigoBarras', IsAuthApiKey, produtoController.getProdutoEan);
router.put('/oticas/empresas/:idEmpresa/produtos/:id', IsAuthApiKey, produtoController.putProduto);
router.patch('/oticas/empresas/:idEmpresa/produtos/:referencia', IsAuthApiKey, produtoController.patchProduto);
router.delete('/oticas/empresas/:idEmpresa/produtos/:id', IsAuthApiKey, produtoController.deleteProduto);

// rotas de orçamentos
router.post('/oticas/empresas/:idEmpresa/orcamentos', IsAuthApiKey, orcamentoController.postOrcamento);
router.get('/oticas/empresas/:idEmpresa/orcamentos', IsAuthApiKey, orcamentoController.getOrcamentos);
router.get('/oticas/empresas/:idEmpresa/orcamentos/so', IsAuthApiKey, orcamentoController.getOrcamentosSO);
router.get('/oticas/empresas/:idEmpresa/orcamentos/:id', IsAuthApiKey, orcamentoController.getIdOrcamento);
router.get('/oticas/empresas/:idEmpresa/orcamentos/vendedor/:idVendedor', IsAuthApiKey, orcamentoController.getIdVendedorOrcamento);
router.put('/oticas/empresas/:idEmpresa/orcamentos/:id', IsAuthApiKey, orcamentoController.putOrcamento);
router.delete('/oticas/empresas/:idEmpresa/orcamentos/:id', IsAuthApiKey, orcamentoController.deleteOrcamento);

// rotas de ordem de serviços
router.post('/oticas/empresas/:idEmpresa/ordemServico', IsAuthApiKey, ordemServicoController.postOrdemServico);
router.get('/oticas/empresas/:idEmpresa/ordemServico', IsAuthApiKey, ordemServicoController.getOrdemServico);
router.get('/oticas/empresas/:idEmpresa/ordemServico/sv', IsAuthApiKey, ordemServicoController.getOrdemServicoSV);
router.get('/oticas/empresas/:idEmpresa/ordemServico/:id', IsAuthApiKey, ordemServicoController.getIdOrdemServico);
router.put('/oticas/empresas/:idEmpresa/ordemServico/:id', IsAuthApiKey, ordemServicoController.putOrdemServico);
router.delete('/oticas/empresas/:idEmpresa/ordemServico/:id', IsAuthApiKey, ordemServicoController.deleteOrdemServico);

// rotas de vendas
router.post('/oticas/empresas/:idEmpresa/vendas', IsAuthApiKey, vendaController.postVenda);
router.get('/oticas/empresas/:idEmpresa/vendas', IsAuthApiKey, vendaController.getVenda);
router.get('/oticas/empresas/:idEmpresa/vendas/:id', IsAuthApiKey, vendaController.getIdVenda);
router.get('/oticas/empresas/:idEmpresa/vendas/caixa/:id', IsAuthApiKey, vendaController.getCaixaIdVenda);
router.put('/oticas/empresas/:idEmpresa/vendas/:id', IsAuthApiKey, vendaController.putVenda);
router.delete('/oticas/empresas/:idEmpresa/vendas/:id', IsAuthApiKey, vendaController.deleteVenda);

// rotas de caixa
router.post('/oticas/empresas/:idEmpresa/caixas', IsAuthApiKey, caixaController.postCaixa);
router.get('/oticas/empresas/:idEmpresa/caixas', IsAuthApiKey, caixaController.listCaixa);
router.get('/oticas/empresas/:idEmpresa/caixas/aberto', IsAuthApiKey, caixaController.caixaAberto);
router.get('/oticas/empresas/:idEmpresa/caixas/:id', IsAuthApiKey, caixaController.getCaixa);
router.put('/oticas/empresas/:idEmpresa/caixas/:id', IsAuthApiKey, caixaController.putCaixa);
router.patch('/oticas/empresas/:idEmpresa/caixas', IsAuthApiKey, caixaController.patchCaixa);
// router.delete('/oticas/empresas/:idEmpresa/caixas/:id', caixaController.deleteCaixa);

// rotas de dashboard
router.get('/oticas/empresas/:idEmpresa/dashboard/diario', IsAuthApiKey, dashboardController.getVendaSemanal);
router.get('/oticas/empresas/:idEmpresa/dashboard/mensagens', IsAuthApiKey, dashboardController.listMensagens);
router.get('/oticas/empresas/:idEmpresa/dashboard/mensal', IsAuthApiKey, dashboardController.getConsolidadoMensal);
router.get('/oticas/empresas/:idEmpresa/dashboard/anual', IsAuthApiKey, dashboardController.getConsolidadoAnual);
// router.get('/oticas/empresas/:idEmpresa/vendas/caixa/:id', IsAuthApiKey, vendaController.getCaixaIdVenda);
// router.put('/oticas/empresas/:idEmpresa/vendas/:id', IsAuthApiKey, vendaController.putVenda);
// router.delete('/oticas/empresas/:idEmpresa/vendas/:id', IsAuthApiKey, vendaController.deleteVenda);

// rotas de reports
router.get('/oticas/empresas/:idEmpresa/financeiro/mensal', IsAuthApiKey, financeiroController.getFinanceiro);
router.get('/oticas/empresas/:idEmpresa/financeiro/anual', IsAuthApiKey, financeiroController.getFinanceiroMeses);
router.get('/oticas/empresas/:idEmpresa/financeiro/anual/:mes/:ano', IsAuthApiKey, financeiroController.getFinanceiroMes);

// rotas de grupo de produtos
router.post('/oticas/empresas/:idEmpresa/grupoProduto', IsAuthApiKey, grupoProdutoController.postGrupoProduto);
router.get('/oticas/empresas/:idEmpresa/grupoProduto', IsAuthApiKey, grupoProdutoController.listGrupoProduto);
router.get('/oticas/empresas/:idEmpresa/grupoProduto/:id', IsAuthApiKey, grupoProdutoController.getGrupoProduto);
router.put('/oticas/empresas/:idEmpresa/grupoProduto/:id', IsAuthApiKey, grupoProdutoController.putGrupoProduto);
router.delete('/oticas/empresas/:idEmpresa/grupoProduto/:id', IsAuthApiKey, grupoProdutoController.deleteGrupoProduto);

// rotas de sub grupo de produtos
router.post('/oticas/empresas/:idEmpresa/subGrupoProduto', IsAuthApiKey, subGrupoProdutoController.postSubGrupoProduto);
router.get('/oticas/empresas/:idEmpresa/subGrupoProduto', IsAuthApiKey, subGrupoProdutoController.listSubGrupoProduto);
router.get('/oticas/empresas/:idEmpresa/subGrupoProduto/:id', IsAuthApiKey, subGrupoProdutoController.getSubGrupoProduto);
router.put('/oticas/empresas/:idEmpresa/subGrupoProduto/:id', IsAuthApiKey, subGrupoProdutoController.putSubGrupoProduto);
router.delete('/oticas/empresas/:idEmpresa/subGrupoProduto/:id', IsAuthApiKey, subGrupoProdutoController.deleteSubGrupoProduto);

// rotas de marca de produtos
router.post('/oticas/empresas/:idEmpresa/marcaProduto', IsAuthApiKey, marcaProdutoController.postMarcaProduto);
router.get('/oticas/empresas/:idEmpresa/marcaProduto', IsAuthApiKey, marcaProdutoController.listMarcaProduto);
router.get('/oticas/empresas/:idEmpresa/marcaProduto/:id', IsAuthApiKey, marcaProdutoController.getMarcaProduto);
router.put('/oticas/empresas/:idEmpresa/marcaProduto/:id', IsAuthApiKey, marcaProdutoController.putMarcaProduto);
router.delete('/oticas/empresas/:idEmpresa/marcaProduto/:id', IsAuthApiKey, marcaProdutoController.deleteMarcaProduto);

// rotas de coleção de produtos
router.post('/oticas/empresas/:idEmpresa/colecaoProduto', IsAuthApiKey, colecaoProdutoController.postColecaoProduto);
router.get('/oticas/empresas/:idEmpresa/colecaoProduto', IsAuthApiKey, colecaoProdutoController.listColecaoProduto);
router.get('/oticas/empresas/:idEmpresa/colecaoProduto/:id', IsAuthApiKey, colecaoProdutoController.getColecaoProduto);
router.put('/oticas/empresas/:idEmpresa/colecaoProduto/:id', IsAuthApiKey, colecaoProdutoController.putColecaoProduto);
router.delete('/oticas/empresas/:idEmpresa/colecaoProduto/:id', IsAuthApiKey, colecaoProdutoController.deleteColecaoProduto);

// rotas de categorias
router.post('/oticas/empresas/:idEmpresa/categorias', IsAuthApiKey, categoriaController.postCategoria);
router.get('/oticas/empresas/:idEmpresa/categorias', IsAuthApiKey, categoriaController.listCategoria);
router.get('/oticas/empresas/:idEmpresa/categorias/:id', IsAuthApiKey, categoriaController.getCategoria);
router.put('/oticas/empresas/:idEmpresa/categorias/:id', IsAuthApiKey, categoriaController.putCategoria);
router.delete('/oticas/empresas/:idEmpresa/categorias/:id', IsAuthApiKey, categoriaController.deleteCategoria);

// rotas de origens
router.post('/oticas/empresas/:idEmpresa/origens', IsAuthApiKey, origemController.postOrigem);
router.get('/oticas/empresas/:idEmpresa/origens', IsAuthApiKey, origemController.listOrigem);
router.get('/oticas/empresas/:idEmpresa/origens/:id', IsAuthApiKey, origemController.getOrigem);
router.put('/oticas/empresas/:idEmpresa/origens/:id', IsAuthApiKey, origemController.putOrigem);
router.delete('/oticas/empresas/:idEmpresa/origens/:id', IsAuthApiKey, origemController.deleteOrigem);

// rotas de plano de conta
router.post('/oticas/empresas/:idEmpresa/planos', IsAuthApiKey, planoContaController.postPlanoConta);
router.get('/oticas/empresas/:idEmpresa/planos', IsAuthApiKey, planoContaController.listPlanoConta);
router.get('/oticas/empresas/:idEmpresa/planos/:id', IsAuthApiKey, planoContaController.getPlanoConta);
router.put('/oticas/empresas/:idEmpresa/planos/:id', IsAuthApiKey, planoContaController.putPlanoConta);
router.delete('/oticas/empresas/:idEmpresa/planos/:id', IsAuthApiKey, planoContaController.deletePlanoConta);

// rotas de forma de recebimento
router.post('/oticas/empresas/:idEmpresa/formas', IsAuthApiKey, formaRecebimentoController.postFormaRecebimento);
router.get('/oticas/empresas/:idEmpresa/formas', IsAuthApiKey, formaRecebimentoController.listFormaRecebimento);
router.get('/oticas/empresas/:idEmpresa/formas/:id', IsAuthApiKey, formaRecebimentoController.getFormaRecebimento);
router.put('/oticas/empresas/:idEmpresa/formas/:id', IsAuthApiKey, formaRecebimentoController.putFormaRecebimento);
router.delete('/oticas/empresas/:idEmpresa/formas/:id', IsAuthApiKey, formaRecebimentoController.deleteFormaRecebimento);

// rotas de bancos
router.post('/oticas/empresas/:idEmpresa/bancos', IsAuthApiKey, bancoController.postBanco);
router.get('/oticas/empresas/:idEmpresa/bancos', IsAuthApiKey, bancoController.listBanco);
router.get('/oticas/empresas/:idEmpresa/bancos/:id', IsAuthApiKey, bancoController.getBanco);
router.put('/oticas/empresas/:idEmpresa/bancos/:id', IsAuthApiKey, bancoController.putBanco);
router.delete('/oticas/empresas/:idEmpresa/bancos/:id', IsAuthApiKey, bancoController.deleteBanco);

// rotas de contas a pagar e receber
router.post('/oticas/empresas/:idEmpresa/contas', IsAuthApiKey, contasController.postConta);
router.get('/oticas/empresas/:idEmpresa/contas', IsAuthApiKey, contasController.listConta);
router.get('/oticas/empresas/:idEmpresa/contas/:id', IsAuthApiKey, contasController.getConta);
router.put('/oticas/empresas/:idEmpresa/contas/:id', IsAuthApiKey, contasController.putConta);
router.delete('/oticas/empresas/:idEmpresa/contas/:id', IsAuthApiKey, contasController.deleteConta);

// Localizar CEPs
router.get('/oticas/cep/:cep', IsAuthApiKey, cepController.getCep);

// Localizar bancos por código
router.get('/oticas/bancos', IsAuthApiKey, codBancoController.getBanco);
router.get('/oticas/bancos/:id', IsAuthApiKey, codBancoController.getIdBanco);

// Localizar NCMs
router.get('/oticas/ncm', IsAuthApiKey, ncmController.getNcm);

module.exports = router