const { recurringTransactionJob } = require('./recurringTransactions');
const { loanPaymentJob } = require('./loanPayments');

// Start the recurring transaction job
console.log('Starting recurring transaction cron job...');
recurringTransactionJob.start();

// Start the loan payment job
console.log('Starting loan payment cron job...');
loanPaymentJob.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Stopping cron jobs...');
  recurringTransactionJob.stop();
  loanPaymentJob.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Stopping cron jobs...');
  recurringTransactionJob.stop();
  loanPaymentJob.stop();
  process.exit(0);
});

console.log('Recurring transaction cron job started successfully!');


