"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import type { MenuCategory, MenuItem } from "@/lib/menu";

interface CartEntry {
  item: MenuItem;
  quantity: number;
}

const MENU: MenuCategory[] = [
  {
    name: "Platters",
    items: [
      { id: "chicken-over-rice", name: "Chicken Over Rice", description: "Grilled halal chicken served over seasoned yellow rice with white and hot sauce", price: 999, category: "Platters" },
      { id: "lamb-over-rice", name: "Lamb Over Rice", description: "Tender halal lamb gyro meat served over seasoned yellow rice with white and hot sauce", price: 1099, category: "Platters" },
      { id: "combo-over-rice", name: "Combo Over Rice", description: "Both chicken and lamb served over seasoned yellow rice with white and hot sauce", price: 1199, category: "Platters" },
      { id: "falafel-over-rice", name: "Falafel Over Rice", description: "Crispy falafel served over seasoned yellow rice with tahini and hot sauce", price: 899, category: "Platters" },
      { id: "kofta-over-rice", name: "Kofta Over Rice", description: "Seasoned ground beef kofta served over yellow rice with white and hot sauce", price: 1099, category: "Platters" },
    ],
  },
  {
    name: "Gyros & Wraps",
    items: [
      { id: "chicken-gyro", name: "Chicken Gyro", description: "Grilled chicken wrapped in warm pita with lettuce, tomato, and white sauce", price: 799, category: "Gyros & Wraps" },
      { id: "lamb-gyro", name: "Lamb Gyro", description: "Lamb gyro meat wrapped in warm pita with lettuce, tomato, and white sauce", price: 899, category: "Gyros & Wraps" },
      { id: "combo-gyro", name: "Combo Gyro", description: "Chicken and lamb wrapped in warm pita with lettuce, tomato, and white sauce", price: 999, category: "Gyros & Wraps" },
      { id: "falafel-wrap", name: "Falafel Wrap", description: "Crispy falafel wrapped in warm pita with lettuce, tomato, and tahini sauce", price: 749, category: "Gyros & Wraps" },
      { id: "kofta-wrap", name: "Kofta Wrap", description: "Seasoned ground beef kofta wrapped in warm pita with veggies and white sauce", price: 899, category: "Gyros & Wraps" },
      { id: "philly-cheesesteak", name: "Philly Cheesesteak", description: "Shaved beef with melted cheese, onions, and peppers in a hoagie roll", price: 999, category: "Gyros & Wraps" },
    ],
  },
  {
    name: "Burgers",
    items: [
      { id: "halal-burger", name: "Halal Burger", description: "Juicy halal beef patty with lettuce, tomato, and special sauce", price: 799, category: "Burgers" },
      { id: "cheese-burger", name: "Cheeseburger", description: "Halal beef patty topped with melted American cheese, lettuce, and tomato", price: 899, category: "Burgers" },
      { id: "double-burger", name: "Double Cheeseburger", description: "Two halal beef patties with double cheese, lettuce, tomato, and special sauce", price: 1099, category: "Burgers" },
    ],
  },
  {
    name: "Sides",
    items: [
      { id: "french-fries", name: "French Fries", description: "Crispy golden french fries", price: 399, category: "Sides" },
      { id: "cheese-fries", name: "Cheese Fries", description: "French fries topped with melted cheese sauce", price: 549, category: "Sides" },
      { id: "chicken-nuggets", name: "Chicken Nuggets", description: "Crispy halal chicken nuggets (8 pieces)", price: 599, category: "Sides" },
      { id: "hummus", name: "Hummus", description: "Creamy hummus served with warm pita bread", price: 499, category: "Sides" },
      { id: "tabbouleh", name: "Tabbouleh", description: "Fresh parsley salad with bulgur wheat, tomato, and lemon dressing", price: 499, category: "Sides" },
      { id: "garden-salad", name: "Garden Salad", description: "Fresh mixed greens with tomato, cucumber, and your choice of dressing", price: 549, category: "Sides" },
    ],
  },
  {
    name: "Drinks",
    items: [
      { id: "soda-can", name: "Soda (Can)", description: "Coca-Cola, Sprite, or Fanta", price: 199, category: "Drinks" },
      { id: "bottled-water", name: "Bottled Water", description: "16.9 oz bottled water", price: 149, category: "Drinks" },
      { id: "mango-lassi", name: "Mango Lassi", description: "Sweet and creamy mango yogurt drink", price: 399, category: "Drinks" },
      { id: "sweet-tea", name: "Sweet Tea", description: "Freshly brewed sweet iced tea", price: 249, category: "Drinks" },
    ],
  },
];

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function OrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userName, setUserName] = useState<string | undefined>();
  const [cart, setCart] = useState<Map<string, CartEntry>>(new Map());
  const [activeCategory, setActiveCategory] = useState(MENU[0].name);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => {
        if (u) setUserName(u.name);
      });
  }, []);

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(item.id);
      if (existing) {
        next.set(item.id, { ...existing, quantity: existing.quantity + 1 });
      } else {
        next.set(item.id, { item, quantity: 1 });
      }
      return next;
    });
  }

  function updateQuantity(id: string, delta: number) {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(id);
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        next.delete(id);
      } else {
        next.set(id, { ...existing, quantity: newQty });
      }
      return next;
    });
  }

  const cartItems = Array.from(cart.values());
  const cartTotal = cartItems.reduce((sum, e) => sum + e.item.price * e.quantity, 0);
  const cartCount = cartItems.reduce((sum, e) => sum + e.quantity, 0);
  const pointsToEarn = Math.floor(cartTotal / 100);

  async function handleCheckout() {
    if (cartItems.length === 0) return;

    if (!userName) {
      router.push("/login");
      return;
    }

    setCheckingOut(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartItems.map((e) => ({ id: e.item.id, quantity: e.quantity })),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Checkout failed");
      setCheckingOut(false);
      return;
    }

    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={userName} />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {canceled && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl mb-4 text-sm">
            Payment was canceled. Your cart is still here — try again when ready.
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Food</h1>
            <p className="text-gray-500 text-sm mt-1">
              Earn 1 point for every $1 spent
            </p>
          </div>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors shadow-md lg:hidden"
          >
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {MENU.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.name
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Menu items */}
          <div className="flex-1 space-y-3">
            {MENU.filter((c) => c.name === activeCategory).map((category) =>
              category.items.map((item) => {
                const inCart = cart.get(item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        {inCart && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                            x{inCart.quantity}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      <p className="text-sm font-semibold text-red-600 mt-2">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="shrink-0 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Cart sidebar (desktop) */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-4 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="bg-red-600 text-white px-4 py-3">
                <h2 className="font-semibold">Your Cart ({cartCount})</h2>
              </div>
              {cartItems.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">
                  Your cart is empty. Add items from the menu!
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                    {cartItems.map((entry) => (
                      <div key={entry.item.id} className="px-4 py-3">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-gray-900">{entry.item.name}</p>
                          <p className="text-sm font-semibold text-gray-700">
                            {formatPrice(entry.item.price * entry.quantity)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(entry.item.id, -1)}
                            className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center text-sm font-bold"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium w-6 text-center text-gray-900">
                            {entry.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(entry.item.id, 1)}
                            className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center text-sm font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-semibold text-gray-900">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Points you&apos;ll earn</span>
                      <span className="font-semibold text-green-600">+{pointsToEarn} pts</span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      disabled={checkingOut || cartItems.length === 0}
                      className="w-full mt-2 bg-red-600 text-white py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {checkingOut ? "Redirecting to payment..." : `Checkout ${formatPrice(cartTotal)}`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile cart drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-red-600 text-white px-4 py-3 flex items-center justify-between rounded-t-2xl">
              <h2 className="font-semibold">Your Cart ({cartCount})</h2>
              <button onClick={() => setShowCart(false)} className="text-white/80 hover:text-white text-xl">
                ✕
              </button>
            </div>
            {cartItems.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                Your cart is empty.
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-50">
                  {cartItems.map((entry) => (
                    <div key={entry.item.id} className="px-4 py-3">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-gray-900">{entry.item.name}</p>
                        <p className="text-sm font-semibold text-gray-700">
                          {formatPrice(entry.item.price * entry.quantity)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(entry.item.id, -1)}
                          className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center text-sm font-bold"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium w-6 text-center text-gray-900">
                          {entry.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(entry.item.id, 1)}
                          className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 px-4 py-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-semibold text-gray-900">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Points you&apos;ll earn</span>
                    <span className="font-semibold text-green-600">+{pointsToEarn} pts</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={checkingOut}
                    className="w-full mt-2 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {checkingOut ? "Redirecting to payment..." : `Checkout ${formatPrice(cartTotal)}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating cart button on mobile when items in cart */}
      {cartCount > 0 && !showCart && (
        <div className="fixed bottom-4 left-4 right-4 lg:hidden">
          <button
            onClick={() => setShowCart(true)}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-medium shadow-lg flex items-center justify-between px-5"
          >
            <span>View Cart ({cartCount})</span>
            <span className="font-semibold">{formatPrice(cartTotal)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
