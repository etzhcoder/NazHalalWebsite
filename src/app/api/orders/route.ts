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

  const ordersResult = await db.execute({
    sql: `SELECT id, status, total_cents, points_earned, created_at
     FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
    args: [session.userId],
  });

  const result = [];
  for (const order of ordersResult.rows) {
    const itemsResult = await db.execute({
      sql: "SELECT name, price_cents, quantity FROM order_items WHERE order_id = ?",
      args: [order.id],
    });
    result.push({ ...order, items: itemsResult.rows });
  }

  return NextResponse.json(result);
}
