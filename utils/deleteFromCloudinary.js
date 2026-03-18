const { cloudinary } = require("../config/cloudConfig.js");

const deleteFromCloudinary = async (imagesArray) => {
    if (imagesArray?.length > 0) {
        const deletePromises = imagesArray.map(img => 
            cloudinary.uploader.destroy(img.filename)
        );
        await Promise.all(deletePromises);
    }
};

// CommonJS export (require ke liye)
module.exports = deleteFromCloudinary;