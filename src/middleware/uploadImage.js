// middlewares/upload.js
const multer = require('multer');

const storage = multer.memoryStorage(); // Armazena em memória para enviar ao S3

const uploadImage = multer({ storage });

module.exports = uploadImage;