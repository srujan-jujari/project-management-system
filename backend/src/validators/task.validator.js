const { z } = require('zod');

const calendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Date must be a valid calendar date');

const dueDateSchema = z
  .union([
    calendarDateSchema,
    z.iso.datetime({ offset: true }),
  ])
  .transform((value) => new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value));

const taskFields = {
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  dueDate: dueDateSchema.nullable(),
};

const createTaskSchema = z
  .object({
    ...taskFields,
    description: taskFields.description.optional(),
    priority: taskFields.priority.default('MEDIUM'),
    status: taskFields.status.default('PENDING'),
    dueDate: taskFields.dueDate.optional(),
  })
  .strict();

const updateTaskSchema = z
  .object(taskFields)
  .partial()
  .strict()
  .refine((task) => Object.keys(task).length > 0, {
    message: 'At least one task field must be provided',
  });

const taskIdSchema = z
  .string()
  .regex(/^[1-9]\d*$/, 'ID must be a positive integer')
  .transform(Number)
  .refine(Number.isSafeInteger, 'ID must be a safe integer');

const createFlatTaskSchema = createTaskSchema.extend({
  projectId: z.number().int().positive().safe(),
});

const taskListQuerySchema = z
  .object({
    search: z.string().trim().min(1).max(200).optional(),
    status: taskFields.status.optional(),
    priority: taskFields.priority.optional(),
  })
  .strict();

module.exports = {
  createTaskSchema,
  createFlatTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  taskListQuerySchema,
};
