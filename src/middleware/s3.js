const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: 'us-east-1', // A região do seu bucket
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const uploadToS3 = async (file, bucketName) => {
  const params = {
    Bucket: bucketName,  // Certifique-se de que o Bucket está sendo passado corretamente
    Key: file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype
  };

  try {
    const data = await s3Client.send(new PutObjectCommand(params));
    console.log('Arquivo enviado com sucesso:', data);
  } catch (err) {
    console.error('Erro ao enviar arquivo para o S3:', err);
    throw err;
  }
};

module.exports = { uploadToS3 };
