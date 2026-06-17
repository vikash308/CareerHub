import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Called lazily inside params so env vars are read at request time, not at import time
function getCloudinaryConfig() {
    return {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    };
}

cloudinary.config(getCloudinaryConfig());

// Storage for profile pictures
const profilePictureStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'careerhub/profile_pictures',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    },
});

// Storage for post media (images and videos)
const postMediaStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const isVideo = file.mimetype.startsWith('video/');
        return {
            folder: 'careerhub/posts',
            resource_type: isVideo ? 'video' : 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'webm'],
        };
    },
});

export const uploadToCloudinary = multer({ storage: profilePictureStorage });
export const uploadPostMedia = multer({ storage: postMediaStorage });

export default cloudinary;
