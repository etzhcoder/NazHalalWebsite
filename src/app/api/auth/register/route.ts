import { NextResponse } from "next/server";
import { hashSync } from "bcryptjs";
import { getDb, migrate } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const db = getDb();
  await migrate();

  const existing = await db.execute({ sql: "SELECT id FROM users WHERE email = ?", args: [email] });
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const hash = hashSync(password, 10);
  const result = await db.execute({
    sql: "INSERT INTO users (name, email, password_hash, points) VALUES (?, ?, ?, 100)",
    args: [name, email, hash],
  });

  const userId = Number(result.lastInsertRowid);

  await db.execute({
    sql: "INSERT INTO points_history (user_id, amount, reason) VALUES (?, 100, 'Welcome bonus')",
    args: [userId],
  });

  await createSession(userId);

  return NextResponse.json({ success: true });
}
