/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  // Income Categories
  {
    name: 'Salary',
    type: 'INCOME',
    icon: '💼',
    color: '#4CAF50',
    isSystem: true
  },
  {
    name: 'Freelance',
    type: 'INCOME',
    icon: '💻',
    color: '#2196F3',
    isSystem: true
  },
  {
    name: 'Investment',
    type: 'INCOME',
    icon: '📈',
    color: '#FF9800',
    isSystem: true
  },
  {
    name: 'Business',
    type: 'INCOME',
    icon: '🏢',
    color: '#9C27B0',
    isSystem: true
  },
  {
    name: 'Other Income',
    type: 'INCOME',
    icon: '💰',
    color: '#607D8B',
    isSystem: true
  },

  // Expense Categories
  {
    name: 'Food & Dining',
    type: 'EXPENSE',
    icon: '🍽️',
    color: '#F44336',
    isSystem: true
  },
  {
    name: 'Transportation',
    type: 'EXPENSE',
    icon: '🚗',
    color: '#3F51B5',
    isSystem: true
  },
  {
    name: 'Shopping',
    type: 'EXPENSE',
    icon: '🛍️',
    color: '#E91E63',
    isSystem: true
  },
  {
    name: 'Entertainment',
    type: 'EXPENSE',
    icon: '🎬',
    color: '#FF5722',
    isSystem: true
  },
  {
    name: 'Bills & Utilities',
    type: 'EXPENSE',
    icon: '⚡',
    color: '#FFC107',
    isSystem: true
  },
  {
    name: 'Healthcare',
    type: 'EXPENSE',
    icon: '🏥',
    color: '#4CAF50',
    isSystem: true
  },
  {
    name: 'Education',
    type: 'EXPENSE',
    icon: '📚',
    color: '#2196F3',
    isSystem: true
  },
  {
    name: 'Travel',
    type: 'EXPENSE',
    icon: '✈️',
    color: '#00BCD4',
    isSystem: true
  },
  {
    name: 'Personal Care',
    type: 'EXPENSE',
    icon: '💄',
    color: '#E91E63',
    isSystem: true
  },
  {
    name: 'Home & Garden',
    type: 'EXPENSE',
    icon: '🏠',
    color: '#8BC34A',
    isSystem: true
  },
  {
    name: 'Technology',
    type: 'EXPENSE',
    icon: '💻',
    color: '#607D8B',
    isSystem: true
  },
  {
    name: 'Sports & Fitness',
    type: 'EXPENSE',
    icon: '🏃',
    color: '#FF9800',
    isSystem: true
  },
  {
    name: 'Gifts & Donations',
    type: 'EXPENSE',
    icon: '🎁',
    color: '#9C27B0',
    isSystem: true
  },
  {
    name: 'Insurance',
    type: 'EXPENSE',
    icon: '🛡️',
    color: '#795548',
    isSystem: true
  },
  {
    name: 'Taxes',
    type: 'EXPENSE',
    icon: '📋',
    color: '#FF5722',
    isSystem: true
  },
  {
    name: 'Other Expenses',
    type: 'EXPENSE',
    icon: '📝',
    color: '#9E9E9E',
    isSystem: true
  }
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default categories
  console.log('📂 Creating default categories...');
  
  for (const categoryData of defaultCategories) {
    await prisma.category.upsert({
      where: {
        name_type: {
          name: categoryData.name,
          type: categoryData.type
        }
      },
      update: categoryData,
      create: categoryData
    });
  }

  console.log(`✅ Created ${defaultCategories.length} default categories`);

  // Create some sample subcategories for Food & Dining
  const foodCategory = await prisma.category.findFirst({
    where: { name: 'Food & Dining', isSystem: true }
  });

  if (foodCategory) {
    const foodSubcategories = [
      { name: 'Groceries', icon: '🛒', color: '#4CAF50' },
      { name: 'Restaurants', icon: '🍽️', color: '#FF5722' },
      { name: 'Coffee & Snacks', icon: '☕', color: '#8D6E63' },
      { name: 'Fast Food', icon: '🍔', color: '#FF9800' }
    ];

    for (const subcategoryData of foodSubcategories) {
      await prisma.category.upsert({
        where: {
          name_type: {
            name: subcategoryData.name,
            type: 'EXPENSE'
          }
        },
        update: {
          ...subcategoryData,
          parentCategoryId: foodCategory.id,
          isSystem: true
        },
        create: {
          ...subcategoryData,
          type: 'EXPENSE',
          parentCategoryId: foodCategory.id,
          isSystem: true
        }
      });
    }

    console.log(`✅ Created ${foodSubcategories.length} food subcategories`);
  }

  // Create some sample subcategories for Transportation
  const transportCategory = await prisma.category.findFirst({
    where: { name: 'Transportation', isSystem: true }
  });

  if (transportCategory) {
    const transportSubcategories = [
      { name: 'Gas', icon: '⛽', color: '#FF5722' },
      { name: 'Public Transport', icon: '🚌', color: '#2196F3' },
      { name: 'Rideshare', icon: '🚗', color: '#4CAF50' },
      { name: 'Parking', icon: '🅿️', color: '#FF9800' },
      { name: 'Car Maintenance', icon: '🔧', color: '#607D8B' }
    ];

    for (const subcategoryData of transportSubcategories) {
      await prisma.category.upsert({
        where: {
          name_type: {
            name: subcategoryData.name,
            type: 'EXPENSE'
          }
        },
        update: {
          ...subcategoryData,
          parentCategoryId: transportCategory.id,
          isSystem: true
        },
        create: {
          ...subcategoryData,
          type: 'EXPENSE',
          parentCategoryId: transportCategory.id,
          isSystem: true
        }
      });
    }

    console.log(`✅ Created ${transportSubcategories.length} transportation subcategories`);
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
