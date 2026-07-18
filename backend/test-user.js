const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('./src/generated/prisma/client');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

prisma.user.findUnique({ where: { id: 'fddfbcf9-848d-4954-93a3-0e02639e23e5' } })
  .then(console.log)
  .catch(console.error)
  .finally(() => prisma.$disconnect());