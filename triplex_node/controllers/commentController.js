import pool from '../db.js';

// ─────────────────────────────────────────────
// Helper: shape a comment row → response object
// ─────────────────────────────────────────────
function formatComment(row) {
  return {
    id: row.id,
    post_id: row.post_id,
    parent_comment_id: row.parent_comment_id ?? null,
    content: row.deleted_at ? null : row.content,
    is_deleted: !!row.deleted_at,
    likes_count: row.likes_count,
    replies_count: row.replies_count,
    is_reacted: row.is_reacted ?? false,
    my_reaction: row.my_reaction ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    user: row.deleted_at ? null : {
      id: row.user_id,
      username: row.username,
      name: row.name,
      avatar_url: row.avatar_url
    }
  };
}

export async function createComment(req, res) {
  const { postId } = req.params;
  const { content, parentCommentId = null } = req.body;
  const userId = req.user.id;

  if (!content || content.trim() === '') {
    return res.status(400).json({ status: 'error', message: 'comment/content_required' });
  }

  try {
    const postCheck = await pool.query(
      'SELECT id FROM posts WHERE id = $1 AND deleted_at IS NULL',
      [postId]
    );
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'post/not_found' });
    }

    if (parentCommentId) {
      const parentCheck = await pool.query(
        'SELECT id FROM comments WHERE id = $1 AND post_id = $2 AND deleted_at IS NULL AND parent_comment_id IS NULL',
        [parentCommentId, postId]
      );
      if (parentCheck.rows.length === 0) {
        return res.status(404).json({ status: 'error', message: 'comment/parent_not_found' });
      }
    }

    const result = await pool.query(
      'INSERT INTO comments (post_id, user_id, parent_comment_id, content) VALUES ($1, $2, $3, $4) RETURNING id, post_id, user_id, parent_comment_id, content, likes_count, replies_count, created_at, updated_at',
      [postId, userId, parentCommentId, content.trim()]
    );

    const comment = result.rows[0];
    const userResult = await pool.query(
      'SELECT id, username, name, avatar_url FROM users WHERE id = $1',
      [userId]
    );

    res.status(201).json({
      status: 'success',
      data: { ...comment, is_deleted: false, is_reacted: false, my_reaction: null, user: userResult.rows[0] }
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ status: 'error', message: 'comment/create_failed', error: error.message });
  }
}

export async function getPostComments(req, res) {
  const { postId } = req.params;
  const userId = req.user?.id ?? null;

  try {
    const result = await pool.query(
      'SELECT c.id, c.post_id, c.parent_comment_id, c.content, c.likes_count, c.replies_count, c.created_at, c.updated_at, c.deleted_at, u.id AS user_id, u.username, u.name, u.avatar_url, CASE WHEN cr.id IS NOT NULL THEN true ELSE false END AS is_reacted, cr.type AS my_reaction FROM comments c JOIN users u ON c.user_id = u.id LEFT JOIN comment_reactions cr ON cr.comment_id = c.id AND cr.user_id = $2 WHERE c.post_id = $1 AND c.parent_comment_id IS NULL ORDER BY c.created_at ASC',
      [postId, userId]
    );

    res.status(200).json({ status: 'success', data: result.rows.map(formatComment) });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ status: 'error', message: 'comment/fetch_failed', error: error.message });
  }
}

export async function getReplies(req, res) {
  const { commentId } = req.params;
  const userId = req.user?.id ?? null;

  try {
    const parentCheck = await pool.query('SELECT id FROM comments WHERE id = $1', [commentId]);
    if (parentCheck.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'comment/not_found' });
    }

    const result = await pool.query(
      'SELECT c.id, c.post_id, c.parent_comment_id, c.content, c.likes_count, c.replies_count, c.created_at, c.updated_at, c.deleted_at, u.id AS user_id, u.username, u.name, u.avatar_url, CASE WHEN cr.id IS NOT NULL THEN true ELSE false END AS is_reacted, cr.type AS my_reaction FROM comments c JOIN users u ON c.user_id = u.id LEFT JOIN comment_reactions cr ON cr.comment_id = c.id AND cr.user_id = $2 WHERE c.parent_comment_id = $1 ORDER BY c.created_at ASC',
      [commentId, userId]
    );

    res.status(200).json({ status: 'success', data: result.rows.map(formatComment) });
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({ status: 'error', message: 'comment/fetch_replies_failed', error: error.message });
  }
}

export async function createReply(req, res) {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content || content.trim() === '') {
    return res.status(400).json({ status: 'error', message: 'comment/content_required' });
  }

  try {
    const parent = await pool.query(
      'SELECT id, post_id FROM comments WHERE id = $1 AND deleted_at IS NULL AND parent_comment_id IS NULL',
      [commentId]
    );
    if (parent.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'comment/parent_not_found' });
    }

    const { post_id: postId } = parent.rows[0];

    const result = await pool.query(
      'INSERT INTO comments (post_id, user_id, parent_comment_id, content) VALUES ($1, $2, $3, $4) RETURNING id, post_id, user_id, parent_comment_id, content, likes_count, replies_count, created_at, updated_at',
      [postId, userId, commentId, content.trim()]
    );

    const reply = result.rows[0];
    const userResult = await pool.query(
      'SELECT id, username, name, avatar_url FROM users WHERE id = $1',
      [userId]
    );

    res.status(201).json({
      status: 'success',
      data: { ...reply, is_deleted: false, is_reacted: false, my_reaction: null, user: userResult.rows[0] }
    });
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ status: 'error', message: 'comment/create_reply_failed', error: error.message });
  }
}

export async function deleteComment(req, res) {
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    const commentCheck = await pool.query(
      'SELECT user_id, deleted_at FROM comments WHERE id = $1',
      [commentId]
    );
    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'comment/not_found' });
    }
    if (commentCheck.rows[0].deleted_at) {
      return res.status(410).json({ status: 'error', message: 'comment/already_deleted' });
    }
    if (commentCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ status: 'error', message: 'comment/unauthorized' });
    }

    await pool.query(
      "UPDATE comments SET deleted_at = NOW(), content = '[deleted]' WHERE id = $1",
      [commentId]
    );

    res.status(200).json({ status: 'success', message: 'comment/deleted_successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ status: 'error', message: 'comment/delete_failed', error: error.message });
  }
}
