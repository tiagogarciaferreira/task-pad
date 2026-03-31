const dotenvFlow = require('dotenv-flow');

dotenvFlow.config({
  node_env: process.env.NODE_ENV || 'development',
  default_node_env: 'development',
});

module.exports = {
  schema: './src/database/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
