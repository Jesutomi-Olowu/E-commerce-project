import { NextResponse } from "next/server";
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";
import { db, T } from "@/lib/db";
import { requireUser } from "@/lib/guard";
import { HttpError, route } from "@/lib/http";
import { initializeTransaction } from "@/lib/paystack";

const schema = z.object({ productId: z.string().min(1) });

export const POST = route(async (req) => {
  const user = await requireUser();
  const { productId } = schema.parse(await req.json());

  const { Item: product } = await db.send(new GetCommand({ TableName: T.products, Key: { id: productId } }));
  if (!product || product.status !== "live") throw new HttpError(404, "Product not found");
  if (product.sellerId === user.id) throw new HttpError(400, "You can't buy your own product");

  // Already bought? Send them to their library instead of charging twice.
  const { Items: previous } = await db.send(
    new QueryCommand({
      TableName: T.orders,
      IndexName: "buyer-index",
      KeyConditionExpression: "buyerId = :b",
      FilterExpression: "productId = :p AND #st = :paid",
      ExpressionAttributeNames: { "#st": "status" },
      ExpressionAttributeValues: { ":b": user.id, ":p": productId, ":paid": "paid" },
    })
  );
  if (previous?.length) throw new HttpError(409, "You already own this product");

  // Price comes from the database, never from the browser.
  const amountKobo: number = product.priceKobo;
  const feePercent = Number(process.env.PLATFORM_FEE_PERCENT ?? 0);
  const platformFeeKobo = Math.round((amountKobo * feePercent) / 100);

  const orderId = crypto.randomUUID(); // also used as the Paystack reference
  await db.send(
    new PutCommand({
      TableName: T.orders,
      Item: {
        id: orderId,
        buyerId: user.id,
        buyerEmail: user.email,
        productId,
        sellerId: product.sellerId,
        productTitle: product.title,
        amountKobo,
        currency: "NGN",
        platformFeeKobo,
        sellerEarningsKobo: amountKobo - platformFeeKobo,
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    })
  );

  const tx = await initializeTransaction({
    email: user.email!,
    amountKobo,
    reference: orderId,
    callbackUrl: `${process.env.APP_URL}/account/orders/${orderId}`,
  });

  return NextResponse.json({ orderId, authorizationUrl: tx.authorization_url });
});
