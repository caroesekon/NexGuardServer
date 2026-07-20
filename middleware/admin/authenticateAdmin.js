const { verifyToken } = require('../../utils/jwt');
const AppError = require('../../utils/AppError');
const Admin = require('../../models/admin/Admin');

const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token, true);

    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return next(new AppError('Admin not found.', 401));
    }

    req.admin = admin;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired admin token.', 401));
  }
};

module.exports = { authenticateAdmin };