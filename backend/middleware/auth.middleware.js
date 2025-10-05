const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.user.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          error: { code: 'NOT_AUTHORIZED', message: 'User not found' },
        });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({
        error: {
          code: 'NOT_AUTHORIZED',
          message: 'Not authorized, token failed',
        },
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      error: { code: 'NO_TOKEN', message: 'Not authorized, no token' },
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `User role '${req.user.role}' is not authorized to access this route`,
        },
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
