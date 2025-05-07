const uploadXml = require('./middleware/uploadXml');
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
const filialController = require('./controllers/filialController')
const nfeController = require('./controllers/nfeController')
const mensagemController = require('./controllers/mensagemController')


// jwt-authorization
router.post('/api/oticas/token', authorization.auth);
router.get('/api/oticas/secret', IsAuthenticated, secret);

// rotas de empresas
router.post('/api/oticas/empresas', IsAuthApiKey, empresaController.postEmpresa);
router.put('/api/oticas/empresas/:idEmpresa', IsAuthApiKey, empresaController.putEmpresa);
router.get('/api/oticas/empresas', empresaController.listEmpresas);
router.get('/api/oticas/empresas/id/:id', IsAuthApiKey, empresaController.getByIdEmpresa);
router.get('/api/oticas/empresas/:idEmpresa', IsAuthApiKey, empresaController.getIdEmpresa);
router.get('/api/oticas/empresas/cnpj/:cnpj', IsAuthApiKey, empresaController.getEmpresa);

// rotas de clientes
router.post('/api/oticas/empresas/:idEmpresa/clientes', IsAuthApiKey, clienteController.postCliente);
router.put('/api/oticas/empresas/:idEmpresa/clientes/:id', IsAuthApiKey, clienteController.putCliente);
router.get('/api/oticas/empresas/:idEmpresa/clientes', IsAuthApiKey, clienteController.listCliente);
router.get('/api/oticas/empresas/:idEmpresa/clientes/pacientes', IsAuthApiKey, clienteController.getClientes);
router.get('/api/oticas/empresas/:idEmpresa/clientes/aniversariantes', IsAuthApiKey, clienteController.listClienteAniversario);
router.get('/api/oticas/empresas/:idEmpresa/clientes/aniversariantes/mes', IsAuthApiKey, clienteController.listClienteAniversarioMes);
router.get('/api/oticas/empresas/:idEmpresa/clientes/aniversariantes/ano', IsAuthApiKey, clienteController.listAniversariantesNoAno);
router.get('/api/oticas/empresas/:idEmpresa/clientes/:id', IsAuthApiKey, clienteController.getCliente);
router.get('/api/oticas/empresas/:idEmpresa/clientes/:id/vendas', IsAuthApiKey, clienteController.getClienteVendas);
router.get('/api/oticas/empresas/:idEmpresa/clientes/cpf/:cpf', IsAuthApiKey, clienteController.getClienteCpf);
router.delete('/api/oticas/empresas/:idEmpresa/clientes/:id', IsAuthApiKey, clienteController.deleteCliente);

// rota de médicos
router.post('/api/oticas/empresas/:idEmpresa/medicos', IsAuthApiKey, medicoController.postMedico);
router.get('/api/oticas/empresas/:idEmpresa/medicos', IsAuthApiKey, medicoController.listMedicos);
router.get('/api/oticas/empresas/:idEmpresa/medicos/cpf/:cpf', IsAuthApiKey, medicoController.getMedico);
router.get('/api/oticas/empresas/:idEmpresa/medicos/:id', IsAuthApiKey, medicoController.getIdMedico);
router.get('/api/oticas/empresas/:idEmpresa/medicos/receitas/:id', IsAuthApiKey, medicoController.getIdMedicoReceitas);
router.put('/api/oticas/empresas/:idEmpresa/medicos/cpf/:cpf', IsAuthApiKey, medicoController.putMedico);
router.put('/api/oticas/empresas/:idEmpresa/medicos/:id', IsAuthApiKey, medicoController.putIdMedico);
router.delete('/api/oticas/empresas/:idEmpresa/medicos/:id', IsAuthApiKey, medicoController.deleteMedico);


