import { Readable } from 'stream';
import { cloudinary } from "../config/cloudConfig.js";

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

export default uploadToCloudinary;