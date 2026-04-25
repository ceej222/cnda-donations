import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "Server is missing ADMIN_PASSWORD" },
      { status: 500 }
    );
  }
  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";
  if (password !== expected) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
