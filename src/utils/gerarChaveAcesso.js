function gerarChaveAcesso({ cUF, dataEmissao, cnpj, mod, serie, nNF, tpEmis, cNF }) {
  const AAMM = `${dataEmissao.getFullYear().toString().slice(2)}${(dataEmissao.getMonth() + 1).toString().padStart(2, '0')}`;
  const base = (
    cUF +
    AAMM +
    cnpj.padStart(14, '0') +
    mod.padStart(2, '0') +
    serie.toString().padStart(3, '0') +
    nNF.toString().padStart(9, '0') +
    tpEmis +
    cNF.toString().padStart(8, '0')
  );

  // Cálculo do dígito verificador (módulo 11)
  let peso = 2;
  let soma = 0;

  for (let i = base.length - 1; i >= 0; i--) {
    soma += parseInt(base[i], 10) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }

  const resto = soma % 11;
  let cDV = 11 - resto;
  if (cDV >= 10) cDV = 0;

  // console.log('keyAccess', base + cDV.toString());
  return base + cDV.toString();
}

module.exports = gerarChaveAcesso;