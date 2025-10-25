const { CronService } = require('../services/CronService');

// Run every day at 2:00 AM
const cron = require('node-cron');

// Schedule recurring transaction processing
const recurringTransactionJob = cron.schedule('0 2 * * *', async () => {
  console.log('Running scheduled recurring transaction processing...');
  try {
    await CronService.processRecurringTransactions();
    console.log('Recurring transaction processing completed successfully.');
  } catch (error) {
    console.error('Error in scheduled recurring transaction processing:', error);
  }
}, {
  scheduled: false, // Don't start automatically
  timezone: "UTC"
});

module.exports = {
  recurringTransactionJob
};


