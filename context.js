const { verifyToken } = require('./auth');
const postLoader = require('./loaders/postLoader');
const userLoader = require('./loaders/userLoader');

const buildContext = async ({ req }) => {
  const authHeader = req.headers.authorization || '';
  let user = null;

  // Only try to verify if header is Bearer format
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      user = verifyToken(token);
    } catch (err) {
      console.warn('Invalid token:', err.message);
      user = null;
    }
  }

  // If not Bearer, just skip auth (user stays null)
  return { user, userLoader: userLoader(), postLoader: postLoader() };
};

module.exports = buildContext;
