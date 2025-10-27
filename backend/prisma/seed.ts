/// <reference types="node" />
import { PrismaClient, CategoryType } from '@prisma/client';
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Define categories with proper parent-child relationships
const incomeCategories = [
  {
    name: 'Salary / Wages',
    type: CategoryType.INCOME,
    icon: '💼',
    color: '#4CAF50',
    isSystem: true,
    isEssential: true,
    subcategories: [
      { name: 'Base Salary', icon: '💰', color: '#4CAF50', isEssential: true },
      { name: 'Bonus / Incentives', icon: '🎯', color: '#FF9800', isEssential: true },
      { name: 'Overtime', icon: '⏰', color: '#2196F3', isEssential: true }
    ]
  },
  {
    name: 'Business / Freelance',
    type: CategoryType.INCOME,
    icon: '🏢',
    color: '#2196F3',
    isSystem: true,
    isEssential: true,
    subcategories: [
      { name: 'Client Payments', icon: '👔', color: '#2196F3', isEssential: true },
      { name: 'Side Projects', icon: '💡', color: '#9C27B0', isEssential: true },
      { name: 'Consulting', icon: '🤝', color: '#607D8B', isEssential: true }
    ]
  },
  {
    name: 'Investments',
    type: CategoryType.INCOME,
    icon: '📈',
    color: '#FF9800',
    isSystem: true,
    isEssential: true,
    subcategories: [
      { name: 'Dividends', icon: '💹', color: '#4CAF50', isEssential: true },
      { name: 'Capital Gains', icon: '📊', color: '#00BCD4', isEssential: true },
      { name: 'Interest from Deposits', icon: '🏦', color: '#4CAF50', isEssential: true }
    ]
  },
  {
    name: 'Rental Income',
    type: CategoryType.INCOME,
    icon: '🏠',
    color: '#9C27B0',
    isSystem: true,
    isEssential: true,
    subcategories: [
      { name: 'House Rent', icon: '🏘️', color: '#9C27B0', isEssential: true },
      { name: 'Equipment/Vehicle Rent', icon: '🚗', color: '#3F51B5', isEssential: true }
    ]
  },
  {
    name: 'Passive Income',
    type: CategoryType.INCOME,
    icon: '💸',
    color: '#00BCD4',
    isSystem: true,
    isEssential: true,
    subcategories: [
      { name: 'Royalties', icon: '📜', color: '#9C27B0', isEssential: true },
      { name: 'Affiliate Earnings', icon: '🔗', color: '#FF5722', isEssential: true },
      { name: 'Ad Revenue', icon: '📢', color: '#4CAF50', isEssential: true }
    ]
  },
  {
    name: 'Refunds / Cashbacks',
    type: CategoryType.INCOME,
    icon: '🔙',
    color: '#FF9800',
    isSystem: true,
    isEssential: false,
    subcategories: [
      { name: 'Bank / Credit Card Cashback', icon: '💳', color: '#4CAF50', isEssential: false },
      { name: 'Tax Refund', icon: '💵', color: '#2196F3', isEssential: true }
    ]
  },
  {
    name: 'Gifts / Others',
    type: CategoryType.INCOME,
    icon: '🎁',
    color: '#E91E63',
    isSystem: true,
    isEssential: false,
    subcategories: [
      { name: 'Monetary Gifts', icon: '💝', color: '#E91E63', isEssential: false },
      { name: 'Lottery / Windfall', icon: '🎰', color: '#FF5722', isEssential: false }
    ]
  }
];

