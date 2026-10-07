const express = require('express');
const projectController = require('../controllers/project.controller');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createProjectSchema,
  projectIdSchema,
  updateProjectSchema,
} = require('../validators/project.validator');

const router = express.Router();

const validateProjectId = (request, _response, next) => {
  const result = projectIdSchema.safeParse(request.params.id);

  if (!result.success) {
    const error = new Error('Validation failed');
    error.status = 400;
    error.details = result.error.flatten().fieldErrors;
    return next(error);
  }

  request.projectId = result.data;
  return next();
};

router.use(authenticate);
router.post('/', validate(createProjectSchema), projectController.create);
router.get('/', projectController.list);
router.get('/:id', validateProjectId, projectController.getById);
router.put('/:id', validateProjectId, validate(updateProjectSchema), projectController.update);
router.delete('/:id', validateProjectId, projectController.remove);

module.exports = router;
