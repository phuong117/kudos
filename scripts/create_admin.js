const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'support@ncsgroup.vn';
  const name = 'admin';
  const password = 'Kudos@12!@#$';

  console.log('Checking for existing admin...');
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log('User already exists. Updating password and role...');
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
        name: name
      }
    });
    console.log('Admin user updated successfully.');
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Creating new admin user...');
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'ADMIN',
        total_points: 1000
      }
    });
    console.log('Admin user created successfully.');
  }

  console.log('-----------------------------------------');
  console.log('Account Info:');
  console.log('Email: ' + email);
  console.log('Password: ' + password);
  console.log('Role: ADMIN');
  console.log('-----------------------------------------');
}

main()
  .catch((e) => {
    console.error('Error managing admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
