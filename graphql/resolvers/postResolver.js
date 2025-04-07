const postService = require('../services/postService');

const prisma = require('../../prismaClient');

const postResolvers = {
  Query: {
    post: postService.getPost,
    posts: postService.getPosts,
  },
  Mutation: {
    createPost: postService.createPost,
    updatePost: postService.updatePost,
    deletePost: postService.deletePost,
  },
  Post: {
    author: async (parent, _, context) => await context.userLoader.load(parent.authorId),
  },
}

module.exports = postResolvers;