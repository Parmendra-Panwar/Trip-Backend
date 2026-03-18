const cloudinary = require('cloudinary').v2; // Use v2 for latest features
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Use Memory Storage so we can process the buffer with Sharp
const storage = multer.memoryStorage();

module.exports = {
  storage,
  cloudinary
};