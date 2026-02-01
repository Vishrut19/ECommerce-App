import { auth } from '../lib/auth';

async function initDatabase() {
  try {
    console.log('🔧 Initializing Better Auth database...');
    
    // Initialize the database tables
    await auth.api.createUser({
      body: {
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
      },
    });

    console.log('✅ Database initialized successfully!');
    console.log('📧 Admin Email: admin@example.com');
    console.log('🔑 Admin Password: admin123');
    console.log('\n✨ You can now login at /admin/login');
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('ℹ️  Admin user already exists');
    } else {
      console.error('❌ Error initializing database:', error);
    }
  }
  process.exit(0);
}

initDatabase();
