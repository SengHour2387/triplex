import jwt from 'jsonwebtoken';

const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id,
      version: user.tokenVersion   // Include version
    },
    process.env.ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id,
      version: user.tokenVersion 
    },
    process.env.REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};
export { generateAccessToken, generateRefreshToken };