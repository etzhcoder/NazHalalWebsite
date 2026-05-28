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
    sql: "SELECT id, name, email, points, created_at FROM users WHERE id = ?",
    args: [session.userId],
  });

  const user = result.rows[0];
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
