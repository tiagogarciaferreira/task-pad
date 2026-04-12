const { pgTable, uuid, text, real, timestamp } = require('drizzle-orm/pg-core');

const tb_tasks = pgTable('tb_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  estimatedHours: real('estimatedHours').notNull(),
  tags: text('tags').array().default([]).notNull(),
  status: text('status').default('To Do').notNull(),
  priority: text('priority').notNull(),
  dueDate: timestamp('dueDate', { withTimezone: true }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

module.exports = { tb_tasks };
