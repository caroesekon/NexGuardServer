const cloudinary = require('../config/cloudinary');

const uploadFile = async (filePath, folder = 'nexguard') => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'auto',
  });
  return { publicId: result.public_id, url: result.secure_url };
};

const deleteFile = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

const uploadBuffer = async (buffer, folder = 'nexguard') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve({ publicId: result.public_id, url: result.secure_url });
      }
    );
    uploadStream.end(buffer);
  });
};

module.exports = { uploadFile, deleteFile, uploadBuffer };