import { S3Client } from "@aws-sdk/client-s3";

// Configure the S3 client to point to Cloudflare R2
export const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "nobelium";
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://nobelium.cdn.ddbrother.me";
