import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });
  console.log("Created admin user:", admin.email);

  // Create maker user
  const makerPassword = await bcrypt.hash("maker123", 10);
  const maker = await prisma.user.upsert({
    where: { email: "maker@example.com" },
    update: {},
    create: {
      email: "maker@example.com",
      password: makerPassword,
      name: "John Maker",
      role: "MAKER",
      bio: "Building amazing products",
      website: "https://example.com",
      twitter: "@johnmaker",
    },
  });
  console.log("Created maker user:", maker.email);

  // Create regular user
  const userPassword = await bcrypt.hash("user123", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      password: userPassword,
      name: "Jane User",
      role: "USER",
    },
  });
  console.log("Created regular user:", user.email);

  // Create categories
  const categories = [
    {
      name: "Productivity",
      slug: "productivity",
      description: "Tools to boost your productivity",
      icon: "⚡",
    },
    {
      name: "AI & Machine Learning",
      slug: "ai-machine-learning",
      description: "Artificial intelligence and ML products",
      icon: "🤖",
    },
    {
      name: "Design Tools",
      slug: "design-tools",
      description: "Tools for designers and creatives",
      icon: "🎨",
    },
    {
      name: "Developer Tools",
      slug: "developer-tools",
      description: "Tools for developers",
      icon: "💻",
    },
    {
      name: "Marketing",
      slug: "marketing",
      description: "Marketing and growth tools",
      icon: "📈",
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("Created categories");

  // Create tags
  const tags = [
    { name: "SaaS", slug: "saas" },
    { name: "Open Source", slug: "open-source" },
    { name: "Mobile App", slug: "mobile-app" },
    { name: "Web App", slug: "web-app" },
    { name: "Chrome Extension", slug: "chrome-extension" },
    { name: "Analytics", slug: "analytics" },
    { name: "Automation", slug: "automation" },
    { name: "No-Code", slug: "no-code" },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }
  console.log("Created tags");

  // Get the productivity category
  const productivityCategory = await prisma.category.findUnique({
    where: { slug: "productivity" },
  });

  // Create a sample product
  const saasTag = await prisma.tag.findUnique({ where: { slug: "saas" } });
  const webAppTag = await prisma.tag.findUnique({ where: { slug: "web-app" } });

  if (productivityCategory && saasTag && webAppTag) {
    const product = await prisma.product.create({
      data: {
        name: "TaskMaster Pro",
        tagline: "The ultimate task management tool for teams",
        description:
          "TaskMaster Pro is a comprehensive task management solution that helps teams collaborate effectively. With features like real-time updates, customizable workflows, and powerful integrations, it's the perfect tool for modern teams.\n\nKey features:\n- Real-time collaboration\n- Custom workflows\n- Time tracking\n- Reports and analytics\n- Mobile apps",
        website: "https://taskmasterpro.example.com",
        makerId: maker.id,
        categoryId: productivityCategory.id,
        tags: {
          connect: [{ id: saasTag.id }, { id: webAppTag.id }],
        },
        isPublished: true,
      },
    });
    console.log("Created sample product:", product.name);

    // Create some votes
    await prisma.vote.create({
      data: {
        userId: user.id,
        productId: product.id,
      },
    });

    await prisma.vote.create({
      data: {
        userId: admin.id,
        productId: product.id,
      },
    });

    // Create a comment
    await prisma.comment.create({
      data: {
        content: "This looks amazing! Can't wait to try it out.",
        userId: user.id,
        productId: product.id,
      },
    });

    console.log("Created votes and comments");
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
