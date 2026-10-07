const bcrypt = require('bcrypt');
const prisma = require('../utils/prisma');
const { signAuthToken } = require('../utils/jwt');

const publicUserSelect = {
  id: true,
  fullName: true,
  email: true,
  createdAt: true,
};

const register = async (request, response) => {
  const { fullName, email, password } = request.body;
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    const error = new Error('An account with this email already exists');
    error.status = 409;
    throw error;
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { fullName, email, passwordHash },
      select: publicUserSelect,
    });

    return response.status(201).json({
      success: true,
      message: 'Registration successful',
      user,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      error.status = 409;
      error.message = 'An account with this email already exists';
    }
    throw error;
  }
};

const login = async (request, response) => {
  const { email, password } = request.body;
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      ...publicUserSelect,
      passwordHash: true,
    },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const token = signAuthToken(user.id);

  return response.status(200).json({
    success: true,
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    },
  });
};

const logout = (_request, response) =>
  response.status(200).json({
    success: true,
    message: 'Logout successful. Remove the stored token from the client.',
  });

const me = async (request, response) => {
  const user = await prisma.user.findUnique({
    where: { id: request.user.id },
    select: publicUserSelect,
  });

  if (!user) {
    const error = new Error('Authenticated user not found');
    error.status = 404;
    throw error;
  }

  return response.status(200).json({ success: true, user });
};

module.exports = { register, login, logout, me };
