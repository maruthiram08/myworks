"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowUp,
  ExternalLink,
  MessageCircle,
  Calendar,
  User,
  Send,
  Flag,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ProductDetail({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    fetchProduct();
    checkVoteStatus();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      const data = await response.json();
      setProduct(data);
      setVoteCount(data._count.votes);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkVoteStatus = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}/vote`);
      const data = await response.json();
      setVoted(data.voted);
    } catch (error) {
      console.error("Error checking vote:", error);
    }
  };

  const handleVote = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    try {
      const response = await fetch(`/api/products/${params.id}/vote`, {
        method: "POST",
      });
      const data = await response.json();
      setVoted(data.voted);
      setVoteCount(data.voteCount);
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleComment = async (parentId?: string) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (!comment.trim()) return;

    setCommenting(true);

    try {
      const response = await fetch(`/api/products/${params.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: comment,
          parentId,
        }),
      });

      if (response.ok) {
        setComment("");
        setReplyTo(null);
        fetchProduct();
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setCommenting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Product not found
          </h1>
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 hover:underline"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Product Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Vote Section */}
            <div className="flex md:flex-col items-center md:items-start gap-2">
              <button
                onClick={handleVote}
                className={`flex flex-col items-center justify-center px-6 py-3 rounded-lg border-2 transition ${
                  voted
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-300 hover:border-blue-600"
                }`}
              >
                <ArrowUp className="w-6 h-6" />
                <span className="font-bold text-lg mt-1">{voteCount}</span>
              </button>
            </div>

            {/* Product Info */}
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                {product.logo && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={product.logo}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h1>
                  <p className="text-xl text-gray-600 mb-3">
                    {product.tagline}
                  </p>

                  {product.website && (
                    <a
                      href={product.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      Visit Website
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.tags.map((tag: any) => (
                    <span
                      key={tag.id}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>by {product.maker.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(new Date(product.createdAt))}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{product._count.comments} comments</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            About {product.name}
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {product.description}
          </p>
        </div>

        {/* Gallery */}
        {product.images && product.images.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.images.map((image: string, index: number) => (
                <div
                  key={index}
                  className="relative h-64 rounded-lg overflow-hidden bg-gray-100"
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Comments ({product._count.comments})
          </h2>

          {/* Comment form */}
          {session ? (
            <div className="mb-6">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2 mt-2">
                {replyTo && (
                  <button
                    onClick={() => {
                      setReplyTo(null);
                      setComment("");
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => handleComment(replyTo || undefined)}
                  disabled={commenting || !comment.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {commenting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600">
                <a
                  href="/auth/signin"
                  className="text-blue-600 hover:underline"
                >
                  Sign in
                </a>{" "}
                to leave a comment
              </p>
            </div>
          )}

          {/* Comments list */}
          <div className="space-y-6">
            {product.comments.map((comment: any) => (
              <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{comment.user.name}</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(new Date(comment.createdAt))}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>

                    {session && (
                      <button
                        onClick={() => {
                          setReplyTo(comment.id);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-sm text-blue-600 hover:underline mt-2"
                      >
                        Reply
                      </button>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 space-y-4">
                        {comment.replies.map((reply: any) => (
                          <div
                            key={reply.id}
                            className="flex items-start gap-3"
                          >
                            <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">
                                  {reply.user.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(new Date(reply.createdAt))}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
