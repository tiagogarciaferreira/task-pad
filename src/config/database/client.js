const postgres = require('postgres');
const { drizzle } = require('drizzle-orm/postgres-js');
const { readFileSync } = require('node:fs');
const fs = require('fs');
const { tb_tasks } = require('./schema');

const client = postgres(process.env.DATABASE_URL);
const database = drizzle(client);

async function importTasks() {
  const filePath = 'tasks.json';
  if (!fs.existsSync(filePath)) return;
  const tasksData = JSON.parse(readFileSync(filePath, 'utf8'));

  await database.delete(tb_tasks);
  const formattedData = tasksData.map((task) => ({ ...task, dueDate: new Date(task.dueDate) }));
  await database.insert(tb_tasks).values(formattedData);
}

if (process.env.NODE_ENV === 'development') {
  importTasks()
    .catch((err) => {
      console.error('Error importing tasks:', err);
    });
}

module.exports = { database };
