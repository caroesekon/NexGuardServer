const jwt = require('jsonwebtoken');

const signAccessToken = (payload, isAdmin = false) => {
  const secret = isAdmin
    ? process.env.ADMIN_JWT_ACCESS_SECRET
    : process.env.JWT_ACCESS_SECRET;

  const expiry = isAdmin
    ? process.env.ADMIN_JWT_ACCESS_EXPIRY || '15m'
    : process.env.JWT_ACCESS_EXPIRY || '15m';

  return jwt.sign(payload, secret, { expiresIn: expiry });
};

const signRefreshToken = (payload, isAdmin = false) => {
  const secret = isAdmin
    ? process.env.ADMIN_JWT_REFRESH_SECRET
    : process.env.JWT_REFRESH_SECRET;

  const expiry = isAdmin
    ? process.env.ADMIN_JWT_REFRESH_EXPIRY || '7d'
    : process.env.JWT_REFRESH_EXPIRY || '7d';

  return jwt.sign(payload, secret, { expiresIn: expiry });
};

const verifyToken = (token, isAdmin = false) => {
  const secret = isAdmin
    ? process.env.ADMIN_JWT_ACCESS_SECRET
    : process.env.JWT_ACCESS_SECRET;

  return jwt.verify(token, secret);
};

const verifyRefreshToken = (token, isAdmin = false) => {
  const secret = isAdmin
    ? process.env.ADMIN_JWT_REFRESH_SECRET
    : process.env.JWT_REFRESH_SECRET;

  return jwt.verify(token, secret);
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  verifyRefreshToken,
};