const fs = require("fs");
const csv = require("csv-parser");
const Ibpt = require("../models/Ibpt"); // Importando seu modelo

// Função para formatar a data no formato desejado
function formatDate(dateStr) {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}

// Controller para importar dados do CSV
exports.importarIbpt = (req, res) => {
  const results = [];

  // Lê o arquivo CSV do diretório 'files'
  fs.createReadStream("./files/TabelaIBPT-MG.csv")
    .pipe(csv({ separator: ";" })) // CSV separado por ";"
    .on("data", (row) => results.push(row)) // Armazena cada linha
    .on("end", async () => {
      try {
        const dataToInsert = results.map((item) => ({
          Codigo: item.codigo,
          Descricao: item.descricao?.replace(/"/g, ""),
          nacionalFederal: parseFloat(item.nacionalfederal) || 0,
          importadosfederal: parseFloat(item.importadosfederal) || 0,
          estadual: parseFloat(item.estadual) || 0,
          vigenciainicio: formatDate(item.vigenciainicio),
          vigenciafim: formatDate(item.vigenciafim),
          chave: item.chave,
          versao: item.versao,
          uf: 'MG',
          cUf: 31,
        }));

        // Insere os dados no banco
        await Ibpt.bulkCreate(dataToInsert);

        res.send("✅ Importação concluída com sucesso!");
      } catch (error) {
        console.error("Erro ao salvar no banco:", error);
        res.status(500).send("Erro ao salvar dados");
      }
    })
    .on("error", (err) => {
      console.error("Erro ao ler CSV:", err);
      res.status(500).send("Erro ao ler arquivo CSV");
    });
};