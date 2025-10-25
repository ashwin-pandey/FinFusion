const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const paymentMethods = [
  {
    code: 'CASH',
    name: 'Cash',
    description: 'Physical cash transactions'
  },
  {
    code: 'CARD',
    name: 'Card',
    description: 'Credit or debit card transactions'
  },
  {
    code: 'BANK_TRANSFER',
    name: 'Bank Transfer',
    description: 'Direct bank transfers'
  },
  {
    code: 'DIGITAL_WALLET',
    name: 'Digital Wallet',
    description: 'Digital wallet payments (PayPal, Apple Pay, etc.)'
  },
  {
    code: 'UPI',
    name: 'UPI',
    description: 'Unified Payments Interface transactions'
  },
  {
    code: 'OTHER',
    name: 'Other',
    description: 'Other payment methods'
  }
];

async function seedPaymentMethods() {
  console.log('Seeding payment methods...');
  
  for (const method of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { code: method.code },
      update: method,
      create: method
    });
    console.log(`✓ Seeded payment method: ${method.name}`);
  }
  
  console.log('Payment methods seeded successfully!');
}

seedPaymentMethods()
  .catch((e) => {
    console.error('Error seeding payment methods:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


