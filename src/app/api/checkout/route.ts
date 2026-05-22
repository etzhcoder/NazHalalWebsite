import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getMenuItem } from "@/lib/menu";

interface CartItem {
  id: string;
  quantity: number;
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { items } = (await req.json()) as { items: CartItem[] };

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const lineItems: { price_data: { currency: string; product_data: { name: string }; unit_amount: number }; quantity: number }[] = [];
  let totalCents = 0;

  for (const cartItem of items) {
    const menuItem = getMenuItem(cartItem.id);
    if (!menuItem) {
      return NextResponse.json({ error: `Item not found: ${cartItem.id}` }, { status: 400 });
    }
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: menuItem.name },
        unit_amount: menuItem.price,
      },
      quantity: cartItem.quantity,
    });
    totalCents += menuItem.price * cartItem.quantity;
  }

  const db = getDb();
  const orderResult = db.prepare(
    "INSERT INTO orders (user_id, status, total_cents) VALUES (?, 'pending', ?)"
  ).run(session.userId, totalCents);
  const orderId = orderResult.lastInsertRowid as number;

  const insertItem = db.prepare(
    "INSERT INTO order_items (order_id, menu_item_id, name, price_cents, quantity) VALUES (?, ?, ?, ?, ?)"
  );
  for (const cartItem of items) {
    const menuItem = getMenuItem(cartItem.id)!;
    insertItem.run(orderId, cartItem.id, menuItem.name, menuItem.price, cartItem.quantity);
  }

  const origin = req.headers.get("origin") || "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${origin}/order/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/order?canceled=true`,
    metadata: {
      order_id: orderId.toString(),
      user_id: session.userId.toString(),
    },
  });

  db.prepare("UPDATE orders SET stripe_session_id = ? WHERE id = ?").run(
    checkoutSession.id,
    orderId
  );

  return NextResponse.json({ url: checkoutSession.url });
}
