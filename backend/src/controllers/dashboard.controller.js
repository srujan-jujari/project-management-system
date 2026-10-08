const prisma = require('../utils/prisma');

const getStats = async (request, response) => {
  const userId = request.user.userId;
  const taskOwnership = { project: { is: { userId } } };

  const [totalProjects, projectsInProgress, totalTasks, completedTasks, pendingTasks] =
    await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.project.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: taskOwnership }),
      prisma.task.count({ where: { ...taskOwnership, status: 'COMPLETED' } }),
      prisma.task.count({ where: { ...taskOwnership, status: 'PENDING' } }),
    ]);

  return response.status(200).json({
    success: true,
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    projectsInProgress,
  });
};

module.exports = { getStats };
