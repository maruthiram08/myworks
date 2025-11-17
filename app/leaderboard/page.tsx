"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Calendar, Trophy } from "lucide-react";
import { format } from "date-fns";

export default function Leaderboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedDate]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leaderboard?date=${selectedDate}`);
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-900">
              Daily Leaderboard
            </h1>
          </div>
          <p className="text-gray-600">
            Top products of the day ranked by votes
          </p>
        </div>

        {/* Date selector */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-md border border-gray-200">
            <Calendar className="w-5 h-5 text-gray-600" />
            <input
              type="date"
              value={selectedDate}
              max={format(new Date(), "yyyy-MM-dd")}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-none outline-none text-gray-900 font-medium"
            />
          </div>
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">No products launched on this date</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={product.id} className="relative">
                <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0
                        ? "bg-yellow-500"
                        : index === 1
                        ? "bg-gray-400"
                        : index === 2
                        ? "bg-amber-600"
                        : "bg-gray-300"
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>
                <div className="pl-8">
                  <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
