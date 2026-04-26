import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return req.headers.get("x-admin-password") === expected;
}

export async function GET() {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function PATCH(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const patch: {
    total_raised?: number;
    goal?: number;
    celebration_active?: boolean;
  } = {};
  if (typeof body?.total_raised === "number" && body.total_raised >= 0) {
    patch.total_raised = body.total_raised;
  }
  if (typeof body?.goal === "number" && body.goal > 0) {
    patch.goal = body.goal;
  }
  if (typeof body?.celebration_active === "boolean") {
    patch.celebration_active = body.celebration_active;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("settings")
    .update(patch)
    .eq("id", 1)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}
