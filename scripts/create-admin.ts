import 'dotenv/config';
import { auth } from '../lib/auth';
import prisma from '../lib/prisma';

async function createAdminViaBetterAuth() {
  try {
    console.log('🔧 Creating admin user via Better Auth API...\n');

    // First delete any existing admin user and their accounts to start fresh
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
    });

    if (existingUser) {
      console.log('ℹ️  Cleaning up existing admin user...');
      await prisma.account.deleteMany({ where: { userId: existingUser.id } });
      await prisma.session.deleteMany({ where: { userId: existingUser.id } });
      await prisma.user.delete({ where: { id: existingUser.id } });
      console.log('✅ Existing admin user deleted\n');
    }

    // Use Better Auth's signUpEmail API to create user with proper password hashing
    console.log('Creating user with Better Auth signUpEmail API...');
    
    const result = await auth.api.signUpEmail({
      body: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
      },
    });

    console.log('✅ User created via Better Auth!');

    // Now update the user's role to admin
    await prisma.user.update({
      where: { email: 'admin@example.com' },
      data: { role: 'admin' },
    });

    console.log('✅ User role updated to admin');

    console.log('\n📧 Admin credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('\n✅ You can now log in at http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminViaBetterAuth();
