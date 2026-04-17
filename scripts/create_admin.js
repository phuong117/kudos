const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'support@ncsgroup.vn';
  const name = 'admin';
  const password = 'admin';

  console.log('Checking for existing admin...');
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log('Admin user already exists.');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('Creating admin user...');
  await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'ADMIN',
      total_points: 1000,
    }
  });

  console.log('-----------------------------------------');
  console.log('Admin user created successfully!');
  console.log('Email: ' + email);
  console.log('Password: ' + password);
  console.log('-----------------------------------------');
}

main()
  .catch((e) => {
    console.error('Error creating admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
