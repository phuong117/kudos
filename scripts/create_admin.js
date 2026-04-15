const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'support@ncsgroup.vn';
  const password = await bcrypt.hash('Kudos@12!@#$', 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      password,
    },
    create: {
      email,
      name: 'System Administrator',
      password,
      role: 'ADMIN',
      total_points: 9999
    }
  });

  console.log('Account created successfully:');
  console.log('Email: ' + user.email);
  console.log('Password: Kudos@12!@#$');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
