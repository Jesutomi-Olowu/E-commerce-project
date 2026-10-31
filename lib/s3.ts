import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({ region: process.env.APP_REGION });

export const BUCKETS = {
  images: process.env.IMAGES_BUCKET!, // served publicly through CloudFront
  files: process.env.FILES_BUCKET!, // PRIVATE: only reachable via signed URLs
};
