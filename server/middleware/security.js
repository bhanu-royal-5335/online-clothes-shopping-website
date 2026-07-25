// Security Hardening & Input Sanitization Middleware

// Custom NoSQL Injection Protection middleware (strips keys starting with $ or containing .)
const mongoSanitize = (req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    const cleanObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Strip keys containing MongoDB operators ($) or dot notation (.)
        if (key.startsWith('$') || key.includes('.')) {
          continue;
        }
        cleanObj[key] = sanitize(obj[key]);
      }
    }
    return cleanObj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};

// Security Headers Middleware
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

module.exports = { mongoSanitize, securityHeaders };
