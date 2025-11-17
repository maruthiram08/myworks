import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export const revalidate = 3600; // Cache for 1 hour

interface ProductPageProps {
  params: { domain: string; slug: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await prisma.product.findFirst({
    where: {
      slug: params.slug,
      isActive: true,
      store: {
        domain: params.domain,
        isActive: true,
      },
    },
    include: {
      store: true,
    },
  });

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: product.metaTitle || `${product.name} | ${product.store.name}`,
    description: product.metaDescription || product.description || undefined,
    keywords: product.metaKeywords,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: product.images.length > 0 ? product.images.map(img => ({ url: img })) : [],
      type: 'product',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description || undefined,
      images: product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findFirst({
    where: {
      slug: params.slug,
      isActive: true,
      store: {
        domain: params.domain,
        isActive: true,
      },
    },
    include: {
      store: true,
      category: true,
      variants: true,
    },
  });

  if (!product) {
    notFound();
  }

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: product.price.toString(),
      priceCurrency: 'USD',
      availability: product.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: product.store.name,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href={`/${params.domain}`}
              className="text-lg font-bold hover:underline"
              style={{ color: product.store.primaryColor }}
            >
              {product.store.name}
            </Link>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumbs */}
          <nav className="mb-8 text-sm text-gray-600">
            <Link href={`/${params.domain}`} className="hover:underline">
              Home
            </Link>
            {product.category && (
              <>
                <span className="mx-2">/</span>
                <Link
                  href={`/${params.domain}/category/${product.category.slug}`}
                  className="hover:underline"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <div>
              {product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {product.images.slice(1, 5).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              <div className="mb-6">
                <p className="text-3xl font-bold text-gray-900">
                  {formatPrice(Number(product.price))}
                </p>
                {product.compareAtPrice && (
                  <p className="text-xl text-gray-500 line-through">
                    {formatPrice(Number(product.compareAtPrice))}
                  </p>
                )}
              </div>

              {product.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </h2>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  {product.quantity > 0 ? (
                    <span className="text-green-600 font-semibold">
                      In Stock ({product.quantity} available)
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">Out of Stock</span>
                  )}
                </p>
              </div>

              {product.sku && (
                <p className="text-sm text-gray-500 mb-6">SKU: {product.sku}</p>
              )}

              <button
                className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors"
                style={{ backgroundColor: product.store.primaryColor }}
                disabled={product.quantity === 0}
              >
                {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
