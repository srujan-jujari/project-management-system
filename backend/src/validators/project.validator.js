const { z } = require('zod');

const projectDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Date must be a valid calendar date')
  .transform((value) => new Date(`${value}T00:00:00.000Z`));

const projectFields = {
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).nullable(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
  startDate: projectDateSchema.nullable(),
  endDate: projectDateSchema.nullable(),
};

const createProjectSchema = z
  .object({
    ...projectFields,
    description: projectFields.description.optional(),
    status: projectFields.status.default('NOT_STARTED'),
    startDate: projectFields.startDate.optional(),
    endDate: projectFields.endDate.optional(),
  })
  .strict();

const updateProjectSchema = z
  .object(projectFields)
  .partial()
  .strict()
  .refine((project) => Object.keys(project).length > 0, {
    message: 'At least one project field must be provided',
  });

const projectIdSchema = z
  .string()
  .regex(/^[1-9]\d*$/, 'Project ID must be a positive integer')
  .transform(Number)
  .refine(Number.isSafeInteger, 'Project ID must be a safe integer');

const projectListQuerySchema = z
  .object({
    search: z.string().trim().min(1).max(200).optional(),
    status: projectFields.status.optional(),
  })
  .strict();

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
  projectListQuerySchema,
};
