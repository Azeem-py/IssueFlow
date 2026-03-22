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
