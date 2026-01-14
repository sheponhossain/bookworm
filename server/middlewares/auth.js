// server/middleware/auth.js

const adminOnly = (req, res, next) => {
  const userRole = req.headers['user-role'];

  if (userRole === 'admin') {
    next();
  } else {
    res.status(403).json({
      message:
        'Access Denied: You do not have permission to perform this action!',
    });
  }
};
module.exports = { adminOnly };
