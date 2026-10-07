const prisma = require('../utils/prisma');

const findOwnedProject = (projectId, userId) =>
  prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });

const findOwnedTask = (taskId, userId) =>
  prisma.task.findFirst({
    where: {
      id: taskId,
      project: { is: { userId } },
    },
  });

const notFoundError = () => {
  const error = new Error('Task or project not found');
  error.status = 404;
  return error;
};

const create = async (request, response) => {
  const project = await findOwnedProject(request.projectId, request.user.userId);

  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    throw error;
  }

  const task = await prisma.task.create({
    data: {
      ...request.body,
      projectId: project.id,
    },
  });

  return response.status(201).json({ success: true, task });
};

const listByProject = async (request, response) => {
  const project = await findOwnedProject(request.projectId, request.user.userId);

  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    throw error;
  }

  const tasks = await prisma.task.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: 'desc' },
  });

  return response.status(200).json({ success: true, tasks });
};

const getById = async (request, response) => {
  const task = await findOwnedTask(request.taskId, request.user.userId);

  if (!task) {
    throw notFoundError();
  }

  return response.status(200).json({ success: true, task });
};

const update = async (request, response) => {
  const ownedTask = await prisma.task.findFirst({
    where: {
      id: request.taskId,
      project: { is: { userId: request.user.userId } },
    },
    select: { id: true, projectId: true },
  });

  if (!ownedTask) {
    throw notFoundError();
  }

  try {
    const task = await prisma.task.update({
      where: {
        id: ownedTask.id,
        projectId: ownedTask.projectId,
      },
      data: request.body,
    });

    return response.status(200).json({ success: true, task });
  } catch (error) {
    if (error.code === 'P2025') {
      throw notFoundError();
    }
    throw error;
  }
};

const remove = async (request, response) => {
  const ownedTask = await prisma.task.findFirst({
    where: {
      id: request.taskId,
      project: { is: { userId: request.user.userId } },
    },
    select: { id: true, projectId: true },
  });

  if (!ownedTask) {
    throw notFoundError();
  }

  const result = await prisma.task.deleteMany({
    where: {
      id: ownedTask.id,
      projectId: ownedTask.projectId,
    },
  });

  if (result.count === 0) {
    throw notFoundError();
  }

  return response.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  });
};

module.exports = { create, listByProject, getById, update, remove };
