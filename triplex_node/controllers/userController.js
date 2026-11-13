import pool from '../db.js';

// Helper to check if string is a valid UUID
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function findUserByIdentifier(identifier) {
  if (UUID_REGEX.test(identifier)) {
    const res = await pool.query(
      'SELECT id, username, email, name, phone, avatar_url, created_at FROM users WHERE id = $1',
      [identifier]
    );
    if (res.rows.length > 0) return res.rows[0];
  }
  const res = await pool.query(
    'SELECT id, username, email, name, phone, avatar_url, created_at FROM users WHERE LOWER(username) = LOWER($1)',
    [identifier]
  );
  return res.rows[0] || null;
}

export async function getUserProfile(req, res) {
  const { userId } = req.params;
  const currentUserId = req.user?.id || null;

  try {
    const user = await findUserByIdentifier(userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'user/not_found'
      });
    }

    const targetUserId = user.id;

    const followersCountRes = await pool.query('SELECT COUNT(*) FROM follows WHERE following_id = $1', [targetUserId]);
    const followingCountRes = await pool.query('SELECT COUNT(*) FROM follows WHERE follower_id = $1', [targetUserId]);
    const postsCountRes = await pool.query('SELECT COUNT(*) FROM posts WHERE user_id = $1 AND deleted_at IS NULL', [targetUserId]);

    let isFollowing = false;
    let isSelf = false;

    if (currentUserId) {
      isSelf = (currentUserId === targetUserId);
      if (!isSelf) {
        const followCheck = await pool.query(
          'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2',
          [currentUserId, targetUserId]
        );
        isFollowing = followCheck.rows.length > 0;
      }
    }

    const followersCount = parseInt(followersCountRes.rows[0].count, 10);
    const followingCount = parseInt(followingCountRes.rows[0].count, 10);
    const postsCount = parseInt(postsCountRes.rows[0].count, 10);

    res.status(200).json({
      status: 'success',
      user: {
        id: user.id,
        username: user.username,
        email: isSelf ? user.email : undefined,
        name: user.name,
        phone: isSelf ? user.phone : undefined,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        followersCount,
        followingCount,
        postsCount,
        is_following: isFollowing,
        is_self: isSelf
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'user/fetch_failed',
      error: error.message
    });
  }
}

export async function updateUserProfile(req, res) {
  const userId = req.user.id;
  const { name, phone } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, username, email, name, phone, avatar_url, updated_at`,
      [name, phone, userId]
    );

    res.status(200).json({
      status: 'success',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'user/update_failed',
      error: error.message
    });
  }
}

export async function followUser(req, res) {
  const { userId: targetIdentifier } = req.params;
  const followerId = req.user.id;

  try {
    const targetUser = await findUserByIdentifier(targetIdentifier);
    if (!targetUser) {
      return res.status(404).json({
        status: 'error',
        message: 'user/not_found'
      });
    }

    const followingId = targetUser.id;

    if (followerId === followingId) {
      return res.status(400).json({
        status: 'error',
        message: 'user/cannot_follow_self'
      });
    }

    await pool.query(
      `INSERT INTO follows (follower_id, following_id)
       VALUES ($1, $2)
       ON CONFLICT (follower_id, following_id) DO NOTHING`,
      [followerId, followingId]
    );

    const followersCountRes = await pool.query('SELECT COUNT(*) FROM follows WHERE following_id = $1', [followingId]);

    res.status(200).json({
      status: 'success',
      message: 'user/followed_successfully',
      is_following: true,
      followersCount: parseInt(followersCountRes.rows[0].count, 10)
    });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({
      status: 'error',
      message: 'user/follow_failed',
      error: error.message
    });
  }
}

export async function unfollowUser(req, res) {
  const { userId: targetIdentifier } = req.params;
  const followerId = req.user.id;

  try {
    const targetUser = await findUserByIdentifier(targetIdentifier);
    if (!targetUser) {
      return res.status(404).json({
        status: 'error',
        message: 'user/not_found'
      });
    }

    const followingId = targetUser.id;

    await pool.query(
      'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );

    const followersCountRes = await pool.query('SELECT COUNT(*) FROM follows WHERE following_id = $1', [followingId]);

    res.status(200).json({
      status: 'success',
      message: 'user/unfollowed_successfully',
      is_following: false,
      followersCount: parseInt(followersCountRes.rows[0].count, 10)
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({
      status: 'error',
      message: 'user/unfollow_failed',
      error: error.message
    });
  }
}

export async function getFollowers(req, res) {
  const { userId: targetIdentifier } = req.params;
  const currentUserId = req.user?.id || null;

  try {
    const targetUser = await findUserByIdentifier(targetIdentifier);
    if (!targetUser) {
      return res.status(404).json({
        status: 'error',
        message: 'user/not_found'
      });
    }

    const targetUserId = targetUser.id;

    const result = await pool.query(
      `SELECT u.id, u.username, u.name, u.avatar_url, f.created_at,
              CASE WHEN curr_f.follower_id IS NOT NULL THEN true ELSE false END as is_following,
              CASE WHEN u.id = $2 THEN true ELSE false END as is_self
       FROM follows f
       JOIN users u ON f.follower_id = u.id
       LEFT JOIN follows curr_f ON curr_f.follower_id = $2 AND curr_f.following_id = u.id
       WHERE f.following_id = $1
       ORDER BY f.created_at DESC`,
      [targetUserId, currentUserId]
    );

    res.status(200).json({
      status: 'success',
      followers: result.rows
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({
      status: 'error',
      message: 'user/followers_fetch_failed',
      error: error.message
    });
  }
}

export async function getFollowing(req, res) {
  const { userId: targetIdentifier } = req.params;
  const currentUserId = req.user?.id || null;

  try {
    const targetUser = await findUserByIdentifier(targetIdentifier);
    if (!targetUser) {
      return res.status(404).json({
        status: 'error',
        message: 'user/not_found'
      });
    }

    const targetUserId = targetUser.id;

    const result = await pool.query(
      `SELECT u.id, u.username, u.name, u.avatar_url, f.created_at,
              CASE WHEN curr_f.follower_id IS NOT NULL THEN true ELSE false END as is_following,
              CASE WHEN u.id = $2 THEN true ELSE false END as is_self
       FROM follows f
       JOIN users u ON f.following_id = u.id
       LEFT JOIN follows curr_f ON curr_f.follower_id = $2 AND curr_f.following_id = u.id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC`,
      [targetUserId, currentUserId]
    );

    res.status(200).json({
      status: 'success',
      following: result.rows
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({
      status: 'error',
      message: 'user/following_fetch_failed',
      error: error.message
    });
  }
}
