import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, migrate } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { sessionId } = await req.json();
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
  }

  const checkoutSession = await getStripe().checkout.sessions.retrieve(sessionId);

  if (checkoutSession.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
  }

  const orderId = checkoutSession.metadata?.order_id;
  if (!orderId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const db = getDb();
  await migrate();

  const orderResult = await db.execute({
    sql: "SELECT id, total_cents, status FROM orders WHERE id = ? AND user_id = ?",
    args: [Number(orderId), session.userId],
  });

  const order = orderResult.rows[0];
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (String(order.status) === "pending") {
    const pointsEarned = Math.floor(Number(order.total_cents) / 100);

    await db.execute({
      sql: "UPDATE orders SET status = 'paid', points_earned = ? WHERE id = ?",
      args: [pointsEarned, order.id],
    });
    await db.execute({
      sql: "UPDATE users SET points = points + ? WHERE id = ?",
      args: [pointsEarned, session.userId],
    });
    await db.execute({
      sql: "INSERT INTO points_history (user_id, amount, reason) VALUES (?, ?, ?)",
      args: [session.userId, pointsEarned, `Order #${order.id} - earned points`],
    });
  }

  const itemsResult = await db.execute({
    sql: "SELECT name, price_cents, quantity FROM order_items WHERE order_id = ?",
    args: [order.id],
  });

  const updatedResult = await db.execute({
    sql: "SELECT id, status, total_cents, points_earned, created_at FROM orders WHERE id = ?",
    args: [order.id],
  });

  return NextResponse.json({ ...updatedResult.rows[0], items: itemsResult.rows });
}
