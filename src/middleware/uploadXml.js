// src/middleware/uploadXml.js
const multer = require('multer');
const storage = multer.memoryStorage();  // carrega o arquivo em req.file.buffer

const uploadXml = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/xml' || file.originalname.endsWith('.xml')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos XML são permitidos'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // limite 5MB (opcional)
});

module.exports = uploadXml;