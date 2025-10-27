const cron = require('node-cron');
const { LoanSchedulerService } = require('../services/LoanSchedulerService');

// Run daily at 9:00 AM to process scheduled loan payments
const loanPaymentJob = cron.schedule('0 9 * * *', async () => {
  console.log('Running scheduled loan payment job...');
  try {
    await LoanSchedulerService.processScheduledPayments();
  } catch (error) {
    console.error('Error in loan payment cron job:', error);
  }
}, {
  scheduled: false,
  timezone: 'UTC'
});

module.exports = {
  loanPaymentJob
};
