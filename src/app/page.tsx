import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 mt-24 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Earn Rewards with Every Bite
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          Join Naz Halal Rewards and earn points on every purchase. Redeem them for free fries,
          drinks, burgers, and more.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/order"
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors shadow-md"
          >
            Order Now
          </Link>
          <Link
            href="/register"
            className="bg-white text-gray-700 px-6 py-3 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Join Rewards — It&apos;s Free
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-16">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl mb-3">🍟</div>
            <h3 className="font-semibold text-gray-900">Earn Points</h3>
            <p className="text-sm text-gray-500 mt-1">Get points with every purchase you make</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl mb-3">🎁</div>
            <h3 className="font-semibold text-gray-900">Redeem Rewards</h3>
            <p className="text-sm text-gray-500 mt-1">Trade points for free menu items</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl mb-3">⭐</div>
            <h3 className="font-semibold text-gray-900">100 Bonus</h3>
            <p className="text-sm text-gray-500 mt-1">Get 100 points just for signing up</p>
          </div>
        </div>
      </div>
    </div>
  );
}
