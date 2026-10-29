const jwt = require('jsonwebtoken');
exports.logger = (req, res, next) => { const t = Date.now(); res.on('finish', () => console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - t}ms`)); next(); };
exports.auth = (req, res, next) => {
  try { req.user = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ message: 'Please log in again' }); }
};
exports.adminOnly = (req, res, next) => req.user.role === 'admin' ? next() : res.status(403).json({ message: 'Admin access only' });
exports.wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.errorHandler = (err, req, res, next) => {
  console.error(err.message);
  const code = ['ValidationError', 'CastError'].includes(err.name) ? 400 : err.code === 11000 ? 409 : 500;
  res.status(code).json({ message: err.code === 11000 ? 'Already exists' : err.message });
};
