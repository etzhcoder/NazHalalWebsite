import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { isDemoUser } from "@/lib/demo-user";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (isDemoUser(session.userId)) {
    return NextResponse.json([]);
  }

  let db;
  try {
    db = getDb();
  } catch {
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }

  const orders = db.prepare(
    `SELECT id, status, total_cents, points_earned, created_at
     FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`
  ).all(session.userId) as {
    id: number;
    status: string;
    total_cents: number;
    points_earned: number;
    created_at: string;
  }[];

  const getItems = db.prepare(
    "SELECT name, price_cents, quantity FROM order_items WHERE order_id = ?"
  );

  const result = orders.map((order) => ({
    ...order,
    items: getItems.all(order.id) as { name: string; price_cents: number; quantity: number }[],
  }));

  return NextResponse.json(result);
}
