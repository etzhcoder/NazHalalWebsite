import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
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
  const order = db.prepare(
    "SELECT id, total_cents, status FROM orders WHERE id = ? AND user_id = ?"
  ).get(Number(orderId), session.userId) as
    | { id: number; total_cents: number; status: string }
    | undefined;

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === "pending") {
    const pointsEarned = Math.floor(order.total_cents / 100);

    db.transaction(() => {
      db.prepare("UPDATE orders SET status = 'paid', points_earned = ? WHERE id = ?").run(
        pointsEarned,
        order.id
      );
      db.prepare("UPDATE users SET points = points + ? WHERE id = ?").run(
        pointsEarned,
        session.userId
      );
      db.prepare(
        "INSERT INTO points_history (user_id, amount, reason) VALUES (?, ?, ?)"
      ).run(session.userId, pointsEarned, `Order #${order.id} - earned points`);
    })();
  }

  const items = db.prepare(
    "SELECT name, price_cents, quantity FROM order_items WHERE order_id = ?"
  ).all(order.id) as { name: string; price_cents: number; quantity: number }[];

  const updatedOrder = db.prepare(
    "SELECT id, status, total_cents, points_earned, created_at FROM orders WHERE id = ?"
  ).get(order.id) as { id: number; status: string; total_cents: number; points_earned: number; created_at: string };

  return NextResponse.json({ ...updatedOrder, items });
}
