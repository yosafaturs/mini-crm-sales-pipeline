import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Hapus data lama
  await prisma.interactionLog.deleteMany({});
  await prisma.deal.deleteMany({});
  await prisma.user.deleteMany({});

  // Buat user admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@crm.com',
      name: 'Alice Manager (Admin)',
      passwordHash: '$2b$10$P8KvYF.z4XjK8MlV0kP.juI1t9XW5Y8iQ7nL3fG2hJ4kR6tY7uW9',
      role: 'ADMIN_MANAGER',
    },
  });

  // Buat user sales
  const alice = await prisma.user.create({
    data: {
      email: 'alice@crm.com',
      name: 'Alice Rep (Sales)',
      passwordHash: '$2b$10$P8KvYF.z4XjK8MlV0kP.juI1t9XW5Y8iQ7nL3fG2hJ4kR6tY7uW9',
      role: 'SALES_EXECUTIVE',
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@crm.com',
      name: 'Bob Rep (Sales)',
      passwordHash: '$2b$10$P8KvYF.z4XjK8MlV0kP.juI1t9XW5Y8iQ7nL3fG2hJ4kR6tY7uW9',
      role: 'SALES_EXECUTIVE',
    },
  });

  // Buat beberapa deal contoh (pakai string literal untuk stage)
  await prisma.deal.createMany({
    data: [
      {
        title: 'PT Maju Jaya',
        description: 'Software development project',
        value: 150000000,
        stage: 'LEAD_ACQUIRED',
        assignedUserId: alice.id,
        createdById: admin.id,
      },
      {
        title: 'PT Sejahtera',
        description: 'Cloud migration',
        value: 250000000,
        stage: 'CONTACTED',
        assignedUserId: alice.id,
        createdById: admin.id,
      },
      {
        title: 'PT Makmur',
        description: 'E-commerce platform',
        value: 500000000,
        stage: 'PROPOSAL_SENT',
        assignedUserId: bob.id,
        createdById: admin.id,
      },
      {
        title: 'PT Berkah',
        description: 'Mobile app development',
        value: 75000000,
        stage: 'NEGOTIATION',
        assignedUserId: bob.id,
        createdById: admin.id,
      },
      {
        title: 'PT Sukses',
        description: 'Data analytics system',
        value: 300000000,
        stage: 'CLOSED_WON',
        assignedUserId: alice.id,
        createdById: admin.id,
      },
      {
        title: 'PT Abadi',
        description: 'IoT solution',
        value: 100000000,
        stage: 'CLOSED_LOST',
        assignedUserId: alice.id,
        createdById: admin.id,
      },
    ],
  });

  // Buat beberapa interaksi contoh
  const majuJaya = await prisma.deal.findFirst({ where: { title: 'PT Maju Jaya' } });
  if (majuJaya) {
    await prisma.interactionLog.createMany({
      data: [
        {
          dealId: majuJaya.id,
          type: 'CALL',
          notes: 'Initial call with client',
          createdById: alice.id,
        },
        {
          dealId: majuJaya.id,
          type: 'EMAIL',
          notes: 'Sent proposal document',
          createdById: alice.id,
        },
      ],
    });
  }

  console.log('✅ Seed completed! Users:', { admin: admin.email, alice: alice.email, bob: bob.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());