import { NextResponse } from "next/server";
import { PutCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { z } from "zod";
import { db, T } from "@/lib/db";
import { requireUser } from "@/lib/guard";
import { route } from "@/lib/http";
import { CATEGORIES, toPublic } from "@/lib/products";

// GET /api/products            -> public list of live products
// GET /api/products?mine=1     -> the signed-in seller's own products
// (MVP uses Scan for the public list. Switch to a GSI on status/category when the catalogue grows.)
export const GET = route(async (req) => {
  const url = new URL(req.url);

  if (url.searchParams.get("mine")) {
    const user = await requireUser("seller");
    const { Items } = await db.send(
      new QueryCommand({
        TableName: T.products,
        IndexName: "seller-index",
        KeyConditionExpression: "sellerId = :s",
        ExpressionAttributeValues: { ":s": user.id },
      })
    );
    return NextResponse.json((Items ?? []).map(toPublic));
  }

  const category = url.searchParams.get("category");
  const { Items } = await db.send(
    new ScanCommand({
      TableName: T.products,
      FilterExpression: category ? "#st = :live AND category = :c" : "#st = :live",
      ExpressionAttributeNames: { "#st": "status" },
      ExpressionAttributeValues: category ? { ":live": "live", ":c": category } : { ":live": "live" },
      Limit: 100,
    })
  );
  return NextResponse.json((Items ?? []).map(toPublic));
});

export const POST = route(async (req) => {
  const user = await requireUser("seller"); // sellerId comes from the session, never the body

  const schema = z.object({
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().min(1).max(5000),
    priceKobo: z.number().int().min(100), // 100 kobo = 1 naira
    category: z.enum(CATEGORIES),
    format: z.string().trim().max(30), // e.g. "PDF", "OTF, TTF"
    imageKeys: z.array(z.string().startsWith(`images/${user.id}/`)).min(1).max(5),
    fileKey: z.string().startsWith(`files/${user.id}/`), // must be in THIS seller's folder
    fileName: z.string().max(150),
    status: z.enum(["draft", "live"]).default("live"),
  });
  const body = schema.parse(await req.json());

  const now = new Date().toISOString();
  const product = { id: crypto.randomUUID(), sellerId: user.id, sellerName: user.name ?? "Creator", currency: "NGN", createdAt: now, updatedAt: now, ...body };
  await db.send(new PutCommand({ TableName: T.products, Item: product }));

  return NextResponse.json(toPublic(product), { status: 201 });
});
