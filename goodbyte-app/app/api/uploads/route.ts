import { NextResponse } from "next/server";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { z } from "zod";
import { s3, BUCKETS } from "@/lib/s3";
import { requireUser } from "@/lib/guard";
import { HttpError, route } from "@/lib/http";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const FILE_TYPES = [
  "application/zip",
  "application/pdf",
  "font/otf",
  "font/ttf",
  "audio/mpeg",
  "audio/wav",
];

const schema = z.object({
  kind: z.enum(["image", "file"]),
  filename: z.string().min(1).max(150),
  contentType: z.string(),
});

// Returns a short-lived signed form the browser uses to upload straight to S3.
// The key is ALWAYS prefixed with the seller's own id, so sellers can't overwrite each other.
export const POST = route(async (req) => {
  const user = await requireUser("seller");
  const { kind, filename, contentType } = schema.parse(await req.json());

  const allowed = kind === "image" ? IMAGE_TYPES : FILE_TYPES;
  if (!allowed.includes(contentType)) throw new HttpError(400, "File type not allowed");

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${kind === "image" ? "images" : "files"}/${user.id}/${crypto.randomUUID()}-${safeName}`;
  const maxBytes = kind === "image" ? 5 * 1024 * 1024 : 100 * 1024 * 1024;

  const { url, fields } = await createPresignedPost(s3, {
    Bucket: kind === "image" ? BUCKETS.images : BUCKETS.files,
    Key: key,
    Conditions: [
      ["content-length-range", 1, maxBytes],
      ["eq", "$Content-Type", contentType],
    ],
    Fields: { "Content-Type": contentType },
    Expires: 300,
  });

  return NextResponse.json({ url, fields, key });
});
