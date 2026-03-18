const { Readable } = require('stream');
const { cloudinary } = require("../config/cloudConfig.js");

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'wonderlust_DEV' },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        
        // Native Node.js method to create a stream from a buffer
        Readable.from(buffer).pipe(stream);
    });
};

module.exports = uploadToCloudinary;