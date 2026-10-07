const prisma = require('../utils/prisma');

const create = async (request, response) => {
  const project = await prisma.project.create({
    data: {
      ...request.body,
      userId: request.user.userId,
    },
  });

  return response.status(201).json({ success: true, project });
};

const list = async (request, response) => {
  const projects = await prisma.project.findMany({
    where: { userId: request.user.userId },
    orderBy: { createdAt: 'desc' },
  });

  return response.status(200).json({ success: true, projects });
};

const getById = async (request, response) => {
  const project = await prisma.project.findFirst({
    where: {
      id: request.projectId,
      userId: request.user.userId,
    },
  });

  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    throw error;
  }

  return response.status(200).json({ success: true, project });
};

const update = async (request, response) => {
  try {
    const project = await prisma.project.update({
      where: {
        id: request.projectId,
        userId: request.user.userId,
      },
      data: request.body,
    });

    return response.status(200).json({ success: true, project });
  } catch (error) {
    if (error.code === 'P2025') {
      const notFoundError = new Error('Project not found');
      notFoundError.status = 404;
      throw notFoundError;
    }
    throw error;
  }
};

const remove = async (request, response) => {
  const result = await prisma.project.deleteMany({
    where: {
      id: request.projectId,
      userId: request.user.userId,
    },
  });

  if (result.count === 0) {
    const error = new Error('Project not found');
    error.status = 404;
    throw error;
  }

  return response.status(200).json({
    success: true,
    message: 'Project deleted successfully',
  });
};

module.exports = { create, list, getById, update, remove };
