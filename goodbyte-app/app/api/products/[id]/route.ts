import { NextResponse } from "next/server";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { z } from "zod";
import { auth } from "@/auth";
import { db, T } from "@/lib/db";
import { requireUser } from "@/lib/guard";
import { HttpError, route } from "@/lib/http";
import { CATEGORIES, toPublic } from "@/lib/products";

export const GET = route(async (_req, { params }) => {
  const { Item } = await db.send(new GetCommand({ TableName: T.products, Key: { id: params.id } }));
  const session = await auth();
  const isOwner = session?.user?.id === Item?.sellerId;
  if (!Item || (Item.status !== "live" && !isOwner)) throw new HttpError(404, "Not found");
  return NextResponse.json(toPublic(Item));
});

export const PATCH = route(async (req, { params }) => {
  const user = await requireUser("seller");

  const schema = z
    .object({
      title: z.string().trim().min(3).max(120),
      description: z.string().trim().min(1).max(5000),
      priceKobo: z.number().int().min(100),
      category: z.enum(CATEGORIES),
      format: z.string().trim().max(30),
      status: z.enum(["draft", "live"]),
      imageKeys: z.array(z.string().startsWith(`images/${user.id}/`)).min(1).max(5),
      fileKey: z.string().startsWith(`files/${user.id}/`),
      fileName: z.string().max(150),
    })
    .partial()
    .strict(); // unknown fields (like sellerId) are rejected
  const data = schema.parse(await req.json());
  const entries = Object.entries(data);
  if (!entries.length) throw new HttpError(400, "Nothing to update");

  const names: Record<string, string> = { "#updatedAt": "updatedAt" };
  const values: Record<string, unknown> = { ":uid": user.id, ":now": new Date().toISOString() };
  const sets = ["#updatedAt = :now"];
  entries.forEach(([k, v], i) => {
    names[`#k${i}`] = k;
    values[`:v${i}`] = v;
    sets.push(`#k${i} = :v${i}`);
  });

  try {
    const { Attributes } = await db.send(
      new UpdateCommand({
        TableName: T.products,
        Key: { id: params.id },
        UpdateExpression: `SET ${sets.join(", ")}`,
        ConditionExpression: "attribute_exists(id) AND sellerId = :uid", // ownership enforced in the database
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ReturnValues: "ALL_NEW",
      })
    );
    return NextResponse.json(toPublic(Attributes));
  } catch (e) {
    if (e instanceof ConditionalCheckFailedException) throw new HttpError(404, "Not found");
    throw e;
  }
});

// Soft delete: files stay in S3 so past buyers can still download what they paid for.
export const DELETE = route(async (_req, { params }) => {
  const user = await requireUser("seller");
  try {
    await db.send(
      new UpdateCommand({
        TableName: T.products,
        Key: { id: params.id },
        UpdateExpression: "SET #st = :removed, updatedAt = :now",
        ConditionExpression: "attribute_exists(id) AND sellerId = :uid",
        ExpressionAttributeNames: { "#st": "status" },
        ExpressionAttributeValues: { ":removed": "removed", ":uid": user.id, ":now": new Date().toISOString() },
      })
    );
  } catch (e) {
    if (e instanceof ConditionalCheckFailedException) throw new HttpError(404, "Not found");
    throw e;
  }
  return NextResponse.json({ ok: true });
});
