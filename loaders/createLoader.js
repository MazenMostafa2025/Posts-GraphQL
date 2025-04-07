
const DataLoader = require('dataloader');

/**
 * Generic DataLoader factory
 * @param {Function} batchFunction - A function that returns records by a list of keys
 * @returns {DataLoader}
 */

module.exports = (batchFunction) => {
  return new DataLoader(async (keys) => {
    const results = await batchFunction(keys);

    const map = new Map(results.map((item) => [item.id, item]));

    // Ensure the result order matches the keys order
    return keys.map((key) => map.get(key) || null);
  });
};

// if expecting high concurrency or spike of nested requests
// this will delay the batch allowing other .load() calls in same tick to join the batch.
// new DataLoader(batchFn, {
//   batchScheduleFn: callback => setTimeout(callback, 0) // microtask batching
// });
