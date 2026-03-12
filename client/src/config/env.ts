export const ENV = {
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL as string,

  CLOUDINARY: {
    CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string,
    UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string,
  },
};
