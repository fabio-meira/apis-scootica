// config/s3Client.js
require('dotenv').config();  // se ainda não fez no entrypoint

const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.S3_BUCKET_NAME;

if (!BUCKET) {
  throw new Error('A variável de ambiente AWS_BUCKET_NAME não foi definida.');
}

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = { s3, BUCKET, PutObjectCommand, GetObjectCommand, DeleteObjectCommand };
