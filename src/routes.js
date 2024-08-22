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
router.post('/oticas/empresas/:idEmpresa/clientes', clienteController.postCliente);
router.put('/oticas/empresas/:idEmpresa/clientes/:id', clienteController.putCliente);
router.get('/oticas/empresas/:idEmpresa/clientes', clienteController.listCliente);
router.get('/oticas/empresas/:idEmpresa/clientes/pacientes', clienteController.getClientes);
router.get('/oticas/empresas/:idEmpresa/clientes/aniversariantes', clienteController.listClienteAniversario);
router.get('/oticas/empresas/:idEmpresa/clientes/aniversariantes/mes', clienteController.listClienteAniversarioMes);
router.get('/oticas/empresas/:idEmpresa/clientes/aniversariantes/ano', clienteController.listAniversariantesNoAno);
router.get('/oticas/empresas/:idEmpresa/clientes/:id', clienteController.getCliente);
router.get('/oticas/empresas/:idEmpresa/clientes/cpf/:cpf', clienteController.getClienteCpf);
router.delete('/oticas/empresas/:idEmpresa/clientes/:id', clienteController.deleteCliente);

// rota de médicos
router.post('/oticas/empresas/:idEmpresa/medicos', IsAuthApiKey, medicoController.postMedico);
router.get('/oticas/empresas/:idEmpresa/medicos', IsAuthApiKey, medicoController.listMedicos);
router.get('/oticas/empresas/:idEmpresa/medicos/cpf/:cpf', IsAuthApiKey, medicoController.getMedico);
router.get('/oticas/empresas/:idEmpresa/medicos/:id', IsAuthApiKey, medicoController.getIdMedico);
router.put('/oticas/empresas/:idEmpresa/medicos/cpf/:cpf', IsAuthApiKey, medicoController.putMedico);
router.put('/oticas/empresas/:idEmpresa/medicos/:id', IsAuthApiKey, medicoController.putIdMedico);
router.delete('/oticas/empresas/:idEmpresa/medicos/:id', IsAuthApiKey, medicoController.deleteMedico);


// rotas de receita médica
router.post('/oticas/empresas/:idEmpresa/receitas', receitaMedicaController.postReceita);
router.get('/oticas/empresas/:idEmpresa/receitas', receitaMedicaController.listReceitas);
router.get('/oticas/empresas/:idEmpresa/receitas/aniversario', receitaMedicaController.listReceitaAniversario);
router.get('/oticas/empresas/:idEmpresa/receitas/aniversario/hoje', receitaMedicaController.listReceitaAniversarioHoje);
router.get('/oticas/empresas/:idEmpresa/receitas/aniversario/mes', receitaMedicaController.listAniversarioMes);
router.get('/oticas/empresas/:idEmpresa/receitas/aniversario/ano', receitaMedicaController.listAniversarioAno);
router.get('/oticas/empresas/:idEmpresa/receitas/medico/:idMedico', receitaMedicaController.getReceitaMedico);
router.get('/oticas/empresas/:idEmpresa/receitas/paciente/:idCliente', receitaMedicaController.getReceitaPaciente);
router.get('/oticas/empresas/:idEmpresa/receitas/:id', receitaMedicaController.getReceita);
router.put('/oticas/empresas/:idEmpresa/receitas/:id', receitaMedicaController.putReceita);
router.delete('/oticas/empresas/:idEmpresa/receitas/:id', receitaMedicaController.deleteReceita);

// rotas de forncedores
router.post('/oticas/empresas/:idEmpresa/fornecedores', fornecedorController.postFornecedor);
router.get('/oticas/empresas/:idEmpresa/fornecedores', fornecedorController.listFornecedor);
router.get('/oticas/empresas/:idEmpresa/fornecedores/:id', fornecedorController.getFornecedor);
router.get('/oticas/empresas/:idEmpresa/fornecedores/cnpj/:cnpj', fornecedorController.getCnpjFornecedor);
router.put('/oticas/empresas/:idEmpresa/fornecedores/:id', fornecedorController.putFornecedor);
router.delete('/oticas/empresas/:idEmpresa/fornecedores/:id', fornecedorController.deleteFornecedor);

