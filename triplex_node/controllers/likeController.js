import pool from '../db.js';

// ─────────────────────────────────────────────
// POST REACTIONS
// ─────────────────────────────────────────────

export async function reactToPost(req, res) {
  const { postId } = req.params;
  const { type = 'like' } = req.body;
  const userId = req.user.id;

  const VALID_TYPES = ['like', 'love', 'haha', 'wow', 'sad', 'cry', 'angry'];
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({
      status: 'error',
      message: 'reaction/invalid_type',
      valid_types: VALID_TYPES
    });
  }

  try {
    const postCheck = await pool.query(
      'SELECT id FROM posts WHERE id = $1 AND deleted_at IS NULL',
      [postId]
    );
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'post/not_found' });
    }

    await pool.query(
      `INSERT INTO post_reactions (post_id, user_id, type)
       VALUES ($1, $2, $3)
       ON CONFLICT (post_id, user_id) 
       DO UPDATE SET type = EXCLUDED.type, created_at = NOW()`,
      [postId, userId, type]
    );

    const countResult = await pool.query(
      `SELECT type, COUNT(*) AS count FROM post_reactions WHERE post_id = $1 GROUP BY type`,
      [postId]
    );
    const myReactions = await pool.query(
      `SELECT type FROM post_reactions WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );
    const postResult = await pool.query(
      `SELECT likes_count FROM posts WHERE id = $1`,
      [postId]
    );

    const currentReaction = myReactions.rows[0]?.type || null;

    res.status(200).json({
      status: 'success',
      message: 'reaction/reacted_successfully',
      likes_count: postResult.rows[0]?.likes_count ?? 0,
      is_liked: true,
      my_reaction: currentReaction,
      reactions: countResult.rows,
      my_reactions: myReactions.rows.map(r => r.type)
    });
  } catch (error) {
    console.error('Error reacting to post:', error);
    res.status(500).json({ status: 'error', message: 'reaction/failed', error: error.message });
  }
}

export async function removePostReaction(req, res) {
  const { postId } = req.params;
  const { type } = req.body || {};
  const userId = req.user.id;

  try {
    if (type) {
      await pool.query(
        'DELETE FROM post_reactions WHERE post_id = $1 AND user_id = $2 AND type = $3',
        [postId, userId, type]
      );
    } else {
      await pool.query(
        'DELETE FROM post_reactions WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
      );
    }

    const countResult = await pool.query(
      `SELECT type, COUNT(*) AS count FROM post_reactions WHERE post_id = $1 GROUP BY type`,
      [postId]
    );
    const myReactions = await pool.query(
      `SELECT type FROM post_reactions WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );
    const postResult = await pool.query(
      `SELECT likes_count FROM posts WHERE id = $1`,
      [postId]
    );

    res.status(200).json({
      status: 'success',
      message: 'reaction/removed_successfully',
      likes_count: postResult.rows[0]?.likes_count ?? 0,
      is_liked: myReactions.rows.length > 0,
      my_reaction: myReactions.rows[0]?.type || null,
      reactions: countResult.rows,
      my_reactions: myReactions.rows.map(r => r.type)
    });
  } catch (error) {
    console.error('Error removing post reaction:', error);
    res.status(500).json({ status: 'error', message: 'reaction/failed', error: error.message });
  }
}

export async function getPostReactions(req, res) {
  const { postId } = req.params;

  try {
    const countResult = await pool.query(
      `SELECT type, COUNT(*) AS count
       FROM post_reactions
       WHERE post_id = $1
       GROUP BY type
       ORDER BY count DESC`,
      [postId]
    );

    const usersResult = await pool.query(
      `SELECT pr.type, pr.created_at, u.id AS user_id, u.username, u.name, u.avatar_url
       FROM post_reactions pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.post_id = $1
       ORDER BY pr.created_at DESC
       LIMIT 50`,
      [postId]
    );

    res.status(200).json({
      status: 'success',
      total: usersResult.rows.length,
      reactions: countResult.rows,
      users: usersResult.rows
    });
  } catch (error) {
    console.error('Error fetching post reactions:', error);
    res.status(500).json({ status: 'error', message: 'reaction/fetch_failed', error: error.message });
  }
}

// ─────────────────────────────────────────────
// COMMENT REACTIONS
// ─────────────────────────────────────────────

export async function reactToComment(req, res) {
  const { commentId } = req.params;
  const { type = 'like' } = req.body;
  const userId = req.user.id;

  const VALID_TYPES = ['like', 'love', 'haha', 'wow', 'sad', 'cry', 'angry'];
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({
      status: 'error',
      message: 'reaction/invalid_type',
      valid_types: VALID_TYPES
    });
  }

  try {
    const commentCheck = await pool.query(
      'SELECT id FROM comments WHERE id = $1 AND deleted_at IS NULL',
      [commentId]
    );
    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'comment/not_found' });
    }

    await pool.query(
      `INSERT INTO comment_reactions (comment_id, user_id, type)
       VALUES ($1, $2, $3)
       ON CONFLICT (comment_id, user_id) 
       DO UPDATE SET type = EXCLUDED.type, created_at = NOW()`,
      [commentId, userId, type]
    );

    const countResult = await pool.query(
      `SELECT type, COUNT(*) AS count FROM comment_reactions WHERE comment_id = $1 GROUP BY type`,
      [commentId]
    );
    const myReactions = await pool.query(
      `SELECT type FROM comment_reactions WHERE comment_id = $1 AND user_id = $2`,
      [commentId, userId]
    );

    const currentReaction = myReactions.rows[0]?.type || null;

    res.status(200).json({
      status: 'success',
      message: 'reaction/reacted_successfully',
      is_reacted: true,
      my_reaction: currentReaction,
      reactions: countResult.rows,
      my_reactions: myReactions.rows.map(r => r.type)
    });
  } catch (error) {
    console.error('Error reacting to comment:', error);
    res.status(500).json({ status: 'error', message: 'reaction/failed', error: error.message });
  }
}

export async function removeCommentReaction(req, res) {
  const { commentId } = req.params;
  const { type } = req.body || {};
  const userId = req.user.id;

  try {
    if (type) {
      await pool.query(
        'DELETE FROM comment_reactions WHERE comment_id = $1 AND user_id = $2 AND type = $3',
        [commentId, userId, type]
      );
    } else {
      await pool.query(
        'DELETE FROM comment_reactions WHERE comment_id = $1 AND user_id = $2',
        [commentId, userId]
      );
    }

    const countResult = await pool.query(
      `SELECT type, COUNT(*) AS count FROM comment_reactions WHERE comment_id = $1 GROUP BY type`,
      [commentId]
    );
    const myReactions = await pool.query(
      `SELECT type FROM comment_reactions WHERE comment_id = $1 AND user_id = $2`,
      [commentId, userId]
    );

    res.status(200).json({
      status: 'success',
      message: 'reaction/removed_successfully',
      is_reacted: myReactions.rows.length > 0,
      my_reaction: myReactions.rows[0]?.type || null,
      reactions: countResult.rows,
      my_reactions: myReactions.rows.map(r => r.type)
    });
  } catch (error) {
    console.error('Error removing comment reaction:', error);
    res.status(500).json({ status: 'error', message: 'reaction/failed', error: error.message });
  }
}

// ─────────────────────────────────────────────
// BACKWARD-COMPAT ALIASES  (old `/likes` routes)
// ─────────────────────────────────────────────
export const likePost     = reactToPost;
export const unlikePost   = removePostReaction;
export const getPostLikes = getPostReactions;
