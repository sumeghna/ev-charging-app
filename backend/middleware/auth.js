const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ==================== PROTECT MIDDLEWARE ====================

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'User not found' 
        });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, token failed' 
      });
    }
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, no token' 
    });
  }
};

// ==================== AUTHORIZE MIDDLEWARE (Role-Based Access) ====================

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized to access this route`,
        requiredRoles: roles,
        userRole: req.user.role
      });
    }
    next();
  };
};

// ==================== CHECK OWNERSHIP (For Station Operations) ====================

const checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params.id);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }
      
      // Check if user is admin or owner
      if (
        req.user.role === 'admin' || 
        resource.owner.toString() === req.user._id.toString()
      ) {
        req.resource = resource;
        return next();
      }
      
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
};

module.exports = { protect, authorize, checkOwnership };