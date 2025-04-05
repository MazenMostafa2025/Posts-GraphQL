const { verifyToken } = require('../auth');

// Middleware for checking authentication
const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header must start with Bearer' });
    }
    const decoded = verifyToken(authHeader.split(' ')[1]);
    req.user = decoded;  // Attach user data to the request
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Check if the user is the owner of a resource or has an admin role
const isOwnerOrAdmin = (userId, resourceOwnerId, userRole) => {
  if (userRole === 'ADMIN' || userRole === 'MODERATOR') return true;  // Admins can access anything
  if (userId === resourceOwnerId) return true;  // Check if the user is the owner
  return false;
};

module.exports = { requireAuth, isOwnerOrAdmin };
