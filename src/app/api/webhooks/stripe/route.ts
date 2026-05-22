import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getDb } from "@/lib/db";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
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
      const order = db.prepare("SELECT id, total_cents, status FROM orders WHERE id = ?").get(
        Number(orderId)
      ) as { id: number; total_cents: number; status: string } | undefined;

      if (order && order.status === "pending") {
        const pointsEarned = Math.floor(order.total_cents / 100);

        db.transaction(() => {
          db.prepare("UPDATE orders SET status = 'paid', points_earned = ? WHERE id = ?").run(
            pointsEarned,
            order.id
          );
          db.prepare("UPDATE users SET points = points + ? WHERE id = ?").run(
            pointsEarned,
            Number(userId)
          );
          db.prepare(
            "INSERT INTO points_history (user_id, amount, reason) VALUES (?, ?, ?)"
          ).run(Number(userId), pointsEarned, `Order #${order.id} - earned points`);
        })();
      }
    }
  }

  return NextResponse.json({ received: true });
}
