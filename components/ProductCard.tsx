"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUp, MessageCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    tagline: string;
    logo?: string | null;
    createdAt: Date | string;
    maker: {
      id: string;
      name: string | null;
      image?: string | null;
    };
    tags?: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
    _count: {
      votes: number;
      comments: number;
    };
  };
  initialVoted?: boolean;
}

export function ProductCard({ product, initialVoted = false }: ProductCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [voted, setVoted] = useState(initialVoted);
  const [voteCount, setVoteCount] = useState(product._count.votes);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (isVoting) return;

    setIsVoting(true);

    try {
      const response = await fetch(`/api/products/${product.id}/vote`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setVoted(data.voted);
        setVoteCount(data.voteCount);
      }
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex gap-4">
          {/* Vote button */}
          <button
            onClick={handleVote}
            disabled={isVoting}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg border-2 transition-colors ${
              voted
                ? "border-blue-600 bg-blue-50 text-blue-600"
                : "border-gray-300 hover:border-blue-600 text-gray-600"
            }`}
          >
            <ArrowUp className="w-5 h-5" />
            <span className="text-sm font-semibold mt-1">{voteCount}</span>
          </button>

          {/* Product info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              {product.logo && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  <Image
                    src={product.logo}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {product.tagline}
                </p>

                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{product._count.comments}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>by {product.maker.name}</span>
                  </div>

                  <span>
                    {formatDate(
                      typeof product.createdAt === "string"
                        ? new Date(product.createdAt)
                        : product.createdAt
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
