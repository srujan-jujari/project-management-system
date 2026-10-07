const revokedTokens = new Map();

const removeExpiredTokens = () => {
  const now = Math.floor(Date.now() / 1000);

  for (const [token, expiresAt] of revokedTokens) {
    if (expiresAt <= now) {
      revokedTokens.delete(token);
    }
  }
};

const isTokenRevoked = (token) => {
  return revokedTokens.has(token);
};

const revokeToken = (token, expiresAt) => {
  revokedTokens.set(token, expiresAt);
};

const cleanupInterval = setInterval(removeExpiredTokens, 60 * 60 * 1000);
cleanupInterval.unref();

module.exports = { isTokenRevoked, revokeToken };
