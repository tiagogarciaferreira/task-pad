const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const { readFileSync } = require('node:fs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/* TODO: Remover apenas para testes */
async function importTasks() {
  try {
    const tasksData = JSON.parse(readFileSync('tasks.json', 'utf8'));

    console.log(`📋 Importando ${tasksData.length} tarefas...`);

    const result = await prisma.task.createMany({
      data: tasksData,
      skipDuplicates: true, // Opcional: pula registros duplicados
    });

    console.log(`✅ Concluído! ${result.count} tarefas importadas.`);
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

//importTasks();

module.exports = { prisma };
