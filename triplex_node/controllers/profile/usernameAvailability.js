import pool from '../../db.js';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

export const checkUsernameAvailability = async (req, res) => {
  const { username } = req.body;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ status: 'error', message: 'Username is required' });
  }

  const trimmedUsername = username.trim();

  if (!USERNAME_REGEX.test(trimmedUsername)) {
    return res.status(200).json({
      status: 'success',
      available: false,
      message: 'Username must be 3-30 alphanumeric characters or underscores'
    });
  }

  try {
    const result = await pool.query('SELECT id FROM users WHERE username = $1', [trimmedUsername]);
    const isAvailable = result.rows.length === 0;

    res.status(200).json({
      status: 'success',
      available: isAvailable,
      message: isAvailable ? 'Username is available' : 'Username is already taken'
    });
  } catch (error) {
    console.error('Error checking username availability:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};