const prisma = require('../../prismaClient');
const { generateToken, hashPassword, comparePassword } = require('../../auth');

const userResolvers = {
  Query: {
    users: async () => prisma.user.findMany(),
    user: async (_, { id }) => prisma.user.findUnique({ where: { id } }),
  },
  Mutation: {
    signup: async (_, { input }) => {
      const { name, email, password } = input;
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
  },
  User: {
    posts: (parent, _, context) => {
      return context.postLoader.load(parent.id);
    }
  }
};

module.exports = userResolvers;
