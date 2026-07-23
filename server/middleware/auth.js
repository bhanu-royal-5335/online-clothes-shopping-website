const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = req.cookies.accessToken;

  // Fallback to Bearer token header if cookie is missing
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'default_access_secret_123');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'User is blocked. Please contact support.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`Token verification failed: ${error.message}`);
    // If access token is expired, the client should hit the /api/auth/refresh endpoint
    return res.status(401).json({ message: 'Not authorized, token expired or invalid', code: 'TOKEN_EXPIRED' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin role required' });
  }
};

module.exports = { protect, admin };
