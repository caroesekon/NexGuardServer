const { verifyToken } = require('../../utils/jwt');
const AppError = require('../../utils/AppError');
const User = require('../../models/client/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token, false);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new AppError('User not found.', 401));
    }

    if (user.status === 'suspended') {
      return next(new AppError('Account suspended. Contact support.', 403));
    }

    if (user.status === 'deactivated') {
      return next(new AppError('Account deactivated.', 403));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token.', 401));
  }
};

module.exports = { authenticate };