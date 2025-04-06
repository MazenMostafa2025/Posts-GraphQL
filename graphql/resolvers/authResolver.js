// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const { findUserByEmail } = require('../models/user');
// const { JWT_SECRET } = require('../config/env');

// const authResolver = {
//   Query: {
//     me: (_, __, { user }) => {
//       if (!user) throw new Error('Not authenticated');
//       return user;
//     },
//   },
//   Mutation: {
//     login: async (_, { email, password }) => {
//       const user = await findUserByEmail(email);
      
//       const isValidPassword = await bcrypt.compare(password, user.password);
//       if (!user || !isValidPassword) {
//         throw new Error('Invalid credentials');
//       }

//       const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
//         expiresIn: '1h', // Token expires in 1 hour
//       });

//       return {
//         token,
//         user: { id: user.id, email: user.email },
//       };
//     },
//   },
// };

// module.exports = authResolver;