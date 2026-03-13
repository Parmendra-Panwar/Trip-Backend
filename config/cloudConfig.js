require('dotenv').config(); 

// 🔥 FIX: Yahan se '.v2' hata diya hai
const cloudinary = require('cloudinary'); 
const CloudinaryStorage = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // Ab library khud iske andar se .v2 nikal legi
  params: {
    folder: 'wonderlust_DEV',
    allowedFormats: ["png", "jpg", "jpeg"],
  },
});

module.exports = {
  storage,
  cloudinary
}