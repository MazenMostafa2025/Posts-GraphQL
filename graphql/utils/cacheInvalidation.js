module.exports = (mutationFn, { loaders, keysToClear = [], keysToPrime = [] }) => async (...args) => {
  const result = await mutationFn(...args);

  // Clear specified keys
  keysToClear.forEach(({ loader, key }) => {
    loaders[loader]?.clear(key);
  });

  // Optionally prime updated values
  keysToPrime.forEach(({ loader, key, value }) => {
    loaders[loader]?.prime(key, value);
  });

  return result;
};


/*
cacheInvalidation(updatePost, { loaders: {
userLoader: context.userLoader,
postLoader: context.postLoader }, keysToClear: [{ loader: 'postLoader', key: args.id }] });

*/