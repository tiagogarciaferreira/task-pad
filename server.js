const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const dotenvFlow = require('dotenv-flow');
const { randomUUID } = require('crypto');
const { setupProbes } = require('./src/probes');
const { authMiddleware } = require('./src/middlewares/auth.middleware');

const {
  eq,
  and,
  ilike,
  inArray,
  gte,
  lte,
  desc,
  ne,
  sql } = require('drizzle-orm');

const { tb_tasks } = require('./src/database/schema');

dotenvFlow.config({
  node_env: process.env.NODE_ENV || 'development',
  default_node_env: 'development',
});

const { database } = require('./src/database/client');
const app = express();

const {
  TaskSchema,
  TaskUpdateSchema,
  SearchSchema
} = require('./src/schemas/task.schema');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrcAttr: ["'unsafe-inline'"],
      },
    },
  }),
);

app.use(cors());
app.use(express.json());

const PORT = process.env.SERVER_PORT || 4000;
const probes = setupProbes(app, database);

app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const validation = TaskSchema.safeParse(req.body);

    if (!validation.success) {
      const errors = validation.error.issues.map((issue) => ({
        message: issue.message,
        field: issue.path.join('.'),
      }));

      return res.status(400).json({ errors: errors });
    }

    const { title, description, estimatedHours, tags, status, priority, dueDate } = validation.data;

    const [existingTask] = await database
      .select()
      .from(tb_tasks)
      .where(and(eq(tb_tasks.title, title.trim()), eq(tb_tasks.userId, userId)))
      .limit(1);

    if (existingTask)
      return res.status(409).json({ error: 'Task with this title already exists.' });

    const [task] = await database
      .insert(tb_tasks)
      .values({
        id: randomUUID(),
        title: title.trim(),
        description: description.trim(),
        estimatedHours: Number(estimatedHours),
        tags: tags.map((tag) => tag.trim().toUpperCase()),
        status: status,
        userId: userId,
        priority: priority,
        dueDate: new Date(dueDate),
      })
      .returning();

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

app.get('/api/tasks/search', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const {
      title,
      status,
      estimatedHoursMin,
      estimatedHoursMax,
      tags,
      priority,
      dueDateMin,
      dueDateMax,
    } = req.query;

    const statusArray = status ? (Array.isArray(status) ? status : [status]) : [];
    const tagsArray = tags ? (Array.isArray(tags) ? tags : [tags]) : [];
    const priorityArray = priority ? (Array.isArray(priority) ? priority : [priority]) : [];

    const validation = SearchSchema.safeParse({
      title,
      estimatedHoursMin: estimatedHoursMin ? Number(estimatedHoursMin) : undefined,
      estimatedHoursMax: estimatedHoursMax ? Number(estimatedHoursMax) : undefined,
      status: statusArray,
      tags: tagsArray,
      priority: priorityArray,
      dueDateMin: dueDateMin ? new Date(dueDateMin) : undefined,
      dueDateMax: dueDateMax ? new Date(dueDateMax) : undefined,
    });

    if (!validation.success) {
      const errors = validation.error.issues.map((issue) => ({
        message: issue.message,
        field: issue.path.join('.'),
      }));

      return res.status(400).json({ errors: errors });
    }

    const conditions = [eq(tb_tasks.userId, userId)];
    if (title) conditions.push(ilike(tb_tasks.title, `%${title}%`));
    if (statusArray.length > 0) conditions.push(inArray(tb_tasks.status, statusArray));
    if (priorityArray.length > 0) conditions.push(inArray(tb_tasks.priority, priorityArray));
    if (tagsArray.length > 0)
      conditions.push(sql`${tb_tasks.tags} && ${tagsArray.map((t) => t.trim().toUpperCase())}`);
    if (estimatedHoursMin !== undefined)
      conditions.push(gte(tb_tasks.estimatedHours, Number(estimatedHoursMin)));
    if (estimatedHoursMax !== undefined)
      conditions.push(lte(tb_tasks.estimatedHours, Number(estimatedHoursMax)));
    if (dueDateMin !== undefined) conditions.push(gte(tb_tasks.dueDate, new Date(dueDateMin)));
    if (dueDateMax !== undefined) conditions.push(lte(tb_tasks.dueDate, new Date(dueDateMax)));

    const tasks = await database
      .select()
      .from(tb_tasks)
      .where(and(...conditions))
      .orderBy(desc(tb_tasks.createdAt));

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search tasks' });
  }
});

