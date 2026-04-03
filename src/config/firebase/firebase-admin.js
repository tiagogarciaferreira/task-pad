const admin = require('firebase-admin');
const dotenvFlow = require('dotenv-flow');

dotenvFlow.config({
  node_env: process.env.NODE_ENV || 'development',
  default_node_env: 'development',
});

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
const serviceAccount = JSON.parse(serviceAccountJson);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
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
