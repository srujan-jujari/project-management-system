const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
    const error = new Error('Authentication service is not configured');
    error.status = 500;
    throw error;
  }

  return process.env.JWT_SECRET;
};

const signAuthToken = (userId) =>
  jwt.sign({ userId }, getJwtSecret(), {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });

const verifyAuthToken = (token) =>
  jwt.verify(token, getJwtSecret(), {
    algorithms: ['HS256'],
  });

module.exports = { signAuthToken, verifyAuthToken };