// rotas de receita médica
router.post('/api/oticas/empresas/:idEmpresa/receitas', IsAuthApiKey, receitaMedicaController.postReceita);
router.get('/api/oticas/empresas/:idEmpresa/receitas', IsAuthApiKey, receitaMedicaController.listReceitas);
router.get('/api/oticas/empresas/:idEmpresa/receitas/aniversario', IsAuthApiKey, receitaMedicaController.listReceitaAniversario);
router.get('/api/oticas/empresas/:idEmpresa/receitas/aniversario/hoje', IsAuthApiKey, receitaMedicaController.listReceitaAniversarioHoje);
router.get('/api/oticas/empresas/:idEmpresa/receitas/aniversario/mes', IsAuthApiKey, receitaMedicaController.listAniversarioMes);
router.get('/api/oticas/empresas/:idEmpresa/receitas/aniversario/ano', IsAuthApiKey, receitaMedicaController.listAniversarioAno);
router.get('/api/oticas/empresas/:idEmpresa/receitas/medico/:idMedico', IsAuthApiKey, receitaMedicaController.getReceitaMedico);
router.get('/api/oticas/empresas/:idEmpresa/receitas/paciente/:idCliente', IsAuthApiKey, receitaMedicaController.getReceitaPaciente);
router.get('/api/oticas/empresas/:idEmpresa/receitas/:id', IsAuthApiKey, receitaMedicaController.getReceita);
router.put('/api/oticas/empresas/:idEmpresa/receitas/:id', IsAuthApiKey, receitaMedicaController.putReceita);
router.delete('/api/oticas/empresas/:idEmpresa/receitas/:id', IsAuthApiKey, receitaMedicaController.deleteReceita);

// rotas de forncedores
router.post('/api/oticas/empresas/:idEmpresa/fornecedores', IsAuthApiKey, fornecedorController.postFornecedor);
router.get('/api/oticas/empresas/:idEmpresa/fornecedores', IsAuthApiKey, fornecedorController.listFornecedor);
router.get('/api/oticas/empresas/:idEmpresa/fornecedores/:id', IsAuthApiKey, fornecedorController.getFornecedor);
router.get('/api/oticas/empresas/:idEmpresa/fornecedores/cnpj/:cnpj', IsAuthApiKey, fornecedorController.getCnpjFornecedor);
router.put('/api/oticas/empresas/:idEmpresa/fornecedores/:id', IsAuthApiKey, fornecedorController.putFornecedor);
router.delete('/api/oticas/empresas/:idEmpresa/fornecedores/:id', IsAuthApiKey, fornecedorController.deleteFornecedor);

// rotas de laboratórios
router.post('/api/oticas/empresas/:idEmpresa/laboratorios', IsAuthApiKey, laboratorioController.postLaboratorio);
router.get('/api/oticas/empresas/:idEmpresa/laboratorios', IsAuthApiKey, laboratorioController.listLaboratorio);
router.get('/api/oticas/empresas/:idEmpresa/laboratorios/:id', IsAuthApiKey, laboratorioController.getLaboratorio);
router.put('/api/oticas/empresas/:idEmpresa/laboratorios/:id', IsAuthApiKey, laboratorioController.putLaboratorio);
router.delete('/api/oticas/empresas/:idEmpresa/laboratorios/:id', IsAuthApiKey, laboratorioController.deleteLaboratorio);

// rotas de filiais
router.post('/api/oticas/empresas/:idEmpresa/filiais', IsAuthApiKey, filialController.postFilial);
router.get('/api/oticas/empresas/:idEmpresa/filiais', IsAuthApiKey, filialController.listFilial);
router.get('/api/oticas/empresas/:idEmpresa/filiais/:id', IsAuthApiKey, filialController.getFilial);
router.put('/api/oticas/empresas/:idEmpresa/filiais/:id', IsAuthApiKey, filialController.putFilial);
router.delete('/api/oticas/empresas/:idEmpresa/filiais/:id', IsAuthApiKey, filialController.deleteFilial);

// rotas de vendedores
router.post('/api/oticas/empresas/:idEmpresa/vendedores', IsAuthApiKey, vendedorController.postVendedor);
router.get('/api/oticas/empresas/:idEmpresa/vendedores', IsAuthApiKey, vendedorController.listVendedores);
router.get('/api/oticas/empresas/:idEmpresa/vendedores/:id', IsAuthApiKey, vendedorController.getVendedor);
router.get('/api/oticas/empresas/:idEmpresa/vendedores/:id/vendas', IsAuthApiKey, vendedorController.getVendasVendedor);
router.put('/api/oticas/empresas/:idEmpresa/vendedores/:id', IsAuthApiKey, vendedorController.putVendedor);
router.delete('/api/oticas/empresas/:idEmpresa/vendedores/:id', IsAuthApiKey, vendedorController.deleteVendedor);

