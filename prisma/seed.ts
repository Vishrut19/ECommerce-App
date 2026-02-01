import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // Create currencies
  console.log('📊 Creating currencies...');
  const currencies = await Promise.all([
    prisma.currency.upsert({
      where: { code: 'USD' },
      update: {},
      create: { code: 'USD', symbol: '$' },
    }),
    prisma.currency.upsert({
      where: { code: 'GBP' },
      update: {},
      create: { code: 'GBP', symbol: '£' },
    }),
    prisma.currency.upsert({
      where: { code: 'AUD' },
      update: {},
      create: { code: 'AUD', symbol: 'A$' },
    }),
    prisma.currency.upsert({
      where: { code: 'JPY' },
      update: {},
      create: { code: 'JPY', symbol: '¥' },
    }),
    prisma.currency.upsert({
      where: { code: 'RUB' },
      update: {},
      create: { code: 'RUB', symbol: '₽' },
    }),
  ]);
  console.log(`✅ Created ${currencies.length} currencies`);

  // Create categories
  console.log('📁 Creating categories...');
  const techCategory = await prisma.category.upsert({
    where: { name: 'tech' },
    update: {},
    create: { name: 'tech', title: 'Tech' },
  });

  const clothesCategory = await prisma.category.upsert({
    where: { name: 'clothes' },
    update: {},
    create: { name: 'clothes', title: 'Clothes' },
  });
  console.log('✅ Created 2 categories');

  // Create admin user
  console.log('👤 Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
      emailVerified: true,
    },
  });
  console.log('✅ Created admin user');

  // Helper function to create prices (for nested creation)
  const createPricesNested = (usdPrice: number) => {
    const rates = { USD: 1, GBP: 0.79, AUD: 1.52, JPY: 149.83, RUB: 92.5 };
    return Object.entries(rates).map(([code, rate]) => ({
      currencyCode: code,
      amount: parseFloat((usdPrice * rate).toFixed(2)),
    }));
  };

  // Helper function to create prices (for separate creation with productId)
  const createPrices = (productId: string, usdPrice: number) => {
    const rates = { USD: 1, GBP: 0.79, AUD: 1.52, JPY: 149.83, RUB: 92.5 };
    return Object.entries(rates).map(([code, rate]) => ({
      productId,
      currencyCode: code,
      amount: parseFloat((usdPrice * rate).toFixed(2)),
    }));
  };

  // Create sample products
  console.log('📦 Creating products...');
  
  // Tech Products
  const iphone = await prisma.product.create({
    data: {
      name: 'iPhone 12 Pro',
      brand: 'Apple',
      categoryId: techCategory.id,
      description: 'This is iPhone 12. Nothing else to say.',
      inStock: true,
      gallery: [
        'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-12-pro-family-hero?wid=940&hei=1112&fmt=jpeg&qlt=80&.v=1604021663000',
      ],
      prices: {
        create: createPricesNested(830),
      },
      attributes: {
        create: [
          {
            name: 'Capacity',
            type: 'text',
            items: {
              create: [
                { displayValue: '512G', value: '512G' },
                { displayValue: '1T', value: '1T' },
              ],
            },
          },
          {
            name: 'Color',
            type: 'swatch',
            items: {
              create: [
                { displayValue: 'Green', value: '#44FF03' },
                { displayValue: 'Cyan', value: '#03FFF7' },
                { displayValue: 'Blue', value: '#030BFF' },
                { displayValue: 'Black', value: '#000000' },
                { displayValue: 'White', value: '#FFFFFF' },
              ],
            },
          },
        ],
      },
    },
  });

  const ps5 = await prisma.product.create({
    data: {
      name: 'PlayStation 5',
      brand: 'Sony',
      categoryId: techCategory.id,
      description: '<p>A good gaming console. Plays games of PS4! Enjoy if you can buy it mwahahahaha</p>',
      inStock: false,
      gallery: [
        'https://images-na.ssl-images-amazon.com/images/I/510VSJ9mWDL._SL1262_.jpg',
        'https://images-na.ssl-images-amazon.com/images/I/610%2B69ZsKCL._SL1500_.jpg',
      ],
      prices: {
        create: createPricesNested(700),
      },
    },
  });

  // Clothes Products
  const huarache = await prisma.product.create({
    data: {
      name: 'Nike Air Huarache Le',
      brand: 'Nike x Stussy',
      categoryId: clothesCategory.id,
      description: '<p>Great sneakers for everyday use!</p>',
      inStock: true,
      gallery: [
        'https://cdn.shopify.com/s/files/1/0087/6193/3920/products/DD1381200_DEOA_2_720x.jpg?v=1612816087',
      ],
      prices: {
        create: createPricesNested(120),
      },
      attributes: {
        create: [
          {
            name: 'Size',
            type: 'text',
            items: {
              create: [
                { displayValue: '40', value: '40' },
                { displayValue: '41', value: '41' },
                { displayValue: '42', value: '42' },
                { displayValue: '43', value: '43' },
              ],
            },
          },
        ],
      },
    },
  });

  const jacket = await prisma.product.create({
    data: {
      name: 'Jacket',
      brand: 'Canada Goose',
      categoryId: clothesCategory.id,
      description: '<p>Awesome winter jacket</p>',
      inStock: true,
      gallery: [
        'https://images.canadagoose.com/image/upload/w_480,c_scale,f_auto,q_auto:best/v1576016105/product-image/2409L_61.jpg',
      ],
      prices: {
        create: createPricesNested(430),
      },
      attributes: {
        create: [
          {
            name: 'Size',
            type: 'text',
            items: {
              create: [
                { displayValue: 'Small', value: 'S' },
                { displayValue: 'Medium', value: 'M' },
                { displayValue: 'Large', value: 'L' },
                { displayValue: 'Extra Large', value: 'XL' },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Created 4 products');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📧 Admin credentials:');
  console.log('   Email: admin@example.com');
  console.log('   Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
