import { NextResponse } from "next/server";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db, T } from "@/lib/db";
import { HttpError, route } from "@/lib/http";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().max(200),
  password: z.string().min(8).max(100),
  role: z.enum(["buyer", "seller"]), // "admin" can never be self-assigned
});

export const POST = route(async (req) => {
  const body = schema.parse(await req.json());
  const email = body.email.toLowerCase();

  try {
    await db.send(
      new PutCommand({
        TableName: T.users,
        Item: {
          email,
          id: crypto.randomUUID(),
          name: body.name,
          role: body.role,
          passwordHash: await bcrypt.hash(body.password, 12),
          createdAt: new Date().toISOString(),
        },
        ConditionExpression: "attribute_not_exists(email)", // no duplicate accounts
      })
    );
  } catch (e) {
    if (e instanceof ConditionalCheckFailedException) throw new HttpError(409, "Email already registered");
    throw e;
  }
  return NextResponse.json({ ok: true }, { status: 201 });
});
