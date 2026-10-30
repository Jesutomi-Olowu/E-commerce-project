import { NextResponse } from "next/server";
import crypto from "crypto";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { db, T } from "@/lib/db";

// Paystack calls this after a payment. This is the ONLY place an order becomes "paid".
export async function POST(req: Request) {
  const raw = await req.text(); // signature is computed over the raw body
  const sent = req.headers.get("x-paystack-signature") ?? "";
  const expected = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!).update(raw).digest("hex");

  const a = Buffer.from(sent);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Bad signature" }, { status: 401 });
  }

  const event = JSON.parse(raw);
  if (event.event !== "charge.success") return NextResponse.json({ ok: true });

  const { reference, amount, currency } = event.data;
  const { Item: order } = await db.send(new GetCommand({ TableName: T.orders, Key: { id: reference } }));
  if (!order) return NextResponse.json({ ok: true }); // unknown reference: ignore

  // The amount paid must match what we expected.
  if (order.amountKobo !== amount || order.currency !== currency) {
    console.error("Payment mismatch", { reference, amount, currency });
    return NextResponse.json({ ok: true });
  }

  try {
    await db.send(
      new UpdateCommand({
        TableName: T.orders,
        Key: { id: reference },
        UpdateExpression: "SET #st = :paid, paidAt = :now",
        ConditionExpression: "#st = :pending", // idempotent: repeated webhooks do nothing
        ExpressionAttributeNames: { "#st": "status" },
        ExpressionAttributeValues: { ":paid": "paid", ":pending": "pending", ":now": new Date().toISOString() },
      })
    );
    // TODO: send receipt + download link email with SES here.
  } catch (e) {
    if (!(e instanceof ConditionalCheckFailedException)) throw e;
  }
  return NextResponse.json({ ok: true }); // always 200 so Paystack stops retrying
}
