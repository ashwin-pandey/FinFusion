const { recurringTransactionJob } = require('./recurringTransactions');

// Start the recurring transaction job
console.log('Starting recurring transaction cron job...');
recurringTransactionJob.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Stopping recurring transaction cron job...');
  recurringTransactionJob.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Stopping recurring transaction cron job...');
  recurringTransactionJob.stop();
  process.exit(0);
});

console.log('Recurring transaction cron job started successfully!');


