const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.resolve(__dirname, '../../../firebase-key.json'));

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
