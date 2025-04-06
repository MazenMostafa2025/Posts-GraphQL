const createLoader = require('./createLoader');
const prisma = require('../prismaClient');

const batchUsers = async (userIds) => {
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
  });
  const userMap = new Map(users.map((user) => [user.id, user]));
  return userIds.map((userId) => userMap.get(userId) || null);
};

const userLoader = createLoader(batchUsers);
module.exports = userLoader;
