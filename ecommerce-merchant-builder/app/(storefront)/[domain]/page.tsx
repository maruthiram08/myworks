import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export const revalidate = 3600; // Revalidate every hour

interface StorePageProps {
  params: { domain: string };
}

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const store = await prisma.store.findUnique({
    where: { domain: params.domain, isActive: true },
  });

  if (!store) {
    return {
      title: 'Store Not Found',
    };
  }

  return {
    title: `${store.name} - Online Store`,
    description: store.description || `Shop from ${store.name}`,
    openGraph: {
      title: store.name,
      description: store.description || undefined,
      images: store.logo ? [store.logo] : [],
    },
  };
}

export default async function StorefrontPage({ params }: StorePageProps) {
  const store = await prisma.store.findUnique({
    where: { domain: params.domain, isActive: true },
    include: {
      products: {
        where: { isActive: true },
        take: 12,
        orderBy: { createdAt: 'desc' },
      },
      categories: {
        include: {
          _count: {
            select: { products: true },
          },
        },
      },
    },
  });

  if (!store) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="bg-white border-b border-gray-200 shadow-sm"
        style={{ borderColor: store.primaryColor }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {store.logo && (
              <img src={store.logo} alt={store.name} className="h-12" />
            )}
            <h1 className="text-3xl font-bold" style={{ color: store.primaryColor }}>
              {store.name}
            </h1>
          </div>
          {store.description && (
            <p className="mt-2 text-gray-600">{store.description}</p>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        {store.categories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {store.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/${params.domain}/category/${category.slug}`}
                  className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-center"
                >
                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                  )}
                  <h3 className="font-semibold text-sm">{category.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {category._count.products} products
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Featured Products */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Products</h2>
          {store.products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600">No products available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {store.products.map((product) => (
                <Link
                  key={product.id}
                  href={`/${params.domain}/product/${product.slug}`}
                  className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {product.images.length > 0 && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-64 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-900 font-bold">
                      {formatPrice(Number(product.price))}
                    </p>
                    {product.compareAtPrice && (
                      <p className="text-sm text-gray-500 line-through">
                        {formatPrice(Number(product.compareAtPrice))}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS */}
      {store.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: store.customCSS }} />
      )}
    </div>
  );
}
