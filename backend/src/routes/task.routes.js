const express = require('express');
const taskController = require('../controllers/task.controller');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createTaskSchema,
  taskIdSchema,
  updateTaskSchema,
} = require('../validators/task.validator');

const router = express.Router();

const validateId = (parameterName, requestProperty) => (request, _response, next) => {
  const result = taskIdSchema.safeParse(request.params[parameterName]);

  if (!result.success) {
    const error = new Error('Validation failed');
    error.status = 400;
    error.details = { [parameterName]: result.error.issues.map((issue) => issue.message) };
    return next(error);
  }

  request[requestProperty] = result.data;
  return next();
};

router.post(
  '/projects/:projectId/tasks',
  authenticate,
  validateId('projectId', 'projectId'),
  validate(createTaskSchema),
  taskController.create,
);
router.get(
  '/projects/:projectId/tasks',
  authenticate,
  validateId('projectId', 'projectId'),
  taskController.listByProject,
);
router.get('/tasks/:id', authenticate, validateId('id', 'taskId'), taskController.getById);
router.put(
  '/tasks/:id',
  authenticate,
  validateId('id', 'taskId'),
  validate(updateTaskSchema),
  taskController.update,
);
router.delete('/tasks/:id', authenticate, validateId('id', 'taskId'), taskController.remove);

module.exports = router;
