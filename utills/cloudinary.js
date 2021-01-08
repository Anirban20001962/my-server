const cloudinary = require('cloudinary');
const {cloudinary_cloud_name,cloudinary_api_key,cloudinary_api_secret} = require('../config');
cloudinary.config({
    cloud_name: cloudinary_cloud_name, 
    api_key: cloudinary_api_key, 
    api_secret: cloudinary_api_secret 
})
exports.uploads = (file,folder) => {
    return new Promise(resolve => {
        cloudinary.uploader.upload(file,(result) => {
            resolve({
                url: result.url,
                secure_url: result.secure_url,
                id: result.public_id
            },{
                resource_type: 'auto',
                folder: folder
            });
        })
    })
}
exports.delete = (public_id) => {
    cloudinary.uploader.destroy(public_id, function(result) { console.log(result) });
}