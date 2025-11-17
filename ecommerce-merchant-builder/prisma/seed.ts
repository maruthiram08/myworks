import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
    },
  });

  console.log('Created admin user:', admin.email);

  // Create Merchant Users
  const merchant1 = await prisma.user.upsert({
    where: { email: 'merchant1@example.com' },
    update: {},
    create: {
      email: 'merchant1@example.com',
      name: 'Tech Store Owner',
      password: await bcrypt.hash('merchant123', 10),
      role: 'MERCHANT',
    },
  });

  const merchant2 = await prisma.user.upsert({
    where: { email: 'merchant2@example.com' },
    update: {},
    create: {
      email: 'merchant2@example.com',
      name: 'Fashion Store Owner',
      password: await bcrypt.hash('merchant123', 10),
      role: 'MERCHANT',
    },
  });

  console.log('Created merchant users');

  // Create Buyer Users
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@example.com' },
    update: {},
    create: {
      email: 'buyer@example.com',
      name: 'John Buyer',
      password: await bcrypt.hash('buyer123', 10),
      role: 'BUYER',
    },
  });

  console.log('Created buyer user');

  // Create Store 1 - Tech Store
  const techStore = await prisma.store.upsert({
    where: { userId: merchant1.id },
    update: {},
    create: {
      userId: merchant1.id,
      name: 'TechHub Electronics',
      description: 'Your one-stop shop for the latest electronics and gadgets',
      domain: 'techhub',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      isActive: true,
    },
  });

  console.log('Created tech store');

  // Create Store 2 - Fashion Store
  const fashionStore = await prisma.store.upsert({
    where: { userId: merchant2.id },
    update: {},
    create: {
      userId: merchant2.id,
      name: 'StyleMart Fashion',
      description: 'Trendy fashion for everyone',
      domain: 'stylemart',
      primaryColor: '#EC4899',
      secondaryColor: '#BE185D',
      isActive: true,
    },
  });

  console.log('Created fashion store');

  // Create Categories for Tech Store
  const electronicsCategory = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets',
      storeId: techStore.id,
    },
  });

  const computersCategory = await prisma.category.create({
    data: {
      name: 'Computers',
      slug: 'computers',
      description: 'Laptops, desktops, and accessories',
      storeId: techStore.id,
      parentId: electronicsCategory.id,
    },
  });

  // Create Categories for Fashion Store
  const mensCategory = await prisma.category.create({
    data: {
      name: "Men's Fashion",
      slug: 'mens-fashion',
      description: 'Clothing and accessories for men',
      storeId: fashionStore.id,
    },
  });

  const womensCategory = await prisma.category.create({
    data: {
      name: "Women's Fashion",
      slug: 'womens-fashion',
      description: 'Clothing and accessories for women',
      storeId: fashionStore.id,
    },
  });

  console.log('Created categories');

  // Create Products for Tech Store
  const products1 = await prisma.product.createMany({
    data: [
      {
        name: 'MacBook Pro 16"',
        slug: 'macbook-pro-16',
        description: 'Powerful laptop with M3 Pro chip, 16GB RAM, 512GB SSD',
        price: 2499.99,
        compareAtPrice: 2799.99,
        costPerItem: 2000.00,
        sku: 'MBP-16-M3',
        quantity: 15,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8'],
        isActive: true,
        isFeatured: true,
        storeId: techStore.id,
        categoryId: computersCategory.id,
        metaTitle: 'MacBook Pro 16" - Best Laptop for Professionals',
        metaDescription: 'Get the latest MacBook Pro with M3 Pro chip',
        metaKeywords: ['macbook', 'laptop', 'apple', 'computer'],
      },
      {
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        description: 'Latest iPhone with A17 Pro chip and titanium design',
        price: 999.99,
        compareAtPrice: 1099.99,
        sku: 'IP15-PRO',
        quantity: 50,
        images: ['https://images.unsplash.com/photo-1592286927505-e5d9e93d3e88'],
        isActive: true,
        isFeatured: true,
        storeId: techStore.id,
        categoryId: electronicsCategory.id,
        metaTitle: 'iPhone 15 Pro - Latest Apple Smartphone',
        metaDescription: 'Experience the power of A17 Pro chip',
        metaKeywords: ['iphone', 'smartphone', 'apple'],
      },
      {
        name: 'AirPods Pro (2nd Gen)',
        slug: 'airpods-pro-2',
        description: 'Active noise cancellation, spatial audio, and transparency mode',
        price: 249.99,
        sku: 'APP-2ND',
        quantity: 100,
        images: ['https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7'],
        isActive: true,
        storeId: techStore.id,
        categoryId: electronicsCategory.id,
        metaTitle: 'AirPods Pro 2nd Gen - Premium Wireless Earbuds',
        metaDescription: 'Best wireless earbuds with active noise cancellation',
        metaKeywords: ['airpods', 'earbuds', 'apple', 'wireless'],
      },
    ],
  });

  // Create Products for Fashion Store
  const products2 = await prisma.product.createMany({
    data: [
      {
        name: 'Classic Denim Jacket',
        slug: 'classic-denim-jacket',
        description: 'Timeless denim jacket perfect for any season',
        price: 79.99,
        compareAtPrice: 99.99,
        sku: 'DJ-001',
        quantity: 30,
        images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0'],
        isActive: true,
        isFeatured: true,
        storeId: fashionStore.id,
        categoryId: mensCategory.id,
        metaTitle: 'Classic Denim Jacket - Mens Fashion',
        metaDescription: 'High-quality denim jacket for men',
        metaKeywords: ['denim', 'jacket', 'mens', 'fashion'],
      },
      {
        name: 'Summer Floral Dress',
        slug: 'summer-floral-dress',
        description: 'Beautiful floral pattern dress perfect for summer',
        price: 59.99,
        sku: 'SFD-001',
        quantity: 45,
        images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8'],
        isActive: true,
        isFeatured: true,
        storeId: fashionStore.id,
        categoryId: womensCategory.id,
        metaTitle: 'Summer Floral Dress - Womens Fashion',
        metaDescription: 'Elegant floral dress for summer occasions',
        metaKeywords: ['dress', 'floral', 'summer', 'womens'],
      },
      {
        name: 'Leather Crossbody Bag',
        slug: 'leather-crossbody-bag',
        description: 'Genuine leather crossbody bag with multiple compartments',
        price: 129.99,
        compareAtPrice: 159.99,
        sku: 'LCB-001',
        quantity: 20,
        images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa'],
        isActive: true,
        storeId: fashionStore.id,
        categoryId: womensCategory.id,
        metaTitle: 'Leather Crossbody Bag - Premium Quality',
        metaDescription: 'Stylish and functional leather bag',
        metaKeywords: ['bag', 'leather', 'crossbody', 'fashion'],
      },
    ],
  });

  console.log('Created products');

  // Create Discounts
  const discount1 = await prisma.discount.create({
    data: {
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10,
      minPurchase: 50,
      maxUses: 100,
      isActive: true,
      storeId: techStore.id,
    },
  });

  const discount2 = await prisma.discount.create({
    data: {
      code: 'SUMMER20',
      type: 'PERCENTAGE',
      value: 20,
      minPurchase: 100,
      isActive: true,
      storeId: fashionStore.id,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
    },
  });

  console.log('Created discounts');

  // Create a sample order
  const order = await prisma.order.create({
    data: {
      orderNumber: 'ORD-TEST-001',
      userId: buyer.id,
      storeId: techStore.id,
      status: 'PAID',
      subtotal: 1249.98,
      discount: 0,
      tax: 0,
      shipping: 0,
      total: 1249.98,
      customerName: 'John Buyer',
      customerEmail: 'buyer@example.com',
      customerPhone: '+1234567890',
      items: {
        create: [
          {
            productId: (await prisma.product.findFirst({ where: { slug: 'iphone-15-pro' } }))!.id,
            name: 'iPhone 15 Pro',
            price: 999.99,
            quantity: 1,
            total: 999.99,
          },
          {
            productId: (await prisma.product.findFirst({ where: { slug: 'airpods-pro-2' } }))!.id,
            name: 'AirPods Pro (2nd Gen)',
            price: 249.99,
            quantity: 1,
            total: 249.99,
          },
        ],
      },
    },
  });

  console.log('Created sample order');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
