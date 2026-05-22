"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface OrderItem {
  name: string;
  price_cents: number;
  quantity: number;
}

interface Order {
  id: number;
  status: string;
  total_cents: number;
  points_earned: number;
  created_at: string;
  items: OrderItem[];
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center mt-32">
            <div className="text-gray-400 text-lg">Confirming your order...</div>
          </div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState<string | undefined>();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => {
        if (u) setUserName(u.name);
      });
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found");
      setLoading(false);
      return;
    }

    fetch("/api/orders/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to confirm order");
        return r.json();
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load order details");
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar userName={userName} />
        <div className="flex items-center justify-center mt-32">
          <div className="text-gray-400 text-lg">Confirming your order...</div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar userName={userName} />
        <div className="max-w-md mx-auto mt-16 px-4 text-center">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-4xl mb-4">:(</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <Link
              href="/order"
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Back to Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={userName} />
      <div className="max-w-lg mx-auto mt-12 px-4">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="bg-green-600 text-white px-6 py-8 text-center">
            <div className="text-5xl mb-3">&#10003;</div>
            <h1 className="text-2xl font-bold">Order Confirmed!</h1>
            <p className="text-green-100 text-sm mt-1">Order #{order.id}</p>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Order Summary
              </h2>
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {formatPrice(item.price_cents * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-semibold">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{formatPrice(order.total_cents)}</span>
              </div>
            </div>

            {order.points_earned > 0 && (
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-green-700 font-semibold text-lg">
                  +{order.points_earned} points earned!
                </p>
                <p className="text-green-600 text-xs mt-1">
                  Points have been added to your rewards balance
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Link
                href="/order"
                className="flex-1 text-center bg-red-600 text-white py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                Order Again
              </Link>
              <Link
                href="/dashboard"
                className="flex-1 text-center bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