// rotas de usuários
router.post('/api/oticas/empresas/:idEmpresa/usuarios', IsAuthApiKey, usuarioController.postUsuario);
router.get('/api/oticas/empresas/:idEmpresa/usuarios', IsAuthApiKey, usuarioController.listUsuarios);
router.get('/api/oticas/empresas/:idEmpresa/usuarios/:id', IsAuthApiKey, usuarioController.getUsuario);
router.get('/api/oticas/optware/login/:id', usuarioController.loginUsuario);
router.post('/api/oticas/optware/login/email/:email', usuarioController.loginEmail);
router.put('/api/oticas/empresas/:idEmpresa/usuarios/:id', IsAuthApiKey, usuarioController.putUsuario);
router.put('/api/oticas/optware/login/senha/:recoveryToken', usuarioController.putSenha);
router.delete('/api/oticas/empresas/:idEmpresa/usuarios/:id', IsAuthApiKey, usuarioController.deletarUsuario);

// rotas de produtos
router.post('/api/oticas/empresas/:idEmpresa/produtos', IsAuthApiKey, produtoController.postProduto);
router.get('/api/oticas/empresas/:idEmpresa/produtos', IsAuthApiKey, produtoController.listProdutos);
router.get('/api/oticas/empresas/:idEmpresa/produtos/:id', IsAuthApiKey, produtoController.getProduto);
router.get('/api/oticas/empresas/:idEmpresa/produtos/ean/:codigoBarras', IsAuthApiKey, produtoController.getProdutoEan);
router.put('/api/oticas/empresas/:idEmpresa/produtos/:id', IsAuthApiKey, produtoController.putProduto);
router.patch('/api/oticas/empresas/:idEmpresa/produtos/:referencia', IsAuthApiKey, produtoController.patchProduto);
router.delete('/api/oticas/empresas/:idEmpresa/produtos/:id', IsAuthApiKey, produtoController.deleteProduto);

// rotas de orçamentos
router.post('/api/oticas/empresas/:idEmpresa/orcamentos', IsAuthApiKey, orcamentoController.postOrcamento);
router.get('/api/oticas/empresas/:idEmpresa/orcamentos', IsAuthApiKey, orcamentoController.getOrcamentos);
router.get('/api/oticas/empresas/:idEmpresa/orcamentos/so', IsAuthApiKey, orcamentoController.getOrcamentosSO);
router.get('/api/oticas/empresas/:idEmpresa/orcamentos/:id', IsAuthApiKey, orcamentoController.getIdOrcamento);
router.get('/api/oticas/empresas/:idEmpresa/orcamentos/vendedor/:idVendedor', IsAuthApiKey, orcamentoController.getIdVendedorOrcamento);
router.put('/api/oticas/empresas/:idEmpresa/orcamentos/:id', IsAuthApiKey, orcamentoController.putOrcamento);
router.delete('/api/oticas/empresas/:idEmpresa/orcamentos/:id', IsAuthApiKey, orcamentoController.deleteOrcamento);

// rotas de ordem de serviços
router.post('/api/oticas/empresas/:idEmpresa/ordemServico', IsAuthApiKey, ordemServicoController.postOrdemServico);
router.get('/api/oticas/empresas/:idEmpresa/ordemServico', IsAuthApiKey, ordemServicoController.getOrdemServico);
router.get('/api/oticas/empresas/:idEmpresa/ordemServico/sv', IsAuthApiKey, ordemServicoController.getOrdemServicoSV);
router.get('/api/oticas/empresas/:idEmpresa/ordemServico/:id', IsAuthApiKey, ordemServicoController.getIdOrdemServico);
router.put('/api/oticas/empresas/:idEmpresa/ordemServico/:id', IsAuthApiKey, ordemServicoController.putOrdemServico);
router.delete('/api/oticas/empresas/:idEmpresa/ordemServico/:id', IsAuthApiKey, ordemServicoController.deleteOrdemServico);

