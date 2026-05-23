import uploadFile, { getPublicUrl } from '../../core/cloudinary.js';
import fs from 'fs';
import pool from '../../db.js';

export async function updateProfilePicture(req, res) {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        status: 'error',
        message: 'profile/no_file_uploaded'
      });
    }

    // 1. Upload file to Cloudinary
    const uploadResult = await uploadFile(file.path, 'profile_pictures');
    const cloudUrl = uploadResult.secure_url;
    const publicId = uploadResult.public_id;
    const resourceType = uploadResult.resource_type;

    // Clean up temporary file
    fs.unlink(file.path, (err) => {
      if (err) console.error('Failed to delete temporary file:', err);
    });

    // Generate a "public url" (optionally with transformations)
    // Using the publicId to generate a secure URL
    const publicUrl = getPublicUrl(publicId, {
      width: 500,
      height: 500,
      crop: 'fill',
      gravity: 'face'
    });

    // 3. Insert into media table
    const mediaResult = await pool.query(
      'INSERT INTO media (uploader_id, cloud_url, public_id, type) VALUES ($1, $2, $3, $4) RETURNING id',
      [userId, cloudUrl, publicId, resourceType]
    );
    const mediaId = mediaResult.rows[0].id;

    // 4. Update user profile
    await pool.query(
      'UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2',
      [publicUrl, userId]
    );

    res.status(200).json({
      status: 'success',
      message: 'profile/picture_updated_successfully',
      avatarUrl: publicUrl,
      mediaId: mediaId
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({
      status: 'error',
      message: 'profile/update_failed',
      error: error.message
    });
  }
}