// rotas de laboratórios
router.post('/oticas/empresas/:idEmpresa/laboratorios', laboratorioController.postLaboratorio);
router.get('/oticas/empresas/:idEmpresa/laboratorios', laboratorioController.listLaboratorio);
router.get('/oticas/empresas/:idEmpresa/laboratorios/:id', laboratorioController.getLaboratorio);
router.put('/oticas/empresas/:idEmpresa/laboratorios/:id', laboratorioController.putLaboratorio);
router.delete('/oticas/empresas/:idEmpresa/laboratorios/:id', laboratorioController.deleteLaboratorio);

// rotas de vendedores
router.post('/oticas/empresas/:idEmpresa/vendedores', vendedorController.postVendedor);
router.get('/oticas/empresas/:idEmpresa/vendedores', vendedorController.listVendedores);
router.get('/oticas/empresas/:idEmpresa/vendedores/:id', vendedorController.getVendedor);
router.put('/oticas/empresas/:idEmpresa/vendedores/:id', vendedorController.putVendedor);
router.delete('/oticas/empresas/:idEmpresa/vendedores/:id', vendedorController.deleteVendedor);

// rotas de usuários
router.post('/oticas/empresas/:idEmpresa/usuarios', usuarioController.postUsuario);
router.get('/oticas/empresas/:idEmpresa/usuarios', usuarioController.listUsuarios);
router.get('/oticas/empresas/:idEmpresa/usuarios/:id', usuarioController.getUsuario);
router.get('/oticas/empresas/:idEmpresa/usuarios/login/:id', usuarioController.loginUsuario);
router.put('/oticas/empresas/:idEmpresa/usuarios/:id', usuarioController.putUsuario);
router.delete('/oticas/empresas/:idEmpresa/usuarios/:id', usuarioController.deletarUsuario);

// rotas de produtos
router.post('/oticas/empresas/:idEmpresa/produtos', produtoController.postProduto);
router.get('/oticas/empresas/:idEmpresa/produtos', produtoController.listProdutos);
router.get('/oticas/empresas/:idEmpresa/produtos/:id', produtoController.getProduto);
router.get('/oticas/empresas/:idEmpresa/produtos/ean/:codigoBarras', produtoController.getProdutoEan);
router.put('/oticas/empresas/:idEmpresa/produtos/:id', produtoController.putProduto);
router.patch('/oticas/empresas/:idEmpresa/produtos/:referencia', produtoController.patchProduto);
router.delete('/oticas/empresas/:idEmpresa/produtos/:id', produtoController.deleteProduto);

// rotas de orçamentos
router.post('/oticas/empresas/:idEmpresa/orcamentos', orcamentoController.postOrcamento);
router.get('/oticas/empresas/:idEmpresa/orcamentos', orcamentoController.getOrcamentos);
router.get('/oticas/empresas/:idEmpresa/orcamentos/so', orcamentoController.getOrcamentosSO);
router.get('/oticas/empresas/:idEmpresa/orcamentos/:id', orcamentoController.getIdOrcamento);
router.get('/oticas/empresas/:idEmpresa/orcamentos/vendedor/:idVendedor', orcamentoController.getIdVendedorOrcamento);
router.put('/oticas/empresas/:idEmpresa/orcamentos/:id', orcamentoController.putOrcamento);
router.delete('/oticas/empresas/:idEmpresa/orcamentos/:id', orcamentoController.deleteOrcamento);

// rotas de ordem de serviços
router.post('/oticas/empresas/:idEmpresa/ordemServico', ordemServicoController.postOrdemServico);
router.get('/oticas/empresas/:idEmpresa/ordemServico', ordemServicoController.getOrdemServico);
router.get('/oticas/empresas/:idEmpresa/ordemServico/sv', ordemServicoController.getOrdemServicoSV);
router.get('/oticas/empresas/:idEmpresa/ordemServico/:id', ordemServicoController.getIdOrdemServico);
router.put('/oticas/empresas/:idEmpresa/ordemServico/:id', ordemServicoController.putOrdemServico);
router.delete('/oticas/empresas/:idEmpresa/ordemServico/:id', ordemServicoController.deleteOrdemServico);

