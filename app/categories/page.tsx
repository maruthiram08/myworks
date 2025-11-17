"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Categories
          </h1>
          <p className="text-gray-600">Browse products by category</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/?category=${category.slug}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-3">{category.icon || "📦"}</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-gray-600 text-sm mb-3">
                    {category.description}
                  </p>
                )}
                <p className="text-sm text-blue-600">
                  {category._count.products} products
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
