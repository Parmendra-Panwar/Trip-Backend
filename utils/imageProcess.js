import sharp from 'sharp';

const processImage = async (buffer, width = 1200, height = 800) => {
    return await sharp(buffer)
        .resize(width, height, { fit: 'cover', withoutEnlargement: true })
        .webp({ quality: 80 })
        
}

export default processImage;