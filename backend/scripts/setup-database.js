const { execSync } = require('child_process');
const path = require('path');

console.log('🗄️  Setting up FinFusion database...\n');

try {
  // Check if Prisma is installed
  console.log('📦 Checking Prisma installation...');
  execSync('npx prisma --version', { stdio: 'pipe' });
  console.log('✅ Prisma is installed\n');

  // Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated\n');

  // Run database migrations
  console.log('🚀 Running database migrations...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  console.log('✅ Database migrations completed\n');

  // Seed the database
  console.log('🌱 Seeding database with default data...');
  execSync('npm run prisma:seed', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully\n');

  console.log('🎉 Database setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Update your .env file with the correct DATABASE_URL');
  console.log('2. Start the development server: npm run dev');
  console.log('3. Open Prisma Studio: npm run prisma:studio');

} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Make sure PostgreSQL is running');
  console.log('2. Check your DATABASE_URL in .env file');
  console.log('3. Ensure you have the correct permissions');
  process.exit(1);
}
