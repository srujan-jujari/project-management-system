const jwt = require('jsonwebtoken');

const MAX_TOKEN_LIFETIME_SECONDS = 24 * 60 * 60;

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
    const error = new Error('Authentication service is not configured');
    error.status = 500;
    throw error;
  }

  if (Buffer.byteLength(process.env.JWT_SECRET, 'utf8') < 32) {
    const error = new Error('Authentication service is not configured');
    error.status = 500;
    throw error;
  }

  return process.env.JWT_SECRET;
};

const getTokenLifetime = () => {
  const configuredLifetime = process.env.JWT_EXPIRES_IN || '1h';
  const match = configuredLifetime.match(/^(\d+)(s|m|h|d)$/i);

  if (!match) {
    const error = new Error('Authentication service is not configured');
    error.status = 500;
    throw error;
  }

  const value = Number(match[1]);
  const unitsInSeconds = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };
  const lifetimeSeconds = value * unitsInSeconds[match[2].toLowerCase()];

  if (!Number.isSafeInteger(lifetimeSeconds) || lifetimeSeconds < 1 || lifetimeSeconds > MAX_TOKEN_LIFETIME_SECONDS) {
    const error = new Error('Authentication service is not configured');
    error.status = 500;
    throw error;
  }

  return configuredLifetime;
};

const signAuthToken = (userId) =>
  jwt.sign({ userId }, getJwtSecret(), {
    algorithm: 'HS256',
    expiresIn: getTokenLifetime(),
  });

const verifyAuthToken = (token) =>
  jwt.verify(token, getJwtSecret(), {
    algorithms: ['HS256'],
  });

module.exports = { signAuthToken, verifyAuthToken };
