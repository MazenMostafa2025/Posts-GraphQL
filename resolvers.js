const { PrismaClient } = require('@prisma/client');
const { generateToken, hashPassword, comparePassword } = require('./auth');
const requireAuth = require('./middlewares/authGuard');
const prisma = new PrismaClient({log: ['query', 'info', 'warn', 'error']});
const requireRoles = require('./middlewares/roleMiddleware');
const { isOwnerOrAdmin } = require('./utils/permissions');

const resolvers = {
  Query: {
    users: async () => await prisma.user.findMany(),
    user: async (_, args) => await prisma.user.findUnique({where: { id: args.id }}),
    posts: async (_, {page=1, limit=10, title, content, authorId}) => {
      const skip = (page-1)*limit;
      const whereConditions = {
        isDeleted: false,
        ...(title && { title : { contains: title, mode: 'insensitive'}}),
        ...(content && { content : { contains: content, mode: 'insensitive'}}),
        ...(authorId && { authorId }),
      }
      const posts = await prisma.post.findMany({ where: whereConditions, skip, take: limit, orderBy: { createdAt: 'desc' }});
      const totalPosts = await prisma.post.count({where: whereConditions});
      const totalPages = Math.ceil(totalPosts / limit);
      return { posts, totalPosts, totalPages };
    },  // This is the paginated posts query with cursor
    // posts: async (_, { page = 1, limit = 10, title, cursor }, context) => {
    //   const where = {
    //     isDeleted: false, // If you have soft delete logic
    //     ...(title && {
    //       title: {
    //         contains: title,
    //       },
    //     }),
    //   };

    //   // Get the posts with cursor-based pagination
    //   const posts = await prisma.post.findMany({
    //     take: limit,
    //     skip: 0, // Skip is used only for the first page if we were to use offset
    //     where,
    //     cursor: cursor ? { id: cursor } : undefined, // Use cursor if provided
    //     orderBy: {
    //       id: 'asc', // Ensure we order by id for pagination
    //     },
    //   });

    //   // Fetch the total number of posts (to calculate totalPages)
    //   const totalPosts = await prisma.post.count({
    //     where,
    //   });

    //   const totalPages = Math.ceil(totalPosts / limit);
    //   const currentPage = cursor ? Math.floor(posts.length / limit) + 1 : 1;

    //   return {
    //     posts,
    //     totalPosts,
    //     totalPages,
    //     currentPage,
    //   };
    // },
    post: async (_, args) => await prisma.post.findUnique({ where: { id: args.id, isDeleted: false }}),
    },
  Mutation: {
    signup: async (_, { input }) => {
      const {name, email, password} = input;
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) throw new Error('User already exists');
      const hashedPassword = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
      const token = generateToken(user);
      return { user, token };
    },
    login: async (_, { input }) => {
      const { email, password } = input;
      const user = await prisma.user.findUnique({ where: { email } });
      const isValid = await comparePassword( password, user.password );
      if (!user || !isValid) throw new Error('wrong credentials');
      const token = generateToken(user);
      return { user, token };
    },
    createPost: async (_, { input }, context) => {
      const { title, content } = input;
      const user = requireAuth(context);
      console.log(user);
      return await prisma.post.create({
        data: {
          title,
          content,
          authorId: user.id,
        },
      });
    },
    updatePost: async (_, { input }, context) => {
      const user = requireAuth(context);
      const { id, title, content } = input;
      if (!id) throw new Error('Post ID is required');
      try {
        const post = await prisma.post.findUnique({ where: { id, isDeleted: false }});
        if (!post) throw new Error('Post not found');
        const isValid = isOwnerOrAdmin(user.id, post.authorId, user.role);
        if (!isValid) throw new Error('Not authorized to perform this action'); 
        return await prisma.post.update({
          where: { id },
          data: {
            title,
            content,
          },
        });
      } catch (err) {
        console.error(err.message);
      }
    },
    deletePost: async (_, args, context) => {
      const user = requireAuth(context);
      try {
        const post = await prisma.post.findUnique({ where: { id: args.id, isDeleted: false }});
        if (!post) throw new Error('Post not found');
        const isValid = isOwnerOrAdmin(user.id, post.authorId, user.role);
        if (!isValid) throw new Error('Not authorized to perform this action'); 
        return await prisma.post.update({ where: { id: args.id }, data : { isDeleted: true } });
      } catch (err) {
        console.error(err.message);
      }
      return 'Post deleted successfully';
    },
  },
};

module.exports = resolvers;
