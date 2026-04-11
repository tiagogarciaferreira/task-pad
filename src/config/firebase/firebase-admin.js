const admin = require('firebase-admin');
const dotenvFlow = require('dotenv-flow');

dotenvFlow.config({
  node_env: process.env.NODE_ENV || 'development',
  default_node_env: 'development',
});

const base64ServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
const decodedJsonString = Buffer.from(base64ServiceAccount, 'base64').toString('utf-8');
const serviceAccountCredential = JSON.parse(decodedJsonString);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountCredential),
  });
}

const verifyToken = async (idToken) => {
  try {
    return  await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    return null;
  }
};

module.exports = { verifyToken };