// rotas de vendas
router.post('/api/oticas/empresas/:idEmpresa/vendas', IsAuthApiKey, vendaController.postVenda);
router.get('/api/oticas/empresas/:idEmpresa/vendas', IsAuthApiKey, vendaController.getVenda);
router.get('/api/oticas/empresas/:idEmpresa/vendas/:id', IsAuthApiKey, vendaController.getIdVenda);
router.get('/api/oticas/empresas/:idEmpresa/vendas/caixa/:id', IsAuthApiKey, vendaController.getCaixaIdVenda);
router.put('/api/oticas/empresas/:idEmpresa/vendas/:id', IsAuthApiKey, vendaController.putVenda);
router.delete('/api/oticas/empresas/:idEmpresa/vendas/:id', IsAuthApiKey, vendaController.deleteVenda);

// rotas de caixa
router.post('/api/oticas/empresas/:idEmpresa/caixas', IsAuthApiKey, caixaController.postCaixa);
router.get('/api/oticas/empresas/:idEmpresa/caixas', IsAuthApiKey, caixaController.listCaixa);
router.get('/api/oticas/empresas/:idEmpresa/caixas/aberto', IsAuthApiKey, caixaController.caixaAberto);
router.get('/api/oticas/empresas/:idEmpresa/caixas/:id', IsAuthApiKey, caixaController.getCaixa);
router.put('/api/oticas/empresas/:idEmpresa/caixas/:id', IsAuthApiKey, caixaController.putCaixa);
router.patch('/api/oticas/empresas/:idEmpresa/caixas', IsAuthApiKey, caixaController.patchCaixa);
// router.delete('/api/oticas/empresas/:idEmpresa/caixas/:id', caixaController.deleteCaixa);

// rotas de dashboard
router.get('/api/oticas/empresas/:idEmpresa/dashboard/diario', IsAuthApiKey, dashboardController.getVendaSemanal);
router.get('/api/oticas/empresas/:idEmpresa/dashboard/dashdiario', IsAuthApiKey, dashboardController.getVendaSemanal);
router.get('/api/oticas/empresas/:idEmpresa/dashboard/mensagens', IsAuthApiKey, dashboardController.listMensagens);
router.get('/api/oticas/empresas/:idEmpresa/dashboard/mensal', IsAuthApiKey, dashboardController.getConsolidadoMensal);
router.get('/api/oticas/empresas/:idEmpresa/dashboard/anual', IsAuthApiKey, dashboardController.getConsolidadoAnual);
// router.get('/api/oticas/empresas/:idEmpresa/vendas/caixa/:id', IsAuthApiKey, vendaController.getCaixaIdVenda);
// router.put('/api/oticas/empresas/:idEmpresa/vendas/:id', IsAuthApiKey, vendaController.putVenda);
// router.delete('/api/oticas/empresas/:idEmpresa/vendas/:id', IsAuthApiKey, vendaController.deleteVenda);

// rotas de reports
router.get('/api/oticas/empresas/:idEmpresa/financeiro/mensal', IsAuthApiKey, financeiroController.getFinanceiro);
router.get('/api/oticas/empresas/:idEmpresa/financeiro/anual', IsAuthApiKey, financeiroController.getFinanceiroMeses);
router.get('/api/oticas/empresas/:idEmpresa/financeiro/anual/:mes/:ano', IsAuthApiKey, financeiroController.getFinanceiroMes);

// rotas de grupo de produtos
router.post('/api/oticas/empresas/:idEmpresa/grupoProduto', IsAuthApiKey, grupoProdutoController.postGrupoProduto);
router.get('/api/oticas/empresas/:idEmpresa/grupoProduto', IsAuthApiKey, grupoProdutoController.listGrupoProduto);
router.get('/api/oticas/empresas/:idEmpresa/grupoProduto/:id', IsAuthApiKey, grupoProdutoController.getGrupoProduto);
router.put('/api/oticas/empresas/:idEmpresa/grupoProduto/:id', IsAuthApiKey, grupoProdutoController.putGrupoProduto);
router.delete('/api/oticas/empresas/:idEmpresa/grupoProduto/:id', IsAuthApiKey, grupoProdutoController.deleteGrupoProduto);

