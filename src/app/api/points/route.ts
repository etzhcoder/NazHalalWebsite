import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = getDb();
  const history = db.prepare(
    "SELECT id, amount, reason, created_at FROM points_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50"
  ).all(session.userId);

  return NextResponse.json(history);
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

  const user = db.prepare("SELECT points FROM users WHERE id = ?").get(session.userId) as
    | { points: number }
    | undefined;

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.points + amount < 0) {
    return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
  }

  const update = db.transaction(() => {
    db.prepare("UPDATE users SET points = points + ? WHERE id = ?").run(amount, session.userId);
    db.prepare("INSERT INTO points_history (user_id, amount, reason) VALUES (?, ?, ?)").run(
      session.userId,
      amount,
      reason
    );
  });

  update();

  const updated = db.prepare("SELECT points FROM users WHERE id = ?").get(session.userId) as { points: number };

  return NextResponse.json({ points: updated.points });
}
