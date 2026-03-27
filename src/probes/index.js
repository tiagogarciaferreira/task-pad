const path = require('path');
const fs = require('fs');

let isReady = false;
let angularBuilt = false;

function checkAngularAssets() {
  const angularIndexPath = path.join(__dirname, '../../public', 'index.html');
  angularBuilt = fs.existsSync(angularIndexPath);
  return angularBuilt;
}

async function checkDatabaseConnection(prisma) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

function setupProbes(app, prisma) {
  app.get('/live', (req, res) => {
    res.status(200).json({
      status: 'alive',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/ready', async (req, res) => {
    const dbOk = await checkDatabaseConnection(prisma);
    const angularOk = checkAngularAssets();

    const allReady = dbOk && angularOk && isReady;

    if (allReady) {
      res.status(200).json({
        status: 'ready',
        database: 'connected',
        frontend: 'built',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        database: dbOk ? 'connected' : 'disconnected',
        frontend: angularOk ? 'built' : 'missing',
        ready: isReady,
        timestamp: new Date().toISOString(),
      });
    }
  });

  app.get('/health', async (req, res) => {
    const dbOk = await checkDatabaseConnection(prisma);
    const angularOk = checkAngularAssets();

    res.status(200).json({
      status: dbOk && angularOk ? 'healthy' : 'degraded',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      database: dbOk ? 'connected' : 'disconnected',
      frontend: angularOk ? 'built' : 'missing',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  return {
    setReady: () => {
      isReady = true;
    },
    checkDb: () => checkDatabaseConnection(prisma),
    checkFrontend: checkAngularAssets,
  };
}

module.exports = { setupProbes };