// rotas de sub grupo de produtos
router.post('/api/oticas/empresas/:idEmpresa/subGrupoProduto', IsAuthApiKey, subGrupoProdutoController.postSubGrupoProduto);
router.get('/api/oticas/empresas/:idEmpresa/subGrupoProduto', IsAuthApiKey, subGrupoProdutoController.listSubGrupoProduto);
router.get('/api/oticas/empresas/:idEmpresa/subGrupoProduto/:id', IsAuthApiKey, subGrupoProdutoController.getSubGrupoProduto);
router.put('/api/oticas/empresas/:idEmpresa/subGrupoProduto/:id', IsAuthApiKey, subGrupoProdutoController.putSubGrupoProduto);
router.delete('/api/oticas/empresas/:idEmpresa/subGrupoProduto/:id', IsAuthApiKey, subGrupoProdutoController.deleteSubGrupoProduto);

// rotas de marca de produtos
router.post('/api/oticas/empresas/:idEmpresa/marcaProduto', IsAuthApiKey, marcaProdutoController.postMarcaProduto);
router.get('/api/oticas/empresas/:idEmpresa/marcaProduto', IsAuthApiKey, marcaProdutoController.listMarcaProduto);
router.get('/api/oticas/empresas/:idEmpresa/marcaProduto/:id', IsAuthApiKey, marcaProdutoController.getMarcaProduto);
router.put('/api/oticas/empresas/:idEmpresa/marcaProduto/:id', IsAuthApiKey, marcaProdutoController.putMarcaProduto);
router.delete('/api/oticas/empresas/:idEmpresa/marcaProduto/:id', IsAuthApiKey, marcaProdutoController.deleteMarcaProduto);

// rotas de coleção de produtos
router.post('/api/oticas/empresas/:idEmpresa/colecaoProduto', IsAuthApiKey, colecaoProdutoController.postColecaoProduto);
router.get('/api/oticas/empresas/:idEmpresa/colecaoProduto', IsAuthApiKey, colecaoProdutoController.listColecaoProduto);
router.get('/api/oticas/empresas/:idEmpresa/colecaoProduto/:id', IsAuthApiKey, colecaoProdutoController.getColecaoProduto);
router.put('/api/oticas/empresas/:idEmpresa/colecaoProduto/:id', IsAuthApiKey, colecaoProdutoController.putColecaoProduto);
router.delete('/api/oticas/empresas/:idEmpresa/colecaoProduto/:id', IsAuthApiKey, colecaoProdutoController.deleteColecaoProduto);

// rotas de categorias
router.post('/api/oticas/empresas/:idEmpresa/categorias', IsAuthApiKey, categoriaController.postCategoria);
router.get('/api/oticas/empresas/:idEmpresa/categorias', IsAuthApiKey, categoriaController.listCategoria);
router.get('/api/oticas/empresas/:idEmpresa/categorias/:id', IsAuthApiKey, categoriaController.getCategoria);
router.put('/api/oticas/empresas/:idEmpresa/categorias/:id', IsAuthApiKey, categoriaController.putCategoria);
router.delete('/api/oticas/empresas/:idEmpresa/categorias/:id', IsAuthApiKey, categoriaController.deleteCategoria);

// rotas de origens
router.post('/api/oticas/empresas/:idEmpresa/origens', IsAuthApiKey, origemController.postOrigem);
router.get('/api/oticas/empresas/:idEmpresa/origens', IsAuthApiKey, origemController.listOrigem);
router.get('/api/oticas/empresas/:idEmpresa/origens/:id', IsAuthApiKey, origemController.getOrigem);
router.put('/api/oticas/empresas/:idEmpresa/origens/:id', IsAuthApiKey, origemController.putOrigem);
router.delete('/api/oticas/empresas/:idEmpresa/origens/:id', IsAuthApiKey, origemController.deleteOrigem);

