const { z } = require('zod');

const statusEnum = ['To Do', 'In Progress', 'Review', 'Done'];
const priorityEnum = ['Low', 'Medium', 'High'];

const toUTCDate = (date) => {
  const d = new Date(date);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
};

const TaskSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters'),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),

  estimatedHours: z
    .number()
    .min(0.5, 'Estimated hours must be at least 0.5 hours')
    .max(21, 'Estimated hours must not exceed 21 hours'),

  tags: z
    .array(
      z
        .string()
        .min(2, 'Tag must be at least 2 characters')
        .max(20, 'Tag must not exceed 20 characters')
        .trim(),
    )
    .min(1, 'At least one tag is required')
    .max(10, 'Maximum 10 tags allowed'),

  status: z.enum(['To Do', 'In Progress']),

  priority: z.enum(priorityEnum),

  dueDate: z.iso.datetime({ message: 'Invalid date format' }).transform(toUTCDate),
});

const TaskUpdateSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters'),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),

  estimatedHours: z
    .number()
    .min(0.5, 'Estimated hours must be at least 0.5 hours')
    .max(21, 'Estimated hours must not exceed 21 hours'),

  tags: z
    .array(
      z
        .string()
        .min(2, 'Tag must be at least 2 characters')
        .max(20, 'Tag must not exceed 20 characters')
        .trim(),
    )
    .min(1, 'At least one tag is required')
    .max(10, 'Maximum 10 tags allowed'),

  status: z.enum(statusEnum),

  priority: z.enum(priorityEnum),

  dueDate: z.iso.datetime({ message: 'Invalid date format' }).transform(toUTCDate),
});

const SearchSchema = z
  .object({
    title: z
      .string()
      .min(2, 'Search term must be at least 2 characters')
      .max(50, 'Search term must not exceed 50 characters')
      .optional(),

    estimatedHoursMin: z.number().min(0, 'Minimum hours must be at least 0').optional(),

    estimatedHoursMax: z.number().max(21, 'Minimum hours must not exceed 21').optional(),

    tags: z
      .array(
        z
          .string()
          .min(2, 'Tag must be at least 2 characters')
          .max(20, 'Tag must not exceed 20 characters')
          .trim(),
      )
      .max(10, 'Maximum 10 tags allowed')
      .optional(),

    status: z.union([z.enum(statusEnum), z.array(z.enum(statusEnum))]).optional(),

    priority: z.union([z.enum(priorityEnum), z.array(z.enum(priorityEnum))]).optional(),

    dueDateMin: z.iso
      .datetime({ message: 'Invalid date format' })
      .optional()
      .transform((val) => (val ? toUTCDate(val) : undefined)),

    dueDateMax: z.iso
      .datetime({ message: 'Invalid date format' })
      .optional()
      .transform((val) => (val ? toUTCDate(val) : undefined)),
  })
  .refine(
    (data) => {
      if (data.dueDateMin && data.dueDateMax) {
        return data.dueDateMin <= data.dueDateMax;
      }
      return true;
    },
    {
      message: 'Minimum date cannot be greater than maximum date',
      path: ['dueDateMin', 'dueDateMax'],
    },
  );

module.exports = { TaskSchema, TaskUpdateSchema, SearchSchema };
