"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Flag,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle,
  XCircle,
  Star,
} from "lucide-react";

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "reports">("products");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (session?.user && session.user.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (activeTab === "products") {
      fetchProducts();
    } else {
      fetchReports();
    }
  }, [activeTab, statusFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/products?status=${statusFilter}`);
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const resolved = statusFilter === "resolved" ? "true" : statusFilter === "unresolved" ? "false" : undefined;
      const url = resolved ? `/api/admin/reports?resolved=${resolved}` : "/api/admin/reports";
      const response = await fetch(url);
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const moderateProduct = async (
    productId: string,
    action: "publish" | "unpublish" | "spam" | "feature"
  ) => {
    try {
      const updates: any = {};
      if (action === "publish") {
        updates.isPublished = true;
        updates.isSpam = false;
      } else if (action === "unpublish") {
        updates.isPublished = false;
      } else if (action === "spam") {
        updates.isSpam = true;
        updates.isPublished = false;
      } else if (action === "feature") {
        const product = products.find((p) => p.id === productId);
        updates.isFeatured = !product?.isFeatured;
      }

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Error moderating product:", error);
    }
  };

  const resolveReport = async (reportId: string, resolved: boolean) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resolved }),
      });

      if (response.ok) {
        fetchReports();
      }
    } catch (error) {
      console.error("Error resolving report:", error);
    }
  };

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === "products"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === "reports"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Reports
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            {activeTab === "products" ? (
              <>
                <option value="all">All Products</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
                <option value="spam">Spam</option>
              </>
            ) : (
              <>
                <option value="all">All Reports</option>
                <option value="unresolved">Unresolved</option>
                <option value="resolved">Resolved</option>
              </>
            )}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : activeTab === "products" ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.tagline}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.maker.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product._count.votes} votes • {product._count.comments}{" "}
                      comments
                      {product._count.reports > 0 && (
                        <span className="text-red-600 ml-2">
                          • {product._count.reports} reports
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {product.isPublished && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Published
                          </span>
                        )}
                        {product.isSpam && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Spam
                          </span>
                        )}
                        {product.isFeatured && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {product.isPublished ? (
                          <button
                            onClick={() =>
                              moderateProduct(product.id, "unpublish")
                            }
                            className="text-gray-600 hover:text-gray-900"
                            title="Unpublish"
                          >
                            <EyeOff className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              moderateProduct(product.id, "publish")
                            }
                            className="text-green-600 hover:text-green-900"
                            title="Publish"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => moderateProduct(product.id, "spam")}
                          className="text-red-600 hover:text-red-900"
                          title="Mark as Spam"
                        >
                          <Flag className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => moderateProduct(product.id, "feature")}
                          className={`${
                            product.isFeatured
                              ? "text-yellow-600"
                              : "text-gray-400"
                          } hover:text-yellow-700`}
                          title="Toggle Featured"
                        >
                          <Star className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {report.product.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Reported by {report.user.name} ({report.user.email})
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!report.resolved ? (
                      <button
                        onClick={() => resolveReport(report.id, true)}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Resolve
                      </button>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg">
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Reason:</strong> {report.reason}
                  </p>
                  {report.details && (
                    <p className="text-sm">
                      <strong>Details:</strong> {report.details}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Reported on {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
