const os = require('os');

function resolveHost() {
  if (process.env.HOST) return process.env.HOST;
  const interfaces = os.networkInterfaces();

  for (const iface of Object.values(interfaces)) {
    if (!iface) continue;
    for (const config of iface) {
      if (config.family === 'IPv4' && !config.internal) {
        return config.address;
      }
    }
  }

  return os.hostname() || 'localhost';
}

module.exports = { resolveHost };
