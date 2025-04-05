const requireRole = (...roles) => {
  return (resolver) => {
    return (parent, args, context, info) => {
      if (!context.user || !roles.includes(context.user.role)) {
        throw new Error('Not authorized');
      }
      return resolver(parent, args, context, info);
    };
  };
};

module.exports = requireRole;
