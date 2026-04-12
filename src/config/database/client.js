const postgres = require('postgres');
const { drizzle } = require('drizzle-orm/postgres-js');
const { migrate } = require('drizzle-orm/postgres-js/migrator');
const { readFileSync } = require('node:fs');
const fs = require('fs');
const path = require('path');
const { tb_tasks } = require('./schema');

const client = postgres(process.env.POSTGRES_URL, { max: 1 });
const database = drizzle(client);

async function runMigrations() {
  await migrate(database, {
    migrationsFolder: path.join(process.cwd(), 'drizzle'),
  });
}

async function runImportData() {
  const filePath = 'tasks.json';
  if (!fs.existsSync(filePath)) return;
  const tasksData = JSON.parse(readFileSync(filePath, 'utf8'));

  const existing = await database.select().from(tb_tasks).limit(1);
  if (existing.length > 0) return;

  await database.delete(tb_tasks);
  const formattedData = tasksData.map((task) => ({ ...task, dueDate: new Date(task.dueDate) }));
  await database.insert(tb_tasks).values(formattedData);
}

runMigrations()
  .then(() => {
    return runImportData();
  })
  .catch((err) => {
    console.error('[db] Fatal error during initialization:', err);
    process.exit(1);
  });

module.exports = { database };
