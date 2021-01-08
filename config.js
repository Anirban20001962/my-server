const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  json_secret_key: process.env.JWEB_TOKEN_SECRET,
  mongodb_url : process.env.MONGODB_URL,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY, 
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET
};