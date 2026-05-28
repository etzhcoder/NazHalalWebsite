import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getDb, migrate } from "@/lib/db";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    const userId = session.metadata?.user_id;

    if (orderId && userId) {
      const db = getDb();
      await migrate();

      const orderResult = await db.execute({
        sql: "SELECT id, total_cents, status FROM orders WHERE id = ?",
        args: [Number(orderId)],
      });

      const order = orderResult.rows[0];

      if (order && String(order.status) === "pending") {
        const pointsEarned = Math.floor(Number(order.total_cents) / 100);

        await db.execute({
          sql: "UPDATE orders SET status = 'paid', points_earned = ? WHERE id = ?",
          args: [pointsEarned, order.id],
        });
        await db.execute({
          sql: "UPDATE users SET points = points + ? WHERE id = ?",
          args: [pointsEarned, Number(userId)],
        });
        await db.execute({
          sql: "INSERT INTO points_history (user_id, amount, reason) VALUES (?, ?, ?)",
          args: [Number(userId), pointsEarned, `Order #${order.id} - earned points`],
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