// rotas de vendas
router.post('/oticas/empresas/:idEmpresa/vendas', vendaController.postVenda);
router.get('/oticas/empresas/:idEmpresa/vendas', vendaController.getVenda);
router.get('/oticas/empresas/:idEmpresa/vendas/:id', vendaController.getIdVenda);
router.get('/oticas/empresas/:idEmpresa/vendas/caixa/:id', vendaController.getCaixaIdVenda);
router.put('/oticas/empresas/:idEmpresa/vendas/:id', vendaController.putVenda);
router.delete('/oticas/empresas/:idEmpresa/vendas/:id', vendaController.deleteVenda);

// rotas de caixa
router.post('/oticas/empresas/:idEmpresa/caixas', caixaController.postCaixa);
router.get('/oticas/empresas/:idEmpresa/caixas', caixaController.listCaixa);
router.get('/oticas/empresas/:idEmpresa/caixas/aberto', caixaController.caixaAberto);
router.get('/oticas/empresas/:idEmpresa/caixas/:id', caixaController.getCaixa);
router.put('/oticas/empresas/:idEmpresa/caixas/:id', caixaController.putCaixa);
router.patch('/oticas/empresas/:idEmpresa/caixas', caixaController.patchCaixa);
// router.delete('/oticas/empresas/:idEmpresa/caixas/:id', caixaController.deleteCaixa);

// rotas de dashboard
router.get('/oticas/empresas/:idEmpresa/dashboard/diario', dashboardController.getVendaSemanal);
router.get('/oticas/empresas/:idEmpresa/dashboard/mensagens', dashboardController.listMensagens);
// router.get('/oticas/empresas/:idEmpresa/vendas/caixa/:id', vendaController.getCaixaIdVenda);
// router.put('/oticas/empresas/:idEmpresa/vendas/:id', vendaController.putVenda);
// router.delete('/oticas/empresas/:idEmpresa/vendas/:id', vendaController.deleteVenda);

// rotas de grupo de produtos
router.post('/oticas/empresas/:idEmpresa/grupoProduto', grupoProdutoController.postGrupoProduto);
router.get('/oticas/empresas/:idEmpresa/grupoProduto', grupoProdutoController.listGrupoProduto);
router.get('/oticas/empresas/:idEmpresa/grupoProduto/:id', grupoProdutoController.getGrupoProduto);
router.put('/oticas/empresas/:idEmpresa/grupoProduto/:id', grupoProdutoController.putGrupoProduto);
router.delete('/oticas/empresas/:idEmpresa/grupoProduto/:id', grupoProdutoController.deleteGrupoProduto);

// rotas de sub grupo de produtos
router.post('/oticas/empresas/:idEmpresa/subGrupoProduto', subGrupoProdutoController.postSubGrupoProduto);
router.get('/oticas/empresas/:idEmpresa/subGrupoProduto', subGrupoProdutoController.listSubGrupoProduto);
router.get('/oticas/empresas/:idEmpresa/subGrupoProduto/:id', subGrupoProdutoController.getSubGrupoProduto);
router.put('/oticas/empresas/:idEmpresa/subGrupoProduto/:id', subGrupoProdutoController.putSubGrupoProduto);
router.delete('/oticas/empresas/:idEmpresa/subGrupoProduto/:id', subGrupoProdutoController.deleteSubGrupoProduto);

// rotas de marca de produtos
router.post('/oticas/empresas/:idEmpresa/marcaProduto', marcaProdutoController.postMarcaProduto);
router.get('/oticas/empresas/:idEmpresa/marcaProduto', marcaProdutoController.listMarcaProduto);
router.get('/oticas/empresas/:idEmpresa/marcaProduto/:id', marcaProdutoController.getMarcaProduto);
router.put('/oticas/empresas/:idEmpresa/marcaProduto/:id', marcaProdutoController.putMarcaProduto);
router.delete('/oticas/empresas/:idEmpresa/marcaProduto/:id', marcaProdutoController.deleteMarcaProduto);

