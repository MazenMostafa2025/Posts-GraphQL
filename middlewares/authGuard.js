const requireAuth = (context) => {
  if (!context.user) {
    throw new Error('Authentication required');
  }
  return context.user;
};

module.exports = requireAuth;
