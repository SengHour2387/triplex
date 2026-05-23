import pool from '../../db.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../core/tokenGenerator.js';

export async function refreshToken(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      status: 'error',
      message: 'auth/missing_refresh_token'
    });
  }

  try {
    // 1. Verify the refresh token signature and expiry
    const decoded = verifyRefreshToken(refreshToken);

    // 2. Fetch the latest user data from the database
    const result = await pool.query(
      'SELECT id, username, email, token_version, avatar_url FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'auth/user_not_found'
      });
    }

    const user = result.rows[0];

    // 3. Check token version — rejects tokens invalidated by logout/password change
    if (decoded.version !== user.token_version) {
      return res.status(403).json({
        status: 'error',
        message: 'auth/token_revoked'
      });
    }

    // 4. Issue fresh tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.status(200).json({
      status: 'success',
      message: 'auth/token_refreshed',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(403).json({
      status: 'error',
      message: 'auth/invalid_refresh_token'
    });
  }
}
