const crypto = require('crypto');

const buildCloudinarySignature = (paramsToSign, apiSecret) => {
    const sortedEntries = Object.entries(paramsToSign).sort(([a], [b]) => a.localeCompare(b));
    const stringToSign = sortedEntries.map(([key, value]) => `${key}=${value}`).join('&');

    return crypto.createHash('sha1').update(`${stringToSign}${apiSecret}`).digest('hex');
};

exports.uploadImageBuffer = async ({ buffer, folder, publicId }) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = {
        folder,
        public_id: publicId,
        timestamp,
    };

    const signature = buildCloudinarySignature(paramsToSign, apiSecret);
    const formData = new FormData();

    formData.append('file', new Blob([buffer], { type: 'image/jpeg' }), `${publicId}.jpeg`);
    formData.append('api_key', apiKey);
    formData.append('timestamp', String(timestamp));
    formData.append('folder', folder);
    formData.append('public_id', publicId);
    formData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cloudinary upload failed (${response.status}): ${errorText}`);
    }

    return response.json();
};

exports.getUserPhotoSrc = (photo) => {
    if (!photo) return '/img/users/default.jpg';
    if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
    return `/img/users/${photo}`;
};
