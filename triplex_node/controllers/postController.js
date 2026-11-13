import pool from '../db.js';
import uploadFile from '../core/cloudinary.js';
import fs from 'fs';

// Helper function to fetch full details for a post (including media, tripPlan, and nested repost)
async function fetchFullPost(postId, currentUserId = null, depth = 0) {
  const result = await pool.query(`
    SELECT 
      p.id as post_id,
      p.type,
      p.caption as post_caption,
      p.likes_count,
      p.comments_count,
      p.reposts_count,
      p.repost_id,
      p.created_at as post_created_at,
      p.updated_at as post_updated_at,
      u.id as user_id,
      u.username,
      u.email,
      u.name,
      u.avatar_url,
      tp.id as trip_plan_id,
      tp.title as trip_plan_title,
      tp.description as trip_plan_description,
      tp.total_cost,
      tp.total_cost_currency,
      CASE WHEN pr.id IS NOT NULL THEN true ELSE false END as is_liked,
      pr.type as my_reaction,
      CASE WHEN ur.id IS NOT NULL THEN true ELSE false END as is_reposted
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN trip_plans tp ON p.trip_plan_id = tp.id
    LEFT JOIN post_reactions pr ON pr.post_id = p.id AND pr.user_id = $2
    LEFT JOIN posts ur ON ur.repost_id = p.id AND ur.user_id = $2 AND ur.deleted_at IS NULL
    WHERE p.id = $1 AND p.deleted_at IS NULL
  `, [postId, currentUserId]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  const post = {
    id: row.post_id,
    type: row.type,
    caption: row.post_caption,
    likes_count: parseInt(row.likes_count, 10) || 0,
    comments_count: parseInt(row.comments_count, 10) || 0,
    repost_count: parseInt(row.reposts_count, 10) || 0,
    reposts_count: parseInt(row.reposts_count, 10) || 0,
    repost_id: row.repost_id || null,
    is_liked: row.is_liked || false,
    my_reaction: row.my_reaction || null,
    is_reposted: row.is_reposted || false,
    created_at: row.post_created_at,
    updated_at: row.post_updated_at,
    user: {
      id: row.user_id,
      username: row.username,
      email: row.email,
      name: row.name,
      avatar_url: row.avatar_url
    }
  };

  // Fetch attached media
  const mediaResult = await pool.query(
    `SELECT id, cloud_url, public_id, type, sort_order FROM media WHERE post_id = $1 ORDER BY sort_order ASC`,
    [row.post_id]
  );
  post.media = mediaResult.rows;
  post.media_urls = mediaResult.rows.map(m => m.cloud_url);

  if (row.trip_plan_id) {
    post.tripPlan = {
      id: row.trip_plan_id,
      title: row.trip_plan_title,
      caption: row.trip_plan_description,
      total_cost: row.total_cost,
      total_cost_currency: row.total_cost_currency
    };

    const stopsResult = await pool.query(
      `SELECT id, title, role, location, place_id, latitude, longitude, description, cost, currency, sort_order, created_at, updated_at
       FROM trip_plan_stops
       WHERE trip_plan_id = $1
       ORDER BY sort_order ASC`,
      [row.trip_plan_id]
    );
    
    post.tripPlan.waypoints = stopsResult.rows.filter(s => s.role === 'waypoint');
    post.tripPlan.start = stopsResult.rows.find(s => s.role === 'start') || null;
    post.tripPlan.end = stopsResult.rows.find(s => s.role === 'end') || null;
  }

  // If this post is a repost, fetch original post (limit recursion depth to 1)
  if (row.repost_id && depth < 1) {
    post.reposted_post = await fetchFullPost(row.repost_id, currentUserId, depth + 1);
  }

  return post;
}

export async function createPost(req, res) {
  let { type, caption, trip_plan_id, trip_plan, repost_id } = req.body;
  const userId = req.user.id;
  const files = req.files || [];

  // Parse trip_plan if provided as a JSON string via multipart/form-data
  if (typeof trip_plan === 'string') {
    try {
      trip_plan = JSON.parse(trip_plan);
    } catch (err) {
      console.error('Failed to parse trip_plan JSON string:', err);
    }
  }

  const hasTripPlan = Boolean(trip_plan || trip_plan_id);
  const hasMedia = files.length > 0;
  const hasRepost = Boolean(repost_id);

  if (!type) {
    if (hasRepost) {
      type = 'repost';
    } else if (hasTripPlan && hasMedia) {
      type = 'trip_plan_media';
    } else if (hasTripPlan) {
      type = 'trip_plan';
    } else if (hasMedia) {
      type = 'media';
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'post/content_required'
      });
    }
  }

  if (hasRepost) {
    const originalPostCheck = await pool.query(
      'SELECT id FROM posts WHERE id = $1 AND deleted_at IS NULL',
      [repost_id]
    );
    if (originalPostCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'post/original_post_not_found'
      });
    }
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let finalTripPlanId = trip_plan_id || null;
    let createdTripPlan = null;
    let insertedStops = [];

    // 1. If trip_plan details are provided inline, save it first
    if ((type === 'trip_plan' || type === 'trip_plan_media') && trip_plan) {
      const planResult = await client.query(
        `INSERT INTO trip_plans (owner_id, title, description) 
         VALUES ($1, $2, $3) 
         RETURNING id, owner_id, title, description as caption, total_cost, total_cost_currency, created_at, updated_at`,
        [userId, trip_plan.title, trip_plan.caption || null]
      );

      finalTripPlanId = planResult.rows[0].id;
      createdTripPlan = planResult.rows[0];

      const insertStop = async (stop, role, sortOrder) => {
        if (!stop) return;
        const stopResult = await client.query(
          `INSERT INTO trip_plan_stops 
            (trip_plan_id, title, role, location, place_id, latitude, longitude, description, cost, currency, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING id, trip_plan_id, title, role, location, place_id, latitude, longitude, description, cost, currency, sort_order, created_at, updated_at`,
          [
            finalTripPlanId,
            stop.title,
            role,
            stop.location || null,
            stop.placeId || stop.place_id || null,
            stop.latitude != null ? parseFloat(stop.latitude) : null,
            stop.longitude != null ? parseFloat(stop.longitude) : null,
            stop.description || null,
            stop.cost != null ? parseFloat(stop.cost) : null,
            stop.currency || null,
            sortOrder
          ]
        );
        insertedStops.push(stopResult.rows[0]);
      };

      if (trip_plan.start) {
        await insertStop(trip_plan.start, 'start', 0);
      }

      if (trip_plan.waypoints && Array.isArray(trip_plan.waypoints)) {
        for (let i = 0; i < trip_plan.waypoints.length; i++) {
          await insertStop(trip_plan.waypoints[i], 'waypoint', i + 1);
        }
      }

      if (trip_plan.end) {
        const endSortOrder = (trip_plan.waypoints ? trip_plan.waypoints.length : 0) + 1;
        await insertStop(trip_plan.end, 'end', endSortOrder);
      }

      const finalPlanResult = await client.query(
        `SELECT id, owner_id, title, description as caption, total_cost, total_cost_currency, created_at, updated_at
         FROM trip_plans WHERE id = $1`,
        [finalTripPlanId]
      );
      createdTripPlan = finalPlanResult.rows[0];
    }

    if ((type === 'trip_plan' || type === 'trip_plan_media') && !finalTripPlanId) {
      throw new Error('post/trip_plan_required_for_trip_plan_type');
    }

    // 2. Insert into posts table
    const postResult = await client.query(
      `INSERT INTO posts (user_id, type, trip_plan_id, repost_id, caption) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, user_id, type, trip_plan_id, repost_id, caption, created_at, updated_at`,
      [userId, type, finalTripPlanId, repost_id || null, caption || null]
    );

    const post = postResult.rows[0];
    const insertedMedia = [];

    // 3. Process uploaded media files if present
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadResult = await uploadFile(file.path, 'post_media');

        fs.unlink(file.path, (err) => {
          if (err) console.error('Failed to delete temporary file:', err);
        });

        const mediaResult = await client.query(
          `INSERT INTO media (uploader_id, cloud_url, public_id, type, post_id, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, cloud_url, public_id, type, sort_order, created_at`,
          [userId, uploadResult.secure_url, uploadResult.public_id, uploadResult.resource_type || 'image', post.id, i]
        );
        insertedMedia.push(mediaResult.rows[0]);
      }
    }

    await client.query('COMMIT');

    const fullPost = await fetchFullPost(post.id, userId);

    res.status(201).json({
      status: 'success',
      data: fullPost
    });

  } catch (error) {
    await client.query('ROLLBACK');
    if (files && files.length > 0) {
      files.forEach(f => {
        if (fs.existsSync(f.path)) {
          fs.unlink(f.path, () => {});
        }
      });
    }
    console.error('Error creating post:', error);
    res.status(500).json({
      status: 'error',
      message: error.message.startsWith('post/') ? error.message : 'post/creation_failed',
      error: error.message
    });
  } finally {
    client.release();
  }
}

