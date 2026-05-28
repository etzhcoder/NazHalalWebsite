import { NextResponse } from "next/server";
import { compareSync } from "bcryptjs";
import { getDb } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  let db;
  try {
    db = getDb();
  } catch {
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }

  const user = db.prepare("SELECT id, password_hash FROM users WHERE email = ?").get(email) as
    | { id: number; password_hash: string }
    | undefined;

  if (!user || !compareSync(password, user.password_hash)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await createSession(user.id);

  return NextResponse.json({ success: true });
}
