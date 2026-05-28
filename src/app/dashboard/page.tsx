"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface User {
  id: number;
  name: string;
  email: string;
  points: number;
  created_at: string;
}

interface PointsEntry {
  id: number;
  amount: number;
  reason: string;
  created_at: string;
}

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

const REWARD_TIERS = [
  { name: "Free Fries", cost: 150 },
  { name: "Free Drink", cost: 250 },
  { name: "Free Burger", cost: 500 },
  { name: "Free Combo Meal", cost: 800 },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<PointsEntry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [userRes, historyRes, ordersRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/points"),
          fetch("/api/orders"),
        ]);

        if (!userRes.ok) {
          router.push("/login");
          return;
        }

        setUser(await userRes.json());
        if (historyRes.ok) setHistory(await historyRes.json());
        if (ordersRes.ok) setOrders(await ordersRes.json());
      } catch {
        router.push("/login");
        return;
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function redeemReward(name: string, cost: number) {
    const res = await fetch("/api/points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: -cost, reason: `Redeemed: ${name}` }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.error || "Failed to redeem");
      return;
    }

    const data = await res.json();
    setUser((prev) => (prev ? { ...prev, points: data.points } : prev));

    const historyRes = await fetch("/api/points");
    setHistory(await historyRes.json());
  }

  async function simulateEarnPoints() {
    const purchases = [
      { amount: 25, reason: "Burger Combo purchase" },
      { amount: 15, reason: "Fries & Drink purchase" },
      { amount: 40, reason: "Family Meal purchase" },
      { amount: 10, reason: "Snack Wrap purchase" },
    ];
    const purchase = purchases[Math.floor(Math.random() * purchases.length)];

    const res = await fetch("/api/points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(purchase),
    });

    if (res.ok) {
      const data = await res.json();
      setUser((prev) => (prev ? { ...prev, points: data.points } : prev));

      const historyRes = await fetch("/api/points");
      setHistory(await historyRes.json());
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center mt-32">
          <div className="text-gray-400 text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const nextReward = REWARD_TIERS.find((r) => r.cost > user.points);
  const progress = nextReward
    ? Math.min((user.points / nextReward.cost) * 100, 100)
    : 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={user.name} />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Points Card */}
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-80 uppercase tracking-wide">Your Points</p>
          <p className="text-5xl font-bold mt-1">{user.points.toLocaleString()}</p>
          {nextReward && (
            <div className="mt-4">
              <div className="flex justify-between text-sm opacity-80 mb-1">
                <span>Next: {nextReward.name}</span>
                <span>{nextReward.cost - user.points} pts to go</span>
              </div>
              <div className="w-full bg-red-800 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {!nextReward && (
            <p className="mt-3 text-sm opacity-80">You can redeem any reward!</p>
          )}
        </div>

        {/* Order Food + Simulate */}
        <div className="flex gap-3">
          <Link
            href="/order"
            className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors shadow-md text-center"
          >
            Order Food
          </Link>
          <button
            onClick={simulateEarnPoints}
            className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors shadow-md"
          >
            Simulate Purchase
          </button>
        </div>

        {/* Rewards to Redeem */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Redeem Rewards</h2>
          <div className="grid grid-cols-2 gap-3">
            {REWARD_TIERS.map((reward) => (
              <button
                key={reward.name}
                onClick={() => redeemReward(reward.name, reward.cost)}
                disabled={user.points < reward.cost}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <p className="font-medium text-gray-900">{reward.name}</p>
                <p className="text-sm text-red-600 font-semibold mt-1">{reward.cost} pts</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        {orders.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Orders</h2>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        Order #{order.id}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          order.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      ${(order.total_cents / 100).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {order.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                  </p>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(order.created_at + "Z").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    {order.points_earned > 0 && (
                      <span className="text-xs text-green-600 font-medium">
                        +{order.points_earned} pts
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Points History */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Points History</h2>
          {history.length === 0 ? (
            <p className="text-gray-400 text-sm">No activity yet.</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
              {history.map((entry) => (
                <div key={entry.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{entry.reason}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(entry.created_at + "Z").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      entry.amount > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {entry.amount > 0 ? "+" : ""}
                    {entry.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
