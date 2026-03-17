function adminMiddleware(req, res, next) {
  const role = req.userRole;
  if (!role) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  const allowedRoles = (process.env.ADMIN_ROLES || 'admin')
    .split(',')
    .map(r => r.trim().toLowerCase());

  if (!allowedRoles.includes(String(role).toLowerCase())) {
    console.warn(`[admin] Access denied for role=${role}`);
    return res.status(403).json({ error: 'Access denied' });
  }

  next();
}

module.exports = adminMiddleware;