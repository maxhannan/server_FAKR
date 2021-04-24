const AWS = require('aws-sdk');
const uuid = require('uuid');

const {
  AWS_ACCESS_KEY,
  AWS_SECRET_KEY,
  AWS_BUCKET_NAME,
  AWS_REGION,
} = require('./config');

const region = AWS_REGION;
const bucketName = AWS_BUCKET_NAME;
const accessKeyId = AWS_ACCESS_KEY;
const secretAccessKey = AWS_SECRET_KEY;
const s3 = new AWS.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: 'v4',
});

const generateUploadURL = async () => {
  const imageName = uuid.v4();

  const params = {
    Bucket: bucketName,
    Key: imageName,
    Expires: 60,
  };

  const uploadURL = await s3.getSignedUrlPromise('putObject', params);
  return uploadURL;
};

module.exports = generateUploadURL;