// rotas de coleção de produtos
router.post('/oticas/empresas/:idEmpresa/colecaoProduto', colecaoProdutoController.postColecaoProduto);
router.get('/oticas/empresas/:idEmpresa/colecaoProduto', colecaoProdutoController.listColecaoProduto);
router.get('/oticas/empresas/:idEmpresa/colecaoProduto/:id', colecaoProdutoController.getColecaoProduto);
router.put('/oticas/empresas/:idEmpresa/colecaoProduto/:id', colecaoProdutoController.putColecaoProduto);
router.delete('/oticas/empresas/:idEmpresa/colecaoProduto/:id', colecaoProdutoController.deleteColecaoProduto);

// rotas de categorias
router.post('/oticas/empresas/:idEmpresa/categorias', categoriaController.postCategoria);
router.get('/oticas/empresas/:idEmpresa/categorias', categoriaController.listCategoria);
router.get('/oticas/empresas/:idEmpresa/categorias/:id', categoriaController.getCategoria);
router.put('/oticas/empresas/:idEmpresa/categorias/:id', categoriaController.putCategoria);
router.delete('/oticas/empresas/:idEmpresa/categorias/:id', categoriaController.deleteCategoria);

// rotas de plano de conta
router.post('/oticas/empresas/:idEmpresa/planos', planoContaController.postPlanoConta);
router.get('/oticas/empresas/:idEmpresa/planos', planoContaController.listPlanoConta);
router.get('/oticas/empresas/:idEmpresa/planos/:id', planoContaController.getPlanoConta);
router.put('/oticas/empresas/:idEmpresa/planos/:id', planoContaController.putPlanoConta);
router.delete('/oticas/empresas/:idEmpresa/planos/:id', planoContaController.deletePlanoConta);

// rotas de forma de recebimento
router.post('/oticas/empresas/:idEmpresa/formas', formaRecebimentoController.postFormaRecebimento);
router.get('/oticas/empresas/:idEmpresa/formas', formaRecebimentoController.listFormaRecebimento);
router.get('/oticas/empresas/:idEmpresa/formas/:id', formaRecebimentoController.getFormaRecebimento);
router.put('/oticas/empresas/:idEmpresa/formas/:id', formaRecebimentoController.putFormaRecebimento);
router.delete('/oticas/empresas/:idEmpresa/formas/:id', formaRecebimentoController.deleteFormaRecebimento);

// rotas de bancos
router.post('/oticas/empresas/:idEmpresa/bancos', bancoController.postBanco);
router.get('/oticas/empresas/:idEmpresa/bancos', bancoController.listBanco);
router.get('/oticas/empresas/:idEmpresa/bancos/:id', bancoController.getBanco);
router.put('/oticas/empresas/:idEmpresa/bancos/:id', bancoController.putBanco);
router.delete('/oticas/empresas/:idEmpresa/bancos/:id', bancoController.deleteBanco);

// rotas de contas a pagar e receber
router.post('/oticas/empresas/:idEmpresa/contas', contasController.postConta);
router.get('/oticas/empresas/:idEmpresa/contas', contasController.listConta);
router.get('/oticas/empresas/:idEmpresa/contas/:id', contasController.getConta);
router.put('/oticas/empresas/:idEmpresa/contas/:id', contasController.putConta);
router.delete('/oticas/empresas/:idEmpresa/contas/:id', contasController.deleteConta);

// Localizar CEPs
router.get('/oticas/cep/:cep', cepController.getCep);

// Localizar bancos por código
router.get('/oticas/bancos', codBancoController.getBanco);
router.get('/oticas/bancos/:id', codBancoController.getIdBanco);

// Localizar NCMs
router.get('/oticas/ncm', ncmController.getNcm);

module.exports = router