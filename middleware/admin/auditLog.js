const AuditLog = require('../../models/admin/AuditLog');

const logAction = (action) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (body) {
      res.send = originalSend;

      AuditLog.create({
        adminId: req.admin?._id,
        action,
        target: req.params.id || req.body?.email || 'unknown',
        details: {
          method: req.method,
          url: req.originalUrl,
          body: req.body,
        },
        ip: req.ip,
      }).catch((err) => console.error('Audit log error:', err));

      return res.send(body);
    };

    next();
  };
};

module.exports = { logAction };