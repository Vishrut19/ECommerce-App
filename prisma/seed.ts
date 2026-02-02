import { PrismaClient, UnitType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding AgroOrder database...');

  // Clear existing data in correct order (respecting foreign keys)
  console.log('🗑️ Clearing existing data...');
  await prisma.$executeRaw`TRUNCATE TABLE order_items, orders, products, categories, settings, users CASCADE`;

  // Create default settings
  console.log('⚙️ Creating settings...');
  await prisma.settings.create({
    data: {
      id: 'default',
      companyName: 'AgroOrder',
      companyEmail: 'orders@agroorder.com',
      companyPhone: '+91 98765 43210',
      whatsappNumber: '+91 98765 43210',
      companyAddress: 'Agricultural Market Yard, Mumbai, India',
      orderNotificationEmail: 'admin@agroorder.com',
      currency: 'INR',
      currencySymbol: '₹',
    },
  });

  // Create categories
  console.log('📁 Creating categories...');
  const grainsPulses = await prisma.category.create({
    data: {
      name: 'grains-pulses',
      displayName: 'Grains & Pulses',
      icon: '🌾',
      description: 'Quality grains and pulses for wholesale',
      sortOrder: 1,
    },
  });

  const vegetables = await prisma.category.create({
    data: {
      name: 'vegetables',
      displayName: 'Vegetables',
      icon: '🥔',
      description: 'Fresh farm vegetables',
      sortOrder: 2,
    },
  });

  const fruits = await prisma.category.create({
    data: {
      name: 'fruits',
      displayName: 'Fruits',
      icon: '🍎',
      description: 'Seasonal fresh fruits',
      sortOrder: 3,
    },
  });

  const spices = await prisma.category.create({
    data: {
      name: 'spices',
      displayName: 'Spices',
      icon: '🌶',
      description: 'Premium quality spices',
      sortOrder: 4,
    },
  });

  const dairy = await prisma.category.create({
    data: {
      name: 'dairy',
      displayName: 'Dairy',
      icon: '🧀',
      description: 'Fresh dairy products',
      sortOrder: 5,
    },
  });

  const organic = await prisma.category.create({
    data: {
      name: 'organic',
      displayName: 'Organic Produce',
      icon: '🌱',
      description: 'Certified organic products',
      isOrganic: true,
      sortOrder: 6,
    },
  });

  // Create products
  console.log('📦 Creating products...');
  const productsData = [
    // Grains & Pulses
    { name: 'Rice', slug: 'rice', categoryId: grainsPulses.id, pricePerUnit: 45, unitType: UnitType.KG, minOrderQty: 50, stockQty: 5000, supplierName: 'Punjab Grains Co.', isFeatured: true },
    { name: 'Wheat', slug: 'wheat', categoryId: grainsPulses.id, pricePerUnit: 35, unitType: UnitType.KG, minOrderQty: 100, stockQty: 8000, supplierName: 'MP Agro Traders' },
    { name: 'Maize', slug: 'maize', categoryId: grainsPulses.id, pricePerUnit: 28, unitType: UnitType.KG, minOrderQty: 50, stockQty: 3000, supplierName: 'Karnataka Crops' },
    { name: 'Barley', slug: 'barley', categoryId: grainsPulses.id, pricePerUnit: 42, unitType: UnitType.KG, minOrderQty: 25, stockQty: 2000, supplierName: 'Rajasthan Grains' },
    { name: 'Lentils', slug: 'lentils', categoryId: grainsPulses.id, pricePerUnit: 95, unitType: UnitType.KG, minOrderQty: 20, stockQty: 1500, supplierName: 'MP Agro Traders' },
    { name: 'Chickpeas', slug: 'chickpeas', categoryId: grainsPulses.id, pricePerUnit: 85, unitType: UnitType.KG, minOrderQty: 25, stockQty: 2500, supplierName: 'Rajasthan Grains' },

    // Vegetables
    { name: 'Potato', slug: 'potato', categoryId: vegetables.id, pricePerUnit: 22, unitType: UnitType.KG, minOrderQty: 100, stockQty: 10000, supplierName: 'UP Vegetable Farms', isFeatured: true },
    { name: 'Onion', slug: 'onion', categoryId: vegetables.id, pricePerUnit: 35, unitType: UnitType.KG, minOrderQty: 50, stockQty: 8000, supplierName: 'Maharashtra Onion Traders' },
    { name: 'Tomato', slug: 'tomato', categoryId: vegetables.id, pricePerUnit: 40, unitType: UnitType.KG, minOrderQty: 25, stockQty: 3000, supplierName: 'Karnataka Vegetables' },
    { name: 'Cabbage', slug: 'cabbage', categoryId: vegetables.id, pricePerUnit: 18, unitType: UnitType.KG, minOrderQty: 50, stockQty: 2000, supplierName: 'Himachal Farms' },
    { name: 'Carrot', slug: 'carrot', categoryId: vegetables.id, pricePerUnit: 45, unitType: UnitType.KG, minOrderQty: 25, stockQty: 1500, supplierName: 'Delhi NCR Vegetables' },
    { name: 'Green Chili', slug: 'green-chili', categoryId: vegetables.id, pricePerUnit: 80, unitType: UnitType.KG, minOrderQty: 10, stockQty: 500, supplierName: 'Andhra Spice Farms' },

    // Fruits
    { name: 'Apple', slug: 'apple', categoryId: fruits.id, pricePerUnit: 150, unitType: UnitType.KG, minOrderQty: 20, stockQty: 2000, supplierName: 'Kashmir Apple Orchards', isFeatured: true },
    { name: 'Banana', slug: 'banana', categoryId: fruits.id, pricePerUnit: 45, unitType: UnitType.DOZEN, minOrderQty: 50, stockQty: 5000, supplierName: 'Tamil Nadu Fruits' },
    { name: 'Orange', slug: 'orange', categoryId: fruits.id, pricePerUnit: 80, unitType: UnitType.KG, minOrderQty: 25, stockQty: 3000, supplierName: 'Nagpur Orange Farms' },
    { name: 'Mango', slug: 'mango', categoryId: fruits.id, pricePerUnit: 120, unitType: UnitType.KG, minOrderQty: 20, stockQty: 1500, supplierName: 'Ratnagiri Mango Farms' },
    { name: 'Grapes', slug: 'grapes', categoryId: fruits.id, pricePerUnit: 95, unitType: UnitType.KG, minOrderQty: 15, stockQty: 1000, supplierName: 'Nashik Vineyards' },

    // Spices
    { name: 'Turmeric', slug: 'turmeric', categoryId: spices.id, pricePerUnit: 180, unitType: UnitType.KG, minOrderQty: 10, stockQty: 500, supplierName: 'Erode Spice Co.', isFeatured: true },
    { name: 'Red Chili', slug: 'red-chili', categoryId: spices.id, pricePerUnit: 250, unitType: UnitType.KG, minOrderQty: 5, stockQty: 300, supplierName: 'Guntur Chili Traders' },
    { name: 'Cumin', slug: 'cumin', categoryId: spices.id, pricePerUnit: 350, unitType: UnitType.KG, minOrderQty: 5, stockQty: 200, supplierName: 'Gujarat Spices' },
    { name: 'Coriander', slug: 'coriander', categoryId: spices.id, pricePerUnit: 120, unitType: UnitType.KG, minOrderQty: 10, stockQty: 400, supplierName: 'Rajasthan Spices' },
    { name: 'Black Pepper', slug: 'black-pepper', categoryId: spices.id, pricePerUnit: 650, unitType: UnitType.KG, minOrderQty: 2, stockQty: 100, supplierName: 'Kerala Spice Gardens' },

    // Dairy
    { name: 'Milk', slug: 'milk', categoryId: dairy.id, pricePerUnit: 55, unitType: UnitType.LITER, minOrderQty: 50, stockQty: 2000, supplierName: 'Amul Dairy', isFeatured: true },
    { name: 'Butter', slug: 'butter', categoryId: dairy.id, pricePerUnit: 550, unitType: UnitType.KG, minOrderQty: 5, stockQty: 200, supplierName: 'Amul Dairy' },
    { name: 'Cheese', slug: 'cheese', categoryId: dairy.id, pricePerUnit: 450, unitType: UnitType.KG, minOrderQty: 5, stockQty: 150, supplierName: 'Britannia Industries' },
    { name: 'Ghee', slug: 'ghee', categoryId: dairy.id, pricePerUnit: 600, unitType: UnitType.KG, minOrderQty: 5, stockQty: 300, supplierName: 'Patanjali Foods' },
    { name: 'Yogurt', slug: 'yogurt', categoryId: dairy.id, pricePerUnit: 80, unitType: UnitType.KG, minOrderQty: 20, stockQty: 500, supplierName: 'Nestle India' },

    // Organic
    { name: 'Organic Rice', slug: 'organic-rice', categoryId: organic.id, pricePerUnit: 95, unitType: UnitType.KG, minOrderQty: 25, stockQty: 1000, isOrganic: true, supplierName: 'Organic India Farms', isFeatured: true },
    { name: 'Organic Vegetables Mix', slug: 'organic-vegetables', categoryId: organic.id, pricePerUnit: 120, unitType: UnitType.KG, minOrderQty: 10, stockQty: 500, isOrganic: true, supplierName: 'Green Valley Organics' },
    { name: 'Organic Fruits Mix', slug: 'organic-fruits', categoryId: organic.id, pricePerUnit: 200, unitType: UnitType.KG, minOrderQty: 10, stockQty: 300, isOrganic: true, supplierName: 'Nature Fresh Organics' },
  ];

  for (const product of productsData) {
    await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        categoryId: product.categoryId,
        pricePerUnit: product.pricePerUnit,
        unitType: product.unitType,
        minOrderQty: product.minOrderQty,
        stockQty: product.stockQty,
        supplierName: product.supplierName,
        isOrganic: product.isOrganic || false,
        isFeatured: product.isFeatured || false,
        description: `Premium quality ${product.name.toLowerCase()} available for wholesale orders. Minimum order: ${product.minOrderQty} ${product.unitType.toLowerCase()}.`,
        images: [],
      },
    });
  }

  // Create admin user
  console.log('👤 Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.create({
    data: {
      email: 'admin@agroorder.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
      emailVerified: true,
    },
  });

  console.log('\n✅ AgroOrder database seeded successfully!');
  console.log('\n📊 Created:');
  console.log('   - 6 categories');
  console.log(`   - ${productsData.length} products`);
  console.log('   - 1 admin user');
  console.log('   - Default settings');
  console.log('\n📧 Admin credentials:');
  console.log('   Email: admin@agroorder.com');
  console.log('   Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