// Convenience endpoint: POST /api/posts/:postId/repost
export async function repostPost(req, res) {
  const { postId } = req.params;
  const { caption } = req.body;
  const userId = req.user.id;

  try {
    const originalPostCheck = await pool.query(
      'SELECT id FROM posts WHERE id = $1 AND deleted_at IS NULL',
      [postId]
    );

    if (originalPostCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'post/not_found'
      });
    }

    const postResult = await pool.query(
      `INSERT INTO posts (user_id, type, repost_id, caption)
       VALUES ($1, 'repost', $2, $3)
       RETURNING id`,
      [userId, postId, caption || null]
    );

    const newPostId = postResult.rows[0].id;
    const fullPost = await fetchFullPost(newPostId, userId);

    res.status(201).json({
      status: 'success',
      message: 'post/reposted_successfully',
      data: fullPost
    });
  } catch (error) {
    console.error('Error reposting post:', error);
    res.status(500).json({
      status: 'error',
      message: 'post/repost_failed',
      error: error.message
    });
  }
}

export async function getFeed(req, res) {
  const currentUserId = req.user?.id || null;
  try {
    const result = await pool.query(`
      SELECT 
        p.id as post_id,
        p.type,
        p.caption as post_caption,
        p.likes_count,
        p.comments_count,
        p.reposts_count,
        p.repost_id,
        p.created_at as post_created_at,
        p.updated_at as post_updated_at,
        u.id as user_id,
        u.username,
        u.email,
        u.name,
        u.avatar_url,
        tp.id as trip_plan_id,
        tp.title as trip_plan_title,
        tp.description as trip_plan_description,
        tp.total_cost,
        tp.total_cost_currency,
        CASE WHEN pr.id IS NOT NULL THEN true ELSE false END as is_liked,
        pr.type as my_reaction,
        CASE WHEN ur.id IS NOT NULL THEN true ELSE false END as is_reposted
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN trip_plans tp ON p.trip_plan_id = tp.id
      LEFT JOIN post_reactions pr ON pr.post_id = p.id AND pr.user_id = $1
      LEFT JOIN posts ur ON ur.repost_id = p.id AND ur.user_id = $1 AND ur.deleted_at IS NULL
      WHERE p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `, [currentUserId]);

    const posts = [];
    for (const row of result.rows) {
      const post = {
        id: row.post_id,
        type: row.type,
        caption: row.post_caption,
        likes_count: parseInt(row.likes_count, 10) || 0,
        comments_count: parseInt(row.comments_count, 10) || 0,
        repost_count: parseInt(row.reposts_count, 10) || 0,
        reposts_count: parseInt(row.reposts_count, 10) || 0,
        repost_id: row.repost_id || null,
        is_liked: row.is_liked || false,
        my_reaction: row.my_reaction || null,
        is_reposted: row.is_reposted || false,
        created_at: row.post_created_at,
        updated_at: row.post_updated_at,
        user: {
          id: row.user_id,
          username: row.username,
          email: row.email,
          name: row.name,
          avatar_url: row.avatar_url
        }
      };

      // Fetch attached media
      const mediaResult = await pool.query(
        `SELECT id, cloud_url, public_id, type, sort_order FROM media WHERE post_id = $1 ORDER BY sort_order ASC`,
        [row.post_id]
      );
      post.media = mediaResult.rows;
      post.media_urls = mediaResult.rows.map(m => m.cloud_url);

      if (row.trip_plan_id) {
        post.tripPlan = {
          id: row.trip_plan_id,
          title: row.trip_plan_title,
          caption: row.trip_plan_description,
          total_cost: row.total_cost,
          total_cost_currency: row.total_cost_currency
        };

        const stopsResult = await pool.query(
          `SELECT id, title, role, location, place_id, latitude, longitude, description, cost, currency, sort_order, created_at, updated_at
           FROM trip_plan_stops
           WHERE trip_plan_id = $1
           ORDER BY sort_order ASC`,
          [row.trip_plan_id]
        );
        
        post.tripPlan.waypoints = stopsResult.rows.filter(s => s.role === 'waypoint');
        post.tripPlan.start = stopsResult.rows.find(s => s.role === 'start') || null;
        post.tripPlan.end = stopsResult.rows.find(s => s.role === 'end') || null;
      }

      // If this post is a repost, fetch original post
      if (row.repost_id) {
        post.reposted_post = await fetchFullPost(row.repost_id, currentUserId, 1);
      }

      posts.push(post);
    }

    res.status(200).json({
      status: 'success',
      data: posts
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({
      status: 'error',
      message: 'post/feed_fetch_failed',
      error: error.message
    });
  }
}

export async function getPost(req, res) {
  const { postId } = req.params;
  const currentUserId = req.user?.id || null;
  try {
    const post = await fetchFullPost(postId, currentUserId);
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'post/not_found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: post
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      status: 'error',
      message: 'post/fetch_failed',
      error: error.message
    });
  }
}

