const createLoader = require('./createLoader');
const prisma = require('../prismaClient');

const batchPosts = async (authorIds) => {
  const posts = await prisma.post.findMany({
    where: { authorId: { in: authorIds }, isDeleted: false },
  });
  // Create a map where each authorId points to an array of posts for that author
  const postsByAuthor = posts.reduce((acc, post) => {
    // Initialize the array for a new authorId if not yet present
    if (!acc[post.authorId]) {
      acc[post.authorId] = [];
    }
    acc[post.authorId].push(post);
    return acc;
  }, {});

  // Return the posts for each authorId in the order they were requested
  return authorIds.map((id) => postsByAuthor[id] || []);
};
const postLoader = createLoader(batchPosts);
module.exports = postLoader;
