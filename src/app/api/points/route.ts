import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, migrate } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = getDb();
  await migrate();

  const result = await db.execute({
    sql: "SELECT id, amount, reason, created_at FROM points_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
    args: [session.userId],
  });

  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { amount, reason } = await req.json();

  if (typeof amount !== "number" || !reason) {
    return NextResponse.json({ error: "Amount and reason are required" }, { status: 400 });
  }

  const db = getDb();
  await migrate();

  const userResult = await db.execute({
    sql: "SELECT points FROM users WHERE id = ?",
    args: [session.userId],
  });

  const user = userResult.rows[0];
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (Number(user.points) + amount < 0) {
    return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
  }

  await db.execute({
    sql: "UPDATE users SET points = points + ? WHERE id = ?",
    args: [amount, session.userId],
  });
  await db.execute({
    sql: "INSERT INTO points_history (user_id, amount, reason) VALUES (?, ?, ?)",
    args: [session.userId, amount, reason],
  });

  const updated = await db.execute({
    sql: "SELECT points FROM users WHERE id = ?",
    args: [session.userId],
  });

  return NextResponse.json({ points: Number(updated.rows[0].points) });
}