export async function getUserPosts(req, res) {
  const { userId } = req.params;
  const currentUserId = req.user?.id || null;
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  try {
    let targetUserId = userId;
    if (!UUID_REGEX.test(userId)) {
      const userLookup = await pool.query('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [userId]);
      if (userLookup.rows.length === 0) {
        return res.status(200).json({
          status: 'success',
          data: []
        });
      }
      targetUserId = userLookup.rows[0].id;
    }

    const result = await pool.query(`
      SELECT 
        p.id as post_id,
        p.type,
        p.caption as post_caption,
        p.likes_count,
        p.comments_count,
        p.reposts_count,
        p.repost_id,
        p.created_at as post_created_at,
        p.updated_at as post_updated_at,
        u.id as user_id,
        u.username,
        u.email,
        u.name,
        u.avatar_url,
        tp.id as trip_plan_id,
        tp.title as trip_plan_title,
        tp.description as trip_plan_description,
        tp.total_cost,
        tp.total_cost_currency,
        CASE WHEN pr.id IS NOT NULL THEN true ELSE false END as is_liked,
        pr.type as my_reaction,
        CASE WHEN ur.id IS NOT NULL THEN true ELSE false END as is_reposted
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN trip_plans tp ON p.trip_plan_id = tp.id
      LEFT JOIN post_reactions pr ON pr.post_id = p.id AND pr.user_id = $2
      LEFT JOIN posts ur ON ur.repost_id = p.id AND ur.user_id = $2 AND ur.deleted_at IS NULL
      WHERE p.user_id = $1 AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `, [targetUserId, currentUserId]);

    const posts = [];
    for (const row of result.rows) {
      const post = {
        id: row.post_id,
        type: row.type,
        caption: row.post_caption,
        likes_count: parseInt(row.likes_count, 10) || 0,
        comments_count: parseInt(row.comments_count, 10) || 0,
        repost_count: parseInt(row.reposts_count, 10) || 0,
        reposts_count: parseInt(row.reposts_count, 10) || 0,
        repost_id: row.repost_id || null,
        is_liked: row.is_liked || false,
        my_reaction: row.my_reaction || null,
        is_reposted: row.is_reposted || false,
        created_at: row.post_created_at,
        updated_at: row.post_updated_at,
        user: {
          id: row.user_id,
          username: row.username,
          email: row.email,
          name: row.name,
          avatar_url: row.avatar_url
        }
      };

      // Fetch attached media
      const mediaResult = await pool.query(
        `SELECT id, cloud_url, public_id, type, sort_order FROM media WHERE post_id = $1 ORDER BY sort_order ASC`,
        [row.post_id]
      );
      post.media = mediaResult.rows;
      post.media_urls = mediaResult.rows.map(m => m.cloud_url);

      if (row.trip_plan_id) {
        post.tripPlan = {
          id: row.trip_plan_id,
          title: row.trip_plan_title,
          caption: row.trip_plan_description,
          total_cost: row.total_cost,
          total_cost_currency: row.total_cost_currency
        };

        const stopsResult = await pool.query(
          `SELECT id, title, role, location, place_id, latitude, longitude, description, cost, currency, sort_order, created_at, updated_at
           FROM trip_plan_stops
           WHERE trip_plan_id = $1
           ORDER BY sort_order ASC`,
          [row.trip_plan_id]
        );
        
        post.tripPlan.waypoints = stopsResult.rows.filter(s => s.role === 'waypoint');
        post.tripPlan.start = stopsResult.rows.find(s => s.role === 'start') || null;
        post.tripPlan.end = stopsResult.rows.find(s => s.role === 'end') || null;
      }

      if (row.repost_id) {
        post.reposted_post = await fetchFullPost(row.repost_id, currentUserId, 1);
      }

      posts.push(post);
    }

    res.status(200).json({
      status: 'success',
      data: posts
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({
      status: 'error',
      message: 'post/user_posts_fetch_failed',
      error: error.message
    });
  }
}

export async function updatePost(req, res) {
  const { postId } = req.params;
  const { caption } = req.body;
  const userId = req.user.id;

  try {
    const postCheck = await pool.query('SELECT user_id FROM posts WHERE id = $1 AND deleted_at IS NULL', [postId]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'post/not_found'
      });
    }

    if (postCheck.rows[0].user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'post/unauthorized'
      });
    }

    const result = await pool.query(
      `UPDATE posts 
       SET caption = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING id, user_id, type, trip_plan_id, repost_id, caption, created_at, updated_at`,
      [caption, postId]
    );

    res.status(200).json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({
      status: 'error',
      message: 'post/update_failed',
      error: error.message
    });
  }
}

export async function deletePost(req, res) {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const postCheck = await pool.query('SELECT user_id, deleted_at FROM posts WHERE id = $1', [postId]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'post/not_found'
      });
    }

    if (postCheck.rows[0].deleted_at) {
      return res.status(410).json({
        status: 'error',
        message: 'post/already_deleted'
      });
    }

    if (postCheck.rows[0].user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'post/unauthorized'
      });
    }

    await pool.query('UPDATE posts SET deleted_at = NOW() WHERE id = $1', [postId]);

    res.status(200).json({
      status: 'success',
      message: 'post/deleted_successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      status: 'error',
      message: 'post/delete_failed',
      error: error.message
    });
  }
}

