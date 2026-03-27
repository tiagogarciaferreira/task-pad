const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenvFlow = require('dotenv-flow');
const { randomUUID } = require('crypto');

dotenvFlow.config({
  node_env: process.env.NODE_ENV || 'development',
  default_node_env: 'development',
});

const app = express();

const { prisma } = require('./src/config/database');
const {
  TaskSchema,
  TaskUpdateSchema,
  SearchSchema
} = require('./src/schemas/task.schema');

app.use(helmet());
app.use(cors());
app.use(express.json());

const PORT = process.env.SERVER_PORT || 4000;

console.log(`🚀 Environment: ${process.env.NODE_ENV}`);
console.log(`📡 Port: ${PORT}`);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log(`🗄️  Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'not set'}`);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API working' });
});

app.post('/api/tasks', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const validation = TaskSchema.safeParse(req.body);

    if (!validation.success) {

      const errors = validation.error.issues.map((issue) => ({
        message: issue.message,
        field: issue.path.join('.'),
      }));

      return res.status(400).json({ errors: errors });
    }

    const { title, description, estimatedHours, tags, status, priority, dueDate} = validation.data;

    const existingTask = await prisma.task.findFirst({
      where: { title: title.trim(), userId: userId, },
    });

    if (existingTask) return res.status(409).json({ error: 'Task with this title already exists.' });

    const task = await prisma.task.create({
      data: {
        id: randomUUID(),
        title: title.trim(),
        description: description.trim(),
        estimatedHours: Number(estimatedHours),
        tags: tags.map((tag) => tag.trim().toUpperCase()),
        status: status,
        userId: userId,
        priority: priority,
        dueDate: new Date(dueDate),
      },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

app.get('/api/tasks/search', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
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

    const where = { userId };

    if (title) where.title = { contains: String(title), mode: 'insensitive', };
    if (statusArray.length > 0) where.status = { in: statusArray };
    if (tagsArray.length > 0) where.tags = { hasSome: tagsArray.map((tag) => tag.trim().toUpperCase()) };
    if (priorityArray.length > 0) where.priority = { in: priorityArray };

    if (estimatedHoursMin !== undefined || estimatedHoursMax !== undefined) {
      where.estimatedHours = {};
      if (estimatedHoursMin !== undefined) where.estimatedHours.gte = Number(estimatedHoursMin);
      if (estimatedHoursMax !== undefined) where.estimatedHours.lte = Number(estimatedHoursMax);
    }

    if (dueDateMin !== undefined || dueDateMax !== undefined) {
      where.dueDate = {};
      if (dueDateMin !== undefined) where.dueDate.gte = dueDateMin;
      if (dueDateMax !== undefined) where.dueDate.lte = dueDateMax;
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search tasks' });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.userId !== userId) return res.status(403).json({ error: 'Access denied' });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

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
      const duplicateTask = await prisma.task.findFirst({
        where: { title: title.trim(), userId: userId, id: { not: id },},
      });

      if (duplicateTask) return res.status(409).json({ error: 'Task with this title already exists.' });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description.trim(),
        estimatedHours: Number(estimatedHours),
        tags: tags,
        status: status,
        priority: priority,
        dueDate: new Date(dueDate),
      },
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) return res.status(404).json({ error: 'Task not found' });
    if (existingTask.userId !== userId) return res.status(403).json({ error: 'Access denied' });

    await prisma.task.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

async function getUserIdFromToken(req) {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  return '29b533c6-9446-4e33-88a3-9a5bad425954';
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
