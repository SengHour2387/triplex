import pool from '../../db.js';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '../../core/tokenGenerator.js';

export async function register(req, res) {
  const { username, email, password } = req.body;
    try {

      const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already in use'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, email, password,token_version) VALUES ($1, $2, $3,$4) RETURNING id, username, email',
      [username, email, hashedPassword, 0]
    );

    const newUser = result.rows[0];

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to register user',
      error: error.message
    });
  }
}