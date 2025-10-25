const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migratePaymentMethods() {
  console.log('Starting payment methods migration...');
  
  try {
    // First, create the payment methods
    const paymentMethods = [
      { code: 'CASH', name: 'Cash', description: 'Physical cash transactions' },
      { code: 'CARD', name: 'Card', description: 'Credit or debit card transactions' },
      { code: 'BANK_TRANSFER', name: 'Bank Transfer', description: 'Direct bank transfers' },
      { code: 'DIGITAL_WALLET', name: 'Digital Wallet', description: 'Digital wallet payments (PayPal, Apple Pay, etc.)' },
      { code: 'UPI', name: 'UPI', description: 'Unified Payments Interface transactions' },
      { code: 'OTHER', name: 'Other', description: 'Other payment methods' }
    ];

    const createdMethods = {};
    for (const method of paymentMethods) {
      const created = await prisma.paymentMethod.upsert({
        where: { code: method.code },
        update: method,
        create: method
      });
      createdMethods[method.code] = created.id;
      console.log(`✓ Created/Updated payment method: ${method.name} (${created.id})`);
    }

    // Since we changed the schema, we need to handle this differently
    // The old paymentMethod enum field has been replaced with paymentMethodId
    // We'll need to manually update any existing transactions if they exist
    
    console.log('Payment methods created successfully!');
    console.log('Note: Existing transactions will need to be updated manually if they had payment methods.');
    console.log('You can now use the new payment method system.');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migratePaymentMethods();
