const { verifyToken } = require('../config/firebase/firebase-admin');

const authMiddleware = async (req, res, next) => {
try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedUser = await verifyToken(idToken);

    if (!decodedUser) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Invalid or expired token',
      });
    }

    req.user = decodedUser;
    next();

  }catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token validation failed',
    });
  }
};

module.exports = { authMiddleware };
