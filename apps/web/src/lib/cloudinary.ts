import axios from 'axios';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;

/**
 * Generates a Cloudinary signature for signed uploads.
 * In a real production app, this should be done on the backend.
 */
async function generateSignature(params: Record<string, any>, secret: string) {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  
  const stringToSign = sortedParams + secret;
  
  // Use Web Crypto API to generate SHA-1 hash
  const msgUint8 = new TextEncoder().encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

export async function uploadToCloudinary(file: File): Promise<string> {
  // Local development fallback: without Cloudinary credentials, store a
  // compressed data URL so logo/avatar uploads still work end-to-end.
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return fileToCompressedDataUrl(file);
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  
  // Parameters to sign (Cloudinary requires specific alphabetical order for signing)
  const paramsToSign = {
    timestamp: timestamp,
  };

  const signature = await generateSignature(paramsToSign, API_SECRET);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', API_KEY);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);

  const { data } = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    formData
  );

  return data.secure_url;
}

async function fileToCompressedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxSize = 384;
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process the selected image');

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  return canvas.toDataURL('image/jpeg', 0.75);
}
