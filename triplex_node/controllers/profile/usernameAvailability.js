import pool from '../../db.js';

export const checkUsernameAvailability = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ status: 'error', message: 'Username is required' });
  }

  try {
    const result = await db.query('SELECT id FROM users WHERE username = $1', [username]);
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