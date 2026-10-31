Files used in the AWS setup guide. Open each one in VS Code, replace the CAPITAL placeholders
(REGION, ACCOUNT_ID, IMAGES_BUCKET, FILES_BUCKET, YOUR-SITE-ADDRESS) with your real values,
then paste the whole file into the matching AWS console box.

iam-trust-policy.json            -> IAM role > Trust relationships
iam-permissions-policy.json      -> IAM role > Add permissions > Create inline policy > JSON
s3-images-public-read-policy.json-> images bucket > Permissions > Bucket policy
s3-cors.json                     -> BOTH buckets > Permissions > Cross-origin resource sharing (CORS)
