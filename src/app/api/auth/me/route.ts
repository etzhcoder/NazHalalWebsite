import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { isDemoUser, DEMO_USER } from "@/lib/demo-user";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (isDemoUser(session.userId)) {
    const { password, ...user } = DEMO_USER;
    return NextResponse.json(user);
  }

  let db;
  try {
    db = getDb();
  } catch {
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }

  const user = db.prepare("SELECT id, name, email, points, created_at FROM users WHERE id = ?").get(session.userId) as
    | { id: number; name: string; email: string; points: number; created_at: string }
    | undefined;

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
