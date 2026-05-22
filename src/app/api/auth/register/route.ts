import { NextResponse } from "next/server";
import { hashSync } from "bcryptjs";
import { getDb } from "@/lib/db";
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
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const hash = hashSync(password, 10);
  const result = db.prepare(
    "INSERT INTO users (name, email, password_hash, points) VALUES (?, ?, ?, 100)"
  ).run(name, email, hash);

  const userId = result.lastInsertRowid as number;

  db.prepare(
    "INSERT INTO points_history (user_id, amount, reason) VALUES (?, 100, 'Welcome bonus')"
  ).run(userId);

  await createSession(userId);

  return NextResponse.json({ success: true });
}
