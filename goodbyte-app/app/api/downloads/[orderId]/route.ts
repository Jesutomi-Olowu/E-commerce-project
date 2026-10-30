import { NextResponse } from "next/server";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db, T } from "@/lib/db";
import { s3, BUCKETS } from "@/lib/s3";
import { requireUser } from "@/lib/guard";
import { HttpError, route } from "@/lib/http";

// Issues a 5-minute download link, only to the buyer of a PAID order.
export const GET = route(async (_req, { params }) => {
  const user = await requireUser();

  const { Item: order } = await db.send(new GetCommand({ TableName: T.orders, Key: { id: params.orderId } }));
  if (!order || order.buyerId !== user.id || order.status !== "paid") throw new HttpError(404, "Not found");

  const { Item: product } = await db.send(new GetCommand({ TableName: T.products, Key: { id: order.productId } }));
  if (!product) throw new HttpError(404, "Not found");

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: BUCKETS.files,
      Key: product.fileKey,
      ResponseContentDisposition: `attachment; filename="${product.fileName}"`,
    }),
    { expiresIn: 300 }
  );
  return NextResponse.json({ url, expiresInSeconds: 300, fileName: product.fileName });
});