const expenseCategories = [
  {
    name: 'Housing',
    type: CategoryType.EXPENSE,
    icon: '🏠',
    color: '#2196F3',
    isSystem: true,
    isEssential: true,
    subcategories: [
      { name: 'Rent / EMI', icon: '🏘️', color: '#2196F3', isEssential: true },
      { name: 'Property Tax', icon: '🏛️', color: '#FF9800', isEssential: true },
      { name: 'Home Maintenance', icon: '🔧', color: '#795548', isEssential: true },
      { name: 'Utilities (Water, Gas, Electricity)', icon: '⚡', color: '#FFC107', isEssential: true }
    ]
  },
  {
    name: 'Food & Groceries',
    type: CategoryType.EXPENSE,
    icon: '🍽️',
    color: '#F44336',
    isSystem: true,
    isEssential: true,
    subcategories: [
      { name: 'Groceries', icon: '🛒', color: '#4CAF50', isEssential: true },
      { name: 'Dining Out', icon: '🍽️', color: '#FF5722', isEssential: false },
      { name: 'Coffee / Snacks', icon: '☕', color: '#8D6E63', isEssential: false }
    ]
  },
  {
    name: 'Transportation',
    type: CategoryType.EXPENSE,
    icon: '🚗',
    color: '#3F51B5',
    isSystem: true,
    isEssential: true,
    subcategories: [
      { name: 'Fuel', icon: '⛽', color: '#FF5722', isEssential: true },
      { name: 'Public Transport', icon: '🚌', color: '#2196F3', isEssential: true },
      { name: 'Cab / Ride-hailing', icon: '🚕', color: '#FF9800', isEssential: false },
      { name: 'Vehicle Maintenance', icon: '🔧', color: '#607D8B', isEssential: true }
    ]
  },
  {
    name: 'Health & Fitness',
    type: CategoryType.EXPENSE,
    icon: '🏥',
    color: '#4CAF50',
    isSystem: true,
    isEssential: true,
    subcategories: [
      { name: 'Health Insurance', icon: '🛡️', color: '#2196F3', isEssential: true },
      { name: 'Medicines / Doctor Visits', icon: '💊', color: '#F44336', isEssential: true },
      { name: 'Gym Membership', icon: '💪', color: '#FF5722', isEssential: false },
      { name: 'Supplements', icon: '💊', color: '#9C27B0', isEssential: false }
    ]
  },
  {
    name: 'Personal Care',
    type: CategoryType.EXPENSE,
    icon: '💄',
    color: '#E91E63',
    isSystem: true,
    isEssential: true,
    subcategories: [
      { name: 'Haircuts / Grooming', icon: '✂️', color: '#795548', isEssential: true },
      { name: 'Beauty / Spa', icon: '✨', color: '#E91E63', isEssential: false }
    ]
  },
  {
    name: 'Communication',
    type: CategoryType.EXPENSE,
    icon: '📱',
    color: '#4CAF50',
    isSystem: true,
    isEssential: true,
    subcategories: [
      { name: 'Mobile Bill', icon: '📞', color: '#2196F3', isEssential: true },
      { name: 'Internet', icon: '🌐', color: '#00BCD4', isEssential: true },
      { name: 'Streaming Subscriptions', icon: '📺', color: '#9C27B0', isEssential: false }
    ]
  },
  {
    name: 'Finance',
    type: CategoryType.EXPENSE,
    icon: '💰',
    color: '#FF9800',
    isSystem: true,
    isEssential: true,
    subcategories: [
      { name: 'Loan EMI', icon: '📋', color: '#FF9800', isEssential: true },
      { name: 'Credit Card Bill', icon: '💳', color: '#2196F3', isEssential: true },
      { name: 'Bank Charges', icon: '🏦', color: '#607D8B', isEssential: true }
    ]
  },
  {
    name: 'Education / Learning',
    type: CategoryType.EXPENSE,
    icon: '📚',
    color: '#2196F3',
    isSystem: true,
    isEssential: true,
    subcategories: [
      { name: 'Courses / Certifications', icon: '🎓', color: '#2196F3', isEssential: true },
      { name: 'Books / Materials', icon: '📖', color: '#9C27B0', isEssential: true }
    ]
  },
  {
    name: 'Entertainment & Leisure',
    type: CategoryType.EXPENSE,
    icon: '🎬',
    color: '#FF5722',
    isSystem: true,
    isEssential: false,
    subcategories: [
      { name: 'Movies / OTT', icon: '🎥', color: '#E91E63', isEssential: false },
      { name: 'Gaming', icon: '🎮', color: '#9C27B0', isEssential: false },
      { name: 'Hobbies', icon: '🎨', color: '#FF9800', isEssential: false }
    ]
  },
  {
    name: 'Shopping',
    type: CategoryType.EXPENSE,
    icon: '🛍️',
    color: '#E91E63',
    isSystem: true,
    isEssential: false,
    subcategories: [
      { name: 'Clothes', icon: '👕', color: '#E91E63', isEssential: false },
      { name: 'Electronics', icon: '💻', color: '#607D8B', isEssential: false },
      { name: 'Accessories', icon: '👔', color: '#795548', isEssential: false }
    ]
  },
  {
    name: 'Travel',
    type: CategoryType.EXPENSE,
    icon: '✈️',
    color: '#00BCD4',
    isSystem: true,
    isEssential: false,
    subcategories: [
      { name: 'Flights / Train / Bus', icon: '✈️', color: '#2196F3', isEssential: false },
      { name: 'Hotel / Stay', icon: '🏨', color: '#4CAF50', isEssential: false },
      { name: 'Local Experiences', icon: '🎪', color: '#FF9800', isEssential: false }
    ]
  },
  {
    name: 'Gifts & Donations',
    type: CategoryType.EXPENSE,
    icon: '🎁',
    color: '#9C27B0',
    isSystem: true,
    isEssential: true,
    subcategories: [
      { name: 'Charity', icon: '❤️', color: '#F44336', isEssential: true },
      { name: 'Gifts to Friends / Family', icon: '🎁', color: '#E91E63', isEssential: false }
    ]
  },
  {
    name: 'Household Items',
    type: CategoryType.EXPENSE,
    icon: '🏠',
    color: '#8BC34A',
    isSystem: true,
    isEssential: true,
    subcategories: [
      { name: 'Cleaning Supplies', icon: '🧹', color: '#4CAF50', isEssential: true },
      { name: 'Furniture', icon: '🪑', color: '#795548', isEssential: false }
    ]
  },
  {
    name: 'Taxes',
    type: CategoryType.EXPENSE,
    icon: '📋',
    color: '#FF5722',
    isSystem: true,
    isEssential: true,
    subcategories: [
      { name: 'Income Tax', icon: '💵', color: '#FF5722', isEssential: true },
      { name: 'Property Tax', icon: '🏛️', color: '#FF9800', isEssential: true }
    ]
  },
  {
    name: 'Savings & Investments',
    type: CategoryType.EXPENSE,
    icon: '💎',
    color: '#4CAF50',
    isSystem: true,
    isEssential: true,
    subcategories: [
      { name: 'Fixed Deposits', icon: '🏦', color: '#4CAF50', isEssential: true },
      { name: 'Mutual Funds', icon: '📈', color: '#2196F3', isEssential: true },
      { name: 'Stock Investments', icon: '📊', color: '#FF9800', isEssential: true }
    ]
  },
  {
    name: 'Emergency Fund / Insurance',
    type: CategoryType.EXPENSE,
    icon: '🛡️',
    color: '#2196F3',
    isSystem: true,
    isEssential: true,
    subcategories: [
      { name: 'Life Insurance', icon: '🛡️', color: '#2196F3', isEssential: true },
      { name: 'Emergency Savings', icon: '💰', color: '#4CAF50', isEssential: true }
    ]
  },
  {
    name: 'Pets',
    type: CategoryType.EXPENSE,
    icon: '🐾',
    color: '#FF9800',
    isSystem: true,
    isEssential: false,
    subcategories: [
      { name: 'Food / Vet', icon: '🐕', color: '#FF9800', isEssential: false },
      { name: 'Accessories', icon: '🧸', color: '#9E9E9E', isEssential: false }
    ]
  },
  {
    name: 'Miscellaneous',
    type: CategoryType.EXPENSE,
    icon: '📝',
    color: '#9E9E9E',
    isSystem: true,
    isEssential: false,
    subcategories: [
      { name: 'Unplanned Expenses', icon: '❓', color: '#9E9E9E', isEssential: false }
    ]
  },
  {
    name: 'Transfer',
    type: CategoryType.EXPENSE,
    icon: '🔄',
    color: '#6B7280',
    isSystem: true,
    isEssential: false,
    subcategories: []
  }
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default admin user
  console.log('👤 Creating default admin user...');
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@finfusion.com' },
    update: {},
    create: {
      email: 'admin@finfusion.com',
      username: 'admin',
      name: 'System Administrator',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log(`🔑 Admin user created with email: admin@finfusion.com`);
  console.log(`🔑 Admin username: admin`);
  console.log(`🔑 Admin password: ${adminPassword}`);

  // Delete all existing system categories to start fresh
  console.log('🗑️ Removing old system categories...');
  await prisma.category.deleteMany({ where: { isSystem: true } });
  console.log('✅ Old categories removed');

  // Create income categories
  console.log('📂 Creating income categories...');
  for (const categoryData of incomeCategories) {
    const created = await prisma.category.upsert({
      where: {
        name_type: {
          name: categoryData.name,
          type: categoryData.type
        }
      },
      update: {
        icon: categoryData.icon,
        color: categoryData.color,
        isSystem: categoryData.isSystem,
        isEssential: categoryData.isEssential
      },
      create: {
        name: categoryData.name,
        type: categoryData.type,
        icon: categoryData.icon,
        color: categoryData.color,
        isSystem: categoryData.isSystem,
        isEssential: categoryData.isEssential
      }
    });

    // Create subcategories
    for (const subcategoryData of categoryData.subcategories) {
      const subcategoryName = `${categoryData.name} - ${subcategoryData.name}`;
      await prisma.category.upsert({
        where: {
          name_type: {
            name: subcategoryName,
            type: categoryData.type
          }
        },
        update: {
          icon: subcategoryData.icon,
          color: subcategoryData.color,
          isSystem: categoryData.isSystem,
          isEssential: subcategoryData.isEssential,
          parentCategoryId: created.id
        },
        create: {
          name: subcategoryName,
          type: categoryData.type,
          icon: subcategoryData.icon,
          color: subcategoryData.color,
          isSystem: categoryData.isSystem,
          isEssential: subcategoryData.isEssential,
          parentCategoryId: created.id
        }
      });
    }
  }
  console.log(`✅ Created ${incomeCategories.length} income categories with subcategories`);

  // Create expense categories
  console.log('📂 Creating expense categories...');
  for (const categoryData of expenseCategories) {
    const created = await prisma.category.upsert({
      where: {
        name_type: {
          name: categoryData.name,
          type: categoryData.type
        }
      },
      update: {
        icon: categoryData.icon,
        color: categoryData.color,
        isSystem: categoryData.isSystem,
        isEssential: categoryData.isEssential
      },
      create: {
        name: categoryData.name,
        type: categoryData.type,
        icon: categoryData.icon,
        color: categoryData.color,
        isSystem: categoryData.isSystem,
        isEssential: categoryData.isEssential
      }
    });

    // Create subcategories
    for (const subcategoryData of categoryData.subcategories) {
      const subcategoryName = `${categoryData.name} - ${subcategoryData.name}`;
      await prisma.category.upsert({
        where: {
          name_type: {
            name: subcategoryName,
            type: categoryData.type
          }
        },
        update: {
          icon: subcategoryData.icon,
          color: subcategoryData.color,
          isSystem: categoryData.isSystem,
          isEssential: subcategoryData.isEssential,
          parentCategoryId: created.id
        },
        create: {
          name: subcategoryName,
          type: categoryData.type,
          icon: subcategoryData.icon,
          color: subcategoryData.color,
          isSystem: categoryData.isSystem,
          isEssential: subcategoryData.isEssential,
          parentCategoryId: created.id
        }
      });
    }
  }
  console.log(`✅ Created ${expenseCategories.length} expense categories with subcategories`);

  // Create default payment methods
  console.log('💳 Creating default payment methods...');
  
  const defaultPaymentMethods = [
    { code: 'CASH', name: 'Cash', description: 'Physical cash transactions' },
    { code: 'CARD', name: 'Card', description: 'Credit or debit card payments' },
    { code: 'BANK_TRANSFER', name: 'Bank Transfer', description: 'Direct bank transfers' },
    { code: 'DIGITAL_WALLET', name: 'Digital Wallet', description: 'Mobile payment apps like Apple Pay, Google Pay' },
    { code: 'UPI', name: 'UPI', description: 'Unified Payments Interface' },
    { code: 'OTHER', name: 'Other', description: 'Other payment methods' }
  ];

  for (const paymentMethodData of defaultPaymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { code: paymentMethodData.code },
      update: paymentMethodData,
      create: paymentMethodData
    });
  }

  console.log(`✅ Created ${defaultPaymentMethods.length} default payment methods`);

  // Create default Cash accounts for all existing users
  console.log('💳 Creating default Cash accounts for all users...');
  
  const users = await prisma.user.findMany({
    where: { isActive: true }
  });

  for (const user of users) {
    // Check if user already has a Cash account
    const existingCashAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        type: 'CASH'
      }
    });

    if (!existingCashAccount) {
      await prisma.account.create({
        data: {
          userId: user.id,
          name: 'Cash',
          type: 'CASH',
          balance: 0,
          currency: 'USD',
          isActive: true
        }
      });
      console.log(`✅ Created default Cash account for user: ${user.email}`);
    }
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });