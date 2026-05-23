import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL
});

/**
 * Upload an image or video to Cloudinary
 * @param {string} filePath - The path to the file to upload
 * @param {string} assetFolderName - The folder name in Cloudinary
 * @param {'image'|'video'|'auto'} resourceType - The type of resource to upload
 * @returns {Promise<Object>} - The upload result from Cloudinary
 */
export const uploadFile = async (filePath, assetFolderName = 'triplex_assets', resourceType = 'auto') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: assetFolderName,
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

/**
 * Generate a transformed URL for an asset
 * @param {string} publicId - The public ID of the asset
 * @param {Object} options - Transformation options
 * @returns {string} - The transformed URL
 */
export const getPublicUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    ...options
  });
};

export default uploadFile;