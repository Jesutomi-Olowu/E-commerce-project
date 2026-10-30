import { NextResponse } from "next/server";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { db, T } from "@/lib/db";
import { requireUser } from "@/lib/guard";
import { route } from "@/lib/http";

// The signed-in user's purchases ("My library").
export const GET = route(async () => {
  const user = await requireUser();
  const { Items } = await db.send(
    new QueryCommand({
      TableName: T.orders,
      IndexName: "buyer-index",
      KeyConditionExpression: "buyerId = :b",
      ExpressionAttributeValues: { ":b": user.id },
    })
  );
  return NextResponse.json(Items ?? []);
});
