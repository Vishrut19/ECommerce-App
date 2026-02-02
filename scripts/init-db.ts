import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

async function initDatabase() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🔧 Initializing AgroOrder database...\n');

    // Check connection
    console.log('📡 Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful!\n');

    // Check if tables exist
    console.log('📊 Checking database tables...');
    
    const tableCheck = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'categories'
      );
    `;

    if (!tableCheck[0]?.exists) {
      console.log('⚠️  Tables not found. Please run: npx prisma migrate dev');
      console.log('   This will create all necessary tables.\n');
      process.exit(1);
    }

    console.log('✅ Database tables exist!\n');

    // Check for seed data
    const categoryCount = await prisma.category.count();
    const productCount = await prisma.product.count();
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });

    console.log('📈 Current data:');
    console.log(`   - Categories: ${categoryCount}`);
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Admin users: ${adminCount}\n`);

    if (categoryCount === 0 || productCount === 0) {
      console.log('💡 Tip: Run "npx prisma db seed" to populate sample data\n');
    }

    if (adminCount === 0) {
      console.log('⚠️  No admin user found!');
      console.log('   Run "npx prisma db seed" to create an admin user');
      console.log('   Or manually create one in Supabase Auth Dashboard\n');
    }

    console.log('✅ Database initialization complete!\n');
    console.log('📋 Next steps:');
    console.log('   1. If no data exists, run: npx prisma db seed');
    console.log('   2. Start the dev server: npm run dev');
    console.log('   3. Access admin panel: http://localhost:3000/admin');

  } catch (error: any) {
    console.error('❌ Error initializing database:', error.message);
    
    if (error.message?.includes('ECONNREFUSED')) {
      console.log('\n💡 Tip: Make sure your database is running and DATABASE_URL is correct');
    }
    
    if (error.message?.includes('does not exist')) {
      console.log('\n💡 Tip: Run "npx prisma migrate dev" to create the database tables');
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }

  process.exit(0);
}

initDatabase();
