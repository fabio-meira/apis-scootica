// middlewares/s3.js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
// const path = require('path');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const uploadToS3 = async (file, bucketName, prefix = 'uploads/') => {
  const timestamp = Date.now();
  const safeFilename = file.originalname.replace(/\s+/g, '_');
  const key = `${prefix}${timestamp}_${safeFilename}`;

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  try {
    const result = await s3Client.send(new PutObjectCommand(params));
    // console.log('Upload S3 sucesso:', key);
    return {
      key,
      result
    };
  } catch (err) {
    console.error('Erro ao enviar arquivo para o S3:', err);
    throw err;
  }
};

module.exports = { uploadToS3 };
