import pool from '../../db.js';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '../../core/tokenGenerator.js';

export async function login(req, res) {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT id, username, email, password, token_version, avatar_url FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'auth/login_invalid_email_password'
      });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({
        status: 'error',
        message: 'auth/login_invalid_email_password'
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      status: 'success',
      message: 'auth/login_success',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to log in',
      error: error.message
    });
  }
}

export async function loginUsername(req, res) {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT id, username, email, password, token_version, avatar_url FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'auth/login_invalid_email_password'
      });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({
        status: 'error',
        message: 'auth/login_invalid_email_password'
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      status: 'success',
      message: 'auth/login_success',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({
      status: 'error',
      message: 'auth/login_failed',
      error: error.message
    });
  }
}
