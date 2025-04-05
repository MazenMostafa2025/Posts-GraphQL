const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Secret key for JWT signing and verification
const JWT_SECRET = 'dhau246@&$6@#&(1eh2wh'; // Change this to a more secure secret in production

// Generate a JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '4h',
  });
};

// Hash password before saving to the database
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

// Verify password (for login)
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { generateToken, hashPassword, comparePassword, verifyToken };
