const postgres = require('postgres');
const { drizzle } = require('drizzle-orm/postgres-js');
const { readFileSync } = require('node:fs');
const { tb_tasks } = require('./schema');

const client = postgres(process.env.DATABASE_URL);

const database = drizzle(client);

if (process.env.NODE_ENV === 'development') {
  async function importTasks() {
    const tasksData = JSON.parse(readFileSync('tasks.json', 'utf8'));
    const formattedData = tasksData.map((task) => ({ ...task, dueDate: new Date(task.dueDate) }));
    await database.delete(tb_tasks);
    await database.insert(tb_tasks).values(formattedData);
  }

  importTasks()
    .then(() => {
      console.log('Import Complete!');
    })
    .catch((err) => {
      console.error('Error importing tasks:', err);
    });
}

module.exports = { database };
