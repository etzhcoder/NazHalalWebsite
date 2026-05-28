import { NextResponse } from "next/server";
import { compareSync } from "bcryptjs";
import { getDb, migrate } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const db = getDb();
  await migrate();

  const result = await db.execute({
    sql: "SELECT id, password_hash FROM users WHERE email = ?",
    args: [email],
  });

  const user = result.rows[0];

  if (!user || !compareSync(password, String(user.password_hash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await createSession(Number(user.id));

  return NextResponse.json({ success: true });
}
