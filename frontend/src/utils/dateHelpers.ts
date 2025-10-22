// Get start of month
export const getStartOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

// Get end of month
export const getEndOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

// Get start of year
export const getStartOfYear = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), 0, 1);
};

// Get end of year
export const getEndOfYear = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
};

// Get date range for period
export const getDateRangeForPeriod = (
  period: 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'last_30_days' | 'last_90_days'
): { startDate: Date; endDate: Date } => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case 'this_month':
      startDate = getStartOfMonth(now);
      endDate = getEndOfMonth(now);
      break;
    case 'last_month':
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      startDate = getStartOfMonth(lastMonth);
      endDate = getEndOfMonth(lastMonth);
      break;
    case 'this_year':
      startDate = getStartOfYear(now);
      endDate = getEndOfYear(now);
      break;
    case 'last_year':
      const lastYear = new Date(now.getFullYear() - 1, 0, 1);
      startDate = getStartOfYear(lastYear);
      endDate = getEndOfYear(lastYear);
      break;
    case 'last_30_days':
      endDate = now;
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'last_90_days':
      endDate = now;
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = getStartOfMonth(now);
      endDate = getEndOfMonth(now);
  }

  return { startDate, endDate };
};

// Format date to ISO string for API
export const toISODateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Parse ISO date string
export const parseISODate = (dateString: string): Date => {
  return new Date(dateString);
};

// Add days to date
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Add months to date
export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

// Get month name
export const getMonthName = (date: Date, format: 'short' | 'long' = 'long'): string => {
  return date.toLocaleString('en-US', { month: format });
};

// Get day name
export const getDayName = (date: Date, format: 'short' | 'long' = 'long'): string => {
  return date.toLocaleString('en-US', { weekday: format });
};

