import pool from '../../db.js';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '../../core/tokenGenerator.js';

export async function register(req, res) {
  const { username, email, password } = req.body;

  if(!username || !email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'auth/register_missing_fields'
    });
  }

  if(username === "" || email === "" || password === "") {
    return res.status(400).json({
      status: 'error',
      message: 'auth/register_empty_fields'
    });
  }

  const client = await pool.connect();   // ← Get connection

  try {
    await client.query('BEGIN');   // Start transaction

    // 1. Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: 'error',
        message: 'auth/register_email_username_exists'
      });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);   // 12 is better

    // 3. Insert user
    const result = await client.query(`
      INSERT INTO users (username, email, password, token_version)
      VALUES ($1, $2, $3, $4) 
      RETURNING id, username, email, avatar_url
    `, [username, email, hashedPassword, 0]);

    const newUser = result.rows[0];

    // 4. Generate tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // 5. If everything is ok → Commit
    await client.query('COMMIT');

    res.status(201).json({
      status: 'success',
      message: 'auth/register_success',
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        avatar_url: newUser.avatar_url
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');   // ← This is the most important part
    console.error('Error registering user:', error);

    res.status(500).json({
      status: 'error',
      message: 'auth/register_failed',
      error: error.message
    });
  } finally {
    client.release();
  }
}