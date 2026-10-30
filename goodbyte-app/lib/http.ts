import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Wraps a route handler so thrown errors become clean JSON responses.
export const route =
  (fn: (req: Request, ctx: any) => Promise<Response>) =>
  async (req: Request, ctx: any) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
      if (e instanceof ZodError)
        return NextResponse.json({ error: "Invalid input", details: e.flatten() }, { status: 400 });
      console.error(e);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  };
