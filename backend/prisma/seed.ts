import { PrismaClient, Role, DealStage, InteractionType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database...');
  await prisma.interactionLog.deleteMany({});
  await prisma.deal.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@crm.com',
      name: 'Alice Manager (Admin)',
      passwordHash,
      role: Role.ADMIN_MANAGER,
    },
  });

  const sales1 = await prisma.user.create({
    data: {
      email: 'bob@crm.com',
      name: 'Bob Rep (Sales)',
      passwordHash,
      role: Role.SALES_EXECUTIVE,
    },
  });

  const sales2 = await prisma.user.create({
    data: {
      email: 'carol@crm.com',
      name: 'Carol Rep (Sales)',
      passwordHash,
      role: Role.SALES_EXECUTIVE,
    },
  });

  console.log('Seeding deals...');
  const deal1 = await prisma.deal.create({
    data: {
      title: 'Acme Enterprise License',
      description: 'Annual SaaS subscription renewal for 500 seats',
      value: 45000,
      stage: DealStage.PROPOSAL_SENT,
      assignedUserId: sales1.id,
      createdById: admin.id,
    },
  });

  const deal2 = await prisma.deal.create({
    data: {
      title: 'Stark Industries Expansion',
      description: 'Custom CRM integration & premium onboarding',
      value: 120000,
      stage: DealStage.NEGOTIATION,
      assignedUserId: sales1.id,
      createdById: admin.id,
    },
  });

  const deal3 = await prisma.deal.create({
    data: {
      title: 'Wayne Enterprises Pilot',
      description: 'Security & compliance module trial',
      value: 25000,
      stage: DealStage.LEAD_ACQUIRED,
      assignedUserId: sales2.id,
      createdById: admin.id,
    },
  });

  const deal4 = await prisma.deal.create({
    data: {
      title: 'Cyberdyne Systems Portal',
      description: 'Automation API setup and SLA package',
      value: 85000,
      stage: DealStage.CLOSED_WON,
      assignedUserId: sales2.id,
      createdById: admin.id,
    },
  });

  const deal5 = await prisma.deal.create({
    data: {
      title: 'Umbrella Corp Upgrade',
      description: 'Legacy database migration contract (Stale deal)',
      value: 60000,
      stage: DealStage.CONTACTED,
      assignedUserId: sales1.id,
      createdById: admin.id,
      // Created 10 days ago to trigger stale cron worker test
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('Seeding interaction logs...');
  await prisma.interactionLog.createMany({
    data: [
      {
        dealId: deal1.id,
        type: InteractionType.CALL,
        notes: 'Initial discovery call with VP of Engineering. Very positive feedback.',
        createdById: sales1.id,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        dealId: deal1.id,
        type: InteractionType.EMAIL,
        notes: 'Sent formal proposal breakdown and pricing calculator PDF.',
        createdById: sales1.id,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        dealId: deal2.id,
        type: InteractionType.MEETING,
        notes: 'Executive alignment meeting with CTO & Procurement team.',
        createdById: sales1.id,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        dealId: deal5.id,
        type: InteractionType.NOTE,
        notes: 'Initial contact made via LinkedIn, waiting on response.',
        createdById: sales1.id,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // >4 days ago!
      },
    ],
  });

  console.log('Seed completed successfully!');
  console.log(`Admin user: admin@crm.com / password123`);
  console.log(`Sales user 1: bob@crm.com / password123`);
  console.log(`Sales user 2: carol@crm.com / password123`);
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
