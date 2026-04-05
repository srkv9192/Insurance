// Auth middleware - replaces repeated session checks across routes
const requireAuth = (roles = []) => (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (roles.length && !roles.includes(req.session.userType)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// Page-level auth guard (sends HTML error for browser requests)
const requirePageAuth = (roles = []) => (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login.html');
  }
  if (roles.length && !roles.includes(req.session.userType)) {
    return res.status(403).send('You do not have permission to view this page. Do not attempt it again or the account will be locked.');
  }
  next();
};

module.exports = { requireAuth, requirePageAuth };
