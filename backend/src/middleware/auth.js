const { verifyAuthToken } = require('../utils/jwt');
const { isTokenRevoked } = require('../utils/token-revocation');

const authenticate = (request, _response, next) => {
  const authorization = request.get('Authorization');
  const match = authorization && authorization.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    const error = new Error('Authentication required');
    error.status = 401;
    return next(error);
  }

  try {
    const payload = verifyAuthToken(match[1]);

    if (
      !Number.isSafeInteger(payload.userId) ||
      payload.userId < 1 ||
      !Number.isSafeInteger(payload.exp) ||
      payload.exp <= Math.floor(Date.now() / 1000) ||
      isTokenRevoked(match[1])
    ) {
      const error = new Error('Invalid or expired token');
      error.status = 401;
      return next(error);
    }

    request.user = { id: payload.userId, userId: payload.userId };
    request.auth = { token: match[1], expiresAt: payload.exp };
    return next();
  } catch (error) {
    if (error.status) {
      return next(error);
    }

    const authenticationError = new Error('Invalid or expired token');
    authenticationError.status = 401;
    return next(authenticationError);
  }
};

module.exports = authenticate;
