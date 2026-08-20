const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  // 1. Akun HRD / Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hris.com' },
    update: {},
    create: {
      name: 'HRD Administrator',
      email: 'admin@hris.com',
      password: hashedPassword,
      role: 'HRD',
      nik: '1001',
    },
  });

  // 2. Akun Karyawan
  const employee = await prisma.user.upsert({
    where: { email: 'karyawan@hris.com' },
    update: {},
    create: {
      name: 'Friska Aulia',
      email: 'karyawan@hris.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      nik: '2001',
    },
  });

  console.log('✅ Seed berhasil! Akun uji coba dibuat:');
  console.log('Admin:', admin.email);
  console.log('Karyawan:', employee.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });