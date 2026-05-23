import pool from '../../db.js';

export async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    console.log('Fetching profile for user ID:', userId);

    const result = await pool.query(
      'SELECT id, username, email, avatar_url FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'profile/user_not_found'
      });
    }

    const user = result.rows[0];

    res.status(200).json({
      status: 'success',
      message: 'profile/fetch_success',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'profile/fetch_failed',
      error: error.message
    });
  }
}
