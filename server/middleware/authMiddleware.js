const jwt = require('jsonwebtoken');

/**
 * Verify JWT token from Authorization header.
 * Attaches decoded user payload to req.user: { id, role }
 */
const verifyToken = (req, res, next) => {
  // Bypass auth for health check endpoint
  if (req.path === '/api/health') {
    return next();
  }
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }
};

/**
 * Check if the authenticated user has admin role.
 * Must be used AFTER verifyToken middleware.
 */
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
