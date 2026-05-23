import { verifyAccessToken } from '../core/tokenGenerator.js';

export async function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'auth/missing_token'
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    // The payload contains userId and version
    req.user = {
      id: decoded.userId,
      version: decoded.version
    };
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      status: 'error',
      message: 'auth/invalid_token'
    });
  }
}