app.get('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const [task] = await database.select().from(tb_tasks).where(eq(tb_tasks.id, id)).limit(1);

    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.userId !== userId) return res.status(403).json({ error: 'Access denied' });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const [existingTask] = await database
      .select()
      .from(tb_tasks)
      .where(eq(tb_tasks.id, id))
      .limit(1);

    if (!existingTask) return res.status(404).json({ error: 'Task not found' });
    if (existingTask.userId !== userId) return res.status(403).json({ error: 'Access denied' });

    const validation = TaskUpdateSchema.safeParse(req.body);

    if (!validation.success) {
      const errors = validation.error.issues.map((issue) => ({
        message: issue.message,
        field: issue.path.join('.'),
      }));

      return res.status(400).json({ errors: errors });
    }

    const { title, description, estimatedHours, tags, status, priority, dueDate } = validation.data;

    if (title.trim() !== existingTask.title) {
      const [duplicateTask] = await database
        .select()
        .from(tb_tasks)
        .where(
          and(eq(tb_tasks.title, title.trim()), eq(tb_tasks.userId, userId), ne(tb_tasks.id, id)),
        )
        .limit(1);

      if (duplicateTask)
        return res.status(409).json({ error: 'Task with this title already exists.' });
    }

    const [task] = await database
      .update(tb_tasks)
      .set({
        title: title.trim(),
        description: description.trim(),
        estimatedHours: Number(estimatedHours),
        tags: tags.map((tag) => tag.trim().toUpperCase()),
        status: status,
        priority: priority,
        dueDate: new Date(dueDate),
      })
      .where(eq(tb_tasks.id, id))
      .returning();

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const [existingTask] = await database
      .select()
      .from(tb_tasks)
      .where(eq(tb_tasks.id, id))
      .limit(1);

    if (!existingTask) return res.status(404).json({ error: 'Task not found' });
    if (existingTask.userId !== userId) return res.status(403).json({ error: 'Access denied' });

    await database.delete(tb_tasks).where(eq(tb_tasks.id, id));

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

if (process.env.NODE_ENV === 'production') {

  app.get(/.*\.js\.gz$/, (req, res, next) => {
    res.set('Content-Encoding', 'gzip');
    res.set('Content-Type', 'application/javascript');
    next();
  });

  app.get(/.*\.css\.gz$/, (req, res, next) => {
    res.set('Content-Encoding', 'gzip');
    res.set('Content-Type', 'text/css');
    next();
  });

  app.use(
    express.static(path.join(__dirname, 'public'), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.gz')) {
          res.set('Content-Encoding', 'gzip');
          if (filePath.endsWith('.js.gz')) {
            res.set('Content-Type', 'application/javascript');
          } else if (filePath.endsWith('.css.gz')) {
            res.set('Content-Type', 'text/css');
          }
        }
      },
    }),
  );

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

app.listen(PORT, async () => {
  const dbOk = await probes.checkDb();
  const frontendOk = probes.checkFrontend();

  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️ Database: ${dbOk ? 'connected' : 'disconnected'}`);
  console.log(`🎨 Frontend: ${frontendOk ? 'built' : 'not found (dev mode)'}`);
  console.log(`📡 Live: http://localhost:${PORT}/live`);
  console.log(`📡 Ready: http://localhost:${PORT}/ready`);
  console.log(`📡 Health: http://localhost:${PORT}/health`);

  setTimeout(() => {
    probes.setReady();
    console.log('✅ Application is ready to accept traffic');
  }, 3000);
});