// rotas de plano de conta
router.post('/api/oticas/empresas/:idEmpresa/planos', IsAuthApiKey, planoContaController.postPlanoConta);
router.get('/api/oticas/empresas/:idEmpresa/planos', IsAuthApiKey, planoContaController.listPlanoConta);
router.get('/api/oticas/empresas/:idEmpresa/planos/:id', IsAuthApiKey, planoContaController.getPlanoConta);
router.put('/api/oticas/empresas/:idEmpresa/planos/:id', IsAuthApiKey, planoContaController.putPlanoConta);
router.delete('/api/oticas/empresas/:idEmpresa/planos/:id', IsAuthApiKey, planoContaController.deletePlanoConta);

// rotas de forma de recebimento
router.post('/api/oticas/empresas/:idEmpresa/formas', IsAuthApiKey, formaRecebimentoController.postFormaRecebimento);
router.get('/api/oticas/empresas/:idEmpresa/formas', IsAuthApiKey, formaRecebimentoController.listFormaRecebimento);
router.get('/api/oticas/empresas/:idEmpresa/formas/:id', IsAuthApiKey, formaRecebimentoController.getFormaRecebimento);
router.put('/api/oticas/empresas/:idEmpresa/formas/:id', IsAuthApiKey, formaRecebimentoController.putFormaRecebimento);
router.delete('/api/oticas/empresas/:idEmpresa/formas/:id', IsAuthApiKey, formaRecebimentoController.deleteFormaRecebimento);

// rotas de bancos
router.post('/api/oticas/empresas/:idEmpresa/bancos', IsAuthApiKey, bancoController.postBanco);
router.get('/api/oticas/empresas/:idEmpresa/bancos', IsAuthApiKey, bancoController.listBanco);
router.get('/api/oticas/empresas/:idEmpresa/bancos/:id', IsAuthApiKey, bancoController.getBanco);
router.put('/api/oticas/empresas/:idEmpresa/bancos/:id', IsAuthApiKey, bancoController.putBanco);
router.delete('/api/oticas/empresas/:idEmpresa/bancos/:id', IsAuthApiKey, bancoController.deleteBanco);

// rotas de contas a pagar e receber
router.post('/api/oticas/empresas/:idEmpresa/contas', IsAuthApiKey, contasController.postConta);
router.get('/api/oticas/empresas/:idEmpresa/contas', IsAuthApiKey, contasController.listConta);
router.get('/api/oticas/empresas/:idEmpresa/contas/:id', IsAuthApiKey, contasController.getConta);
router.put('/api/oticas/empresas/:idEmpresa/contas/:id', IsAuthApiKey, contasController.putConta);
router.delete('/api/oticas/empresas/:idEmpresa/contas/:id', IsAuthApiKey, contasController.deleteConta);

// rotas de mensagens
router.post('/api/oticas/empresas/:idEmpresa/mensagens', IsAuthApiKey, mensagemController.postMensagem);
router.get('/api/oticas/empresas/:idEmpresa/mensagens', IsAuthApiKey, mensagemController.listMensagem);
router.get('/api/oticas/empresas/:idEmpresa/mensagens/:id', IsAuthApiKey, mensagemController.getMensagem);
router.put('/api/oticas/empresas/:idEmpresa/mensagens/:id', IsAuthApiKey, mensagemController.putMensagem);
router.delete('/api/oticas/empresas/:idEmpresa/mensagens/:id', IsAuthApiKey, mensagemController.deleteMensagem);

// Localizar CEPs
router.get('/api/oticas/cep/:cep', IsAuthApiKey, cepController.getCep);

// Localizar bancos por código
router.get('/api/oticas/bancos', IsAuthApiKey, codBancoController.getBanco);
router.get('/api/oticas/bancos/:id', IsAuthApiKey, codBancoController.getIdBanco);

// Localizar NCMs
router.get('/api/oticas/ncm', IsAuthApiKey, ncmController.getNcm);

// Importar Produto por nfe
router.post('/api/oticas/empresas/:idEmpresa/produtos/nfe', IsAuthApiKey, uploadXml.single('xml'), nfeController.uploadAndImportNFe);

module.exports = router