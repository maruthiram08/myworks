import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Store,
  Package,
  ShoppingCart,
  Tag,
  Settings,
  Users,
  BarChart3,
  LogOut
} from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: BarChart3, roles: ['MERCHANT', 'ADMIN', 'BUYER'] },
    { href: '/dashboard/store', label: 'Store', icon: Store, roles: ['MERCHANT'] },
    { href: '/dashboard/products', label: 'Products', icon: Package, roles: ['MERCHANT'] },
    { href: '/dashboard/categories', label: 'Categories', icon: Tag, roles: ['MERCHANT'] },
    { href: '/dashboard/discounts', label: 'Discounts', icon: Tag, roles: ['MERCHANT'] },
    { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart, roles: ['MERCHANT', 'BUYER'] },
    { href: '/dashboard/admin', label: 'Admin', icon: Users, roles: ['ADMIN'] },
  ];

  const filteredNavItems = navItems.filter(item =>
    item.roles.includes(session.user.role)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/dashboard" className="flex items-center">
                <span className="text-xl font-bold">E-Commerce</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {session.user.email} ({session.user.role})
              </span>
              <Link
                href="/api/auth/signout"
